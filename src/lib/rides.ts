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
  .validator(createRideInput)
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
