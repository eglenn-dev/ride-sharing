import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator((data: { rideId: string; seats?: number }) => data)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    const seats = data.seats ?? 1

    return await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({
        where: { id: data.rideId },
      })

      if (!ride) {
        throw new Error('Ride not found')
      }

      if (ride.status !== 'ACTIVE') {
        throw new Error('Ride is no longer active')
      }

      if (ride.driverId === user.id) {
        throw new Error('You cannot book your own ride')
      }

      if (ride.availableSeats < seats) {
        throw new Error('Not enough seats available')
      }

      await tx.ride.update({
        where: { id: ride.id },
        data: { availableSeats: ride.availableSeats - seats },
      })

      const booking = await tx.booking.create({
        data: {
          riderId: user.id,
          rideId: ride.id,
          seatsBooked: seats,
          status: 'CONFIRMED',
        },
      })

      await tx.notification.create({
        data: {
          userId: ride.driverId,
          type: 'BOOKING_CREATED',
          message: `${user.name} booked ${seats} seat${seats > 1 ? 's' : ''} on your ride from ${ride.origin} to ${ride.destination}`,
          rideId: ride.id,
        },
      })

      return booking
    })
  })
