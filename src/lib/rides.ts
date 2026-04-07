import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db'
import { requireServerSession } from '#/lib/auth-session'

const createRideInput = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.iso.datetime(),
  seats: z.int().positive(),
  price: z.number().nonnegative(),
  type: z.enum(['SHARED', 'EXCLUSIVE']),
  description: z.string().optional(),
})

export const createRide = createServerFn({ method: 'POST' })
  .inputValidator(createRideInput)
  .handler(async ({ data }) => {
    const session = await requireServerSession()

    const ride = await prisma.ride.create({
      data: {
        driverId: session.user.id,
        origin: data.origin,
        destination: data.destination,
        departureTime: new Date(data.departureTime),
        seats: data.seats,
        availableSeats: data.seats,
        price: data.price,
        type: data.type,
        description: data.description,
      },
    })

    return ride
  })

const updateRideInput = z.object({
  id: z.string().min(1),
  origin: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  departureTime: z.iso.datetime().optional(),
  seats: z.int().positive().optional(),
  price: z.number().nonnegative().optional(),
  type: z.enum(['SHARED', 'EXCLUSIVE']).optional(),
  description: z.string().optional(),
})

export const updateRide = createServerFn({ method: 'POST' })
  .inputValidator(updateRideInput)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.ride.findFirst({
        where: { id: data.id, driverId: user.id },
      })
      if (!existing) {
        throw new Error('Ride not found')
      }

      const bookedSeats = existing.seats - existing.availableSeats
      const nextSeats = data.seats ?? existing.seats
      if (nextSeats < bookedSeats) {
        throw new Error('Cannot reduce seats below already booked seats')
      }

      const result = await tx.ride.updateMany({
        where: {
          id: data.id,
          driverId: user.id,
          seats: existing.seats,
          availableSeats: existing.availableSeats,
        },
        data: {
          origin: data.origin,
          destination: data.destination,
          departureTime: data.departureTime
            ? new Date(data.departureTime)
            : undefined,
          seats: data.seats,
          availableSeats:
            data.seats !== undefined ? nextSeats - bookedSeats : undefined,
          price: data.price,
          type: data.type,
          description: data.description,
        },
      })

      if (result.count !== 1) {
        throw new Error('Ride was modified concurrently, please try again')
      }

      const ride = await tx.ride.findUnique({ where: { id: data.id } })
      if (!ride) {
        throw new Error('Ride not found')
      }
      return ride
    })
  })

const deleteRideInput = z.object({ id: z.string().min(1) })

export const deleteRide = createServerFn({ method: 'POST' })
  .inputValidator(deleteRideInput)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    return await prisma.$transaction(async (tx) => {
      const result = await tx.ride.updateMany({
        where: { id: data.id, driverId: user.id, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      })

      if (result.count !== 1) {
        throw new Error('Ride not found')
      }

      const ride = await tx.ride.findUnique({ where: { id: data.id } })
      if (!ride) {
        throw new Error('Ride not found')
      }

      const affectedBookings = await tx.booking.findMany({
        where: { rideId: data.id, status: 'CONFIRMED' },
        select: { id: true, riderId: true },
      })

      if (affectedBookings.length > 0) {
        await tx.booking.updateMany({
          where: { rideId: data.id, status: 'CONFIRMED' },
          data: { status: 'CANCELLED' },
        })

        await tx.notification.createMany({
          data: affectedBookings.map((booking) => ({
            userId: booking.riderId,
            type: 'RIDE_CANCELLED',
            message: `Your ride from ${ride.origin} to ${ride.destination} was cancelled by the driver.`,
            rideId: data.id,
          })),
        })
      }

      return ride
    })
  })

export const getUserRides = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { user } = await requireServerSession()

    return await prisma.ride.findMany({
      where: { driverId: user.id },
      orderBy: { departureTime: 'desc' },
      include: {
        _count: { select: { bookings: true } },
      },
    })
  },
)
