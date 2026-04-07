import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { requireServerSession } from '#/lib/auth-session'
import { submitReviewSchema } from '#/lib/schemas'

export const submitReview = createServerFn({ method: 'POST' })
  .inputValidator(submitReviewSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    if (user.id === data.subjectId) {
      throw new Error('You cannot review yourself')
    }

    return await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({
        where: { id: data.rideId },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            select: { riderId: true },
          },
        },
      })

      if (!ride) {
        throw new Error('Ride not found')
      }

      if (ride.status !== 'COMPLETED') {
        throw new Error('You can only review completed rides')
      }

      const participantIds = new Set<string>([
        ride.driverId,
        ...ride.bookings.map((b) => b.riderId),
      ])

      if (!participantIds.has(user.id)) {
        throw new Error('You did not participate in this ride')
      }

      if (!participantIds.has(data.subjectId)) {
        throw new Error('Subject did not participate in this ride')
      }

      const review = await tx.review.create({
        data: {
          rideId: data.rideId,
          authorId: user.id,
          subjectId: data.subjectId,
          rating: data.rating,
          comment: data.comment,
        },
      })

      await tx.notification.create({
        data: {
          userId: data.subjectId,
          type: 'REVIEW_RECEIVED',
          message: `${user.name} left you a ${data.rating}-star review for your ride from ${ride.origin} to ${ride.destination}.`,
          rideId: data.rideId,
        },
      })

      return review
    })
  })

export const getReviewsForUser = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const reviews = await prisma.review.findMany({
      where: { subjectId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
        ride: { select: { origin: true, destination: true } },
      },
    })
    const count = reviews.length
    const avg =
      count === 0
        ? null
        : reviews.reduce((sum, r) => sum + r.rating, 0) / count
    return { reviews, count, avg }
  })

export const getUserRatingSummary = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const agg = await prisma.review.aggregate({
      where: { subjectId: userId },
      _avg: { rating: true },
      _count: { _all: true },
    })
    return {
      avg: agg._avg.rating,
      count: agg._count._all,
    }
  })

export const getPendingReviewsForCurrentUser = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { user } = await requireServerSession()

  // Completed rides where the current user is either driver or confirmed rider
  const rides = await prisma.ride.findMany({
    where: {
      status: 'COMPLETED',
      OR: [
        { driverId: user.id },
        { bookings: { some: { riderId: user.id, status: 'CONFIRMED' } } },
      ],
    },
    include: {
      driver: { select: { id: true, name: true } },
      bookings: {
        where: { status: 'CONFIRMED' },
        select: { riderId: true, rider: { select: { id: true, name: true } } },
      },
      reviews: {
        where: { authorId: user.id },
        select: { subjectId: true },
      },
    },
    orderBy: { departureTime: 'desc' },
    take: 25,
  })

  const pending: Array<{
    rideId: string
    rideLabel: string
    departureTime: Date
    subject: { id: string; name: string }
  }> = []

  for (const ride of rides) {
    const reviewedSubjectIds = new Set(ride.reviews.map((r) => r.subjectId))
    const userIsDriver = ride.driverId === user.id

    const candidates = userIsDriver
      ? ride.bookings.map((b) => b.rider)
      : [ride.driver]

    for (const candidate of candidates) {
      if (!candidate || candidate.id === user.id) continue
      if (reviewedSubjectIds.has(candidate.id)) continue
      pending.push({
        rideId: ride.id,
        rideLabel: `${ride.origin} → ${ride.destination}`,
        departureTime: ride.departureTime,
        subject: candidate,
      })
    }
  }

  return pending
})
