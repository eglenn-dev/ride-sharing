import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const searchRides = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      origin?: string
      destination?: string
      date?: string
      type?: 'SHARED' | 'EXCLUSIVE'
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await requireServerSession()

    const where: {
      status: 'ACTIVE'
      availableSeats: { gt: number }
      driverId: { not: string }
      origin?: { contains: string; mode: 'insensitive' }
      destination?: { contains: string; mode: 'insensitive' }
      departureTime?: { gte: Date; lt: Date }
      type?: 'SHARED' | 'EXCLUSIVE'
    } = {
      status: 'ACTIVE',
      availableSeats: { gt: 0 },
      driverId: { not: session.user.id },
    }

    if (data.origin) {
      where.origin = { contains: data.origin, mode: 'insensitive' }
    }

    if (data.destination) {
      where.destination = { contains: data.destination, mode: 'insensitive' }
    }

    if (data.date) {
      const dayStart = new Date(data.date)
      const dayEnd = new Date(data.date)
      dayEnd.setDate(dayEnd.getDate() + 1)
      where.departureTime = { gte: dayStart, lt: dayEnd }
    }

    if (data.type) {
      where.type = data.type
    }

    return prisma.ride.findMany({
      where,
      orderBy: { departureTime: 'asc' },
      include: {
        driver: {
          select: { id: true, name: true },
        },
      },
    })
  })
