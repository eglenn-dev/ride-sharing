import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import { assertCronRequest } from '#/lib/cron'

const COMPLETION_BUFFER_MS = 2 * 60 * 60 * 1000

export const Route = createFileRoute('/api/cron/complete-rides')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          assertCronRequest(request)
        } catch (response) {
          if (response instanceof Response) return response
          throw response
        }

        const cutoff = new Date(Date.now() - COMPLETION_BUFFER_MS)

        const ridesToComplete = await prisma.ride.findMany({
          where: {
            status: 'ACTIVE',
            departureTime: { lt: cutoff },
          },
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
              select: { riderId: true },
            },
          },
        })

        if (ridesToComplete.length === 0) {
          return Response.json({ completed: 0 })
        }

        await prisma.$transaction(async (tx) => {
          for (const ride of ridesToComplete) {
            await tx.ride.update({
              where: { id: ride.id },
              data: { status: 'COMPLETED' },
            })

            const recipients = new Set<string>([
              ride.driverId,
              ...ride.bookings.map((b) => b.riderId),
            ])

            await tx.notification.createMany({
              data: Array.from(recipients).map((userId) => ({
                userId,
                type: 'RIDE_COMPLETED' as const,
                message: `Your ride from ${ride.origin} to ${ride.destination} is complete. Leave a review!`,
                rideId: ride.id,
              })),
            })
          }
        })

        return Response.json({ completed: ridesToComplete.length })
      },
    },
  },
})
