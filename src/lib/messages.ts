import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db'
import { requireServerSession } from '#/lib/auth-session'
import { sendMessageSchema } from '#/lib/schemas'

async function assertCallerCanAccessThread(threadId: string, userId: string) {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      booking: {
        select: { riderId: true, ride: { select: { driverId: true } } },
      },
    },
  })
  if (!thread) {
    throw new Error('Thread not found')
  }
  if (
    thread.booking.riderId !== userId &&
    thread.booking.ride.driverId !== userId
  ) {
    throw new Error('You do not have access to this thread')
  }
  return thread
}

export const getOrCreateThreadForBooking = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ bookingId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        ride: { select: { driverId: true } },
        messageThread: true,
      },
    })
    if (!booking) throw new Error('Booking not found')
    if (
      booking.riderId !== user.id &&
      booking.ride.driverId !== user.id
    ) {
      throw new Error('You do not have access to this booking')
    }

    if (booking.messageThread) return booking.messageThread

    return prisma.messageThread.create({
      data: { bookingId: booking.id },
    })
  })

export const listMyThreads = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { user } = await requireServerSession()

    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [
          { booking: { riderId: user.id } },
          { booking: { ride: { driverId: user.id } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        booking: {
          include: {
            rider: { select: { id: true, name: true } },
            ride: {
              select: {
                origin: true,
                destination: true,
                departureTime: true,
                driver: { select: { id: true, name: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return threads.map((thread) => {
      const isDriver = thread.booking.ride.driver.id === user.id
      const counterparty = isDriver
        ? thread.booking.rider
        : thread.booking.ride.driver
      const lastMessage =
        thread.messages.length > 0 ? thread.messages[0] : null

      return {
        id: thread.id,
        bookingId: thread.bookingId,
        updatedAt: thread.updatedAt,
        counterparty,
        rideLabel: `${thread.booking.ride.origin} → ${thread.booking.ride.destination}`,
        departureTime: thread.booking.ride.departureTime,
        lastMessagePreview: lastMessage ? lastMessage.body : null,
        lastMessageAt: lastMessage ? lastMessage.createdAt : null,
        lastMessageAuthorId: lastMessage ? lastMessage.authorId : null,
      }
    })
  },
)

export const getMessages = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      threadId: z.string().min(1),
      sinceId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    await assertCallerCanAccessThread(data.threadId, user.id)

    const messages = await prisma.message.findMany({
      where: {
        threadId: data.threadId,
        ...(data.sinceId ? { id: { gt: data.sinceId } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true } } },
    })
    return messages
  })

export const sendMessage = createServerFn({ method: 'POST' })
  .inputValidator(sendMessageSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    const thread = await assertCallerCanAccessThread(data.threadId, user.id)

    const message = await prisma.message.create({
      data: {
        threadId: data.threadId,
        authorId: user.id,
        body: data.body,
        readBy: [user.id],
      },
    })

    await prisma.messageThread.update({
      where: { id: data.threadId },
      data: { updatedAt: new Date() },
    })

    const recipientId =
      thread.booking.riderId === user.id
        ? thread.booking.ride.driverId
        : thread.booking.riderId

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        message: `New message from ${user.name}`,
      },
    })

    return message
  })

export const markThreadRead = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ threadId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    await assertCallerCanAccessThread(data.threadId, user.id)

    const messages = await prisma.message.findMany({
      where: { threadId: data.threadId, NOT: { readBy: { has: user.id } } },
      select: { id: true, readBy: true },
    })

    for (const message of messages) {
      await prisma.message.update({
        where: { id: message.id },
        data: { readBy: { set: [...message.readBy, user.id] } },
      })
    }
  })

export const getUnreadMessageCount = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { user } = await requireServerSession()
  const count = await prisma.message.count({
    where: {
      thread: {
        OR: [
          { booking: { riderId: user.id } },
          { booking: { ride: { driverId: user.id } } },
        ],
      },
      NOT: { readBy: { has: user.id } },
      authorId: { not: user.id },
    },
  })
  return { count }
})
