import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const getUserBookings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { user } = await requireServerSession()

    return await prisma.booking.findMany({
      where: { riderId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ride: {
          select: {
            origin: true,
            destination: true,
            departureTime: true,
            price: true,
            status: true,
            driver: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  },
)
