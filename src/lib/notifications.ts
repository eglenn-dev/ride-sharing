import { createServerFn } from '@tanstack/react-start'
import { requireServerSession } from '#/lib/auth-session'
import { prisma } from '#/db'

export const getNotifications = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { user } = await requireServerSession()

    return prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ride: {
          select: {
            origin: true,
            destination: true,
          },
        },
      },
    })
  },
)

export const markNotificationRead = createServerFn({ method: 'POST' })
  .validator((data: string) => data)
  .handler(async ({ data: notificationId }) => {
    const { user } = await requireServerSession()

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: { isRead: true },
    })
  })
