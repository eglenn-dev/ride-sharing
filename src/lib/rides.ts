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

    const existing = await prisma.ride.findUnique({ where: { id: data.id } })
    if (!existing || existing.driverId !== user.id) {
      throw new Error('Ride not found')
    }

    const bookedSeats = existing.seats - existing.availableSeats
    const nextSeats = data.seats ?? existing.seats
    if (nextSeats < bookedSeats) {
      throw new Error('Cannot reduce seats below already booked seats')
    }

    return await prisma.ride.update({
      where: { id: data.id },
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
  })

const deleteRideInput = z.object({ id: z.string().min(1) })

export const deleteRide = createServerFn({ method: 'POST' })
  .inputValidator(deleteRideInput)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    const existing = await prisma.ride.findUnique({ where: { id: data.id } })
    if (!existing || existing.driverId !== user.id) {
      throw new Error('Ride not found')
    }

    return await prisma.ride.update({
      where: { id: data.id },
      data: { status: 'CANCELLED' },
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
