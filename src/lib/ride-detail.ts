import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const getRideById = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: rideId }) => {
    await requireServerSession()

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: {
          select: { id: true, name: true, email: true },
        },
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            rider: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!ride) {
      throw new Error('Ride not found')
    }

    return ride
  })
