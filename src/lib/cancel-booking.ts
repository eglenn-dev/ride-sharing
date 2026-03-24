import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const cancelBooking = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: bookingId }) => {
    const { user } = await requireServerSession()

    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { ride: true },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.riderId !== user.id) {
        throw new Error('You can only cancel your own bookings')
      }

      if (booking.status !== 'CONFIRMED') {
        throw new Error('Only confirmed bookings can be cancelled')
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })

      await tx.ride.update({
        where: { id: booking.rideId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      })

      await tx.notification.create({
        data: {
          userId: booking.ride.driverId,
          type: 'BOOKING_CANCELLED',
          message: `A booking for ${booking.seatsBooked} seat(s) on your ride has been cancelled.`,
          rideId: booking.rideId,
        },
      })

      return updatedBooking
    })
  })
