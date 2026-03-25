import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

const CONFLICT_WINDOW_HOURS = 2

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator((data: { rideId: string; seats?: number }) => data)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    const seats = data.seats ?? 1

    if (!Number.isInteger(seats) || seats <= 0) {
      throw new Error('Seats must be a positive whole number')
    }

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

      const existingBookingOnRide = await tx.booking.findFirst({
        where: {
          riderId: user.id,
          rideId: ride.id,
          status: 'CONFIRMED',
        },
      })

      if (existingBookingOnRide) {
        throw new Error('You already have a confirmed booking for this ride')
      }

      const conflictWindowMs = CONFLICT_WINDOW_HOURS * 60 * 60 * 1000
      const conflictWindowStart = new Date(ride.departureTime.getTime() - conflictWindowMs)
      const conflictWindowEnd = new Date(ride.departureTime.getTime() + conflictWindowMs)

      const conflictingBooking = await tx.booking.findFirst({
        where: {
          riderId: user.id,
          status: 'CONFIRMED',
          rideId: { not: ride.id },
          ride: {
            departureTime: {
              gte: conflictWindowStart,
              lte: conflictWindowEnd,
            },
          },
        },
        include: {
          ride: {
            select: {
              origin: true,
              destination: true,
              departureTime: true,
            },
          },
        },
      })

      if (conflictingBooking) {
        throw new Error(
          `Booking conflicts with your ride from ${conflictingBooking.ride.origin} to ${conflictingBooking.ride.destination} at ${conflictingBooking.ride.departureTime.toLocaleString()}`,
        )
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

export const updateBookingSeats = createServerFn({ method: 'POST' })
  .inputValidator((data: { bookingId: string; seats: number }) => data)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    if (!Number.isInteger(data.seats) || data.seats <= 0) {
      throw new Error('Seats must be a positive whole number')
    }

    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          ride: {
            select: {
              id: true,
              status: true,
              departureTime: true,
              availableSeats: true,
              driverId: true,
              origin: true,
              destination: true,
            },
          },
        },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.riderId !== user.id) {
        throw new Error('You can only edit your own bookings')
      }

      if (booking.status !== 'CONFIRMED') {
        throw new Error('Only confirmed bookings can be edited')
      }

      if (booking.ride.status !== 'ACTIVE') {
        throw new Error('This ride is no longer active')
      }

      if (new Date(booking.ride.departureTime) <= new Date()) {
        throw new Error('You can only edit bookings before departure')
      }

      const seatDelta = data.seats - booking.seatsBooked
      if (seatDelta === 0) {
        return booking
      }

      if (seatDelta > 0) {
        const updatedRideCount = await tx.ride.updateMany({
          where: {
            id: booking.ride.id,
            availableSeats: { gte: seatDelta },
          },
          data: {
            availableSeats: { decrement: seatDelta },
          },
        })

        if (updatedRideCount.count === 0) {
          throw new Error('Not enough seats available to update this booking')
        }
      } else {
        await tx.ride.update({
          where: { id: booking.ride.id },
          data: {
            availableSeats: { increment: Math.abs(seatDelta) },
          },
        })
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          seatsBooked: data.seats,
        },
      })

      await tx.notification.create({
        data: {
          userId: booking.ride.driverId,
          type: 'RIDE_UPDATED',
          message: `${user.name} updated a booking on your ride from ${booking.ride.origin} to ${booking.ride.destination} to ${data.seats} seat${data.seats === 1 ? '' : 's'}.`,
          rideId: booking.ride.id,
        },
      })

      return updatedBooking
    })
  })
