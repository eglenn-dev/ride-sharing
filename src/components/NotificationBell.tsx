import { useEffect, useMemo, useState } from 'react'
import { getNotifications, markNotificationRead } from '#/lib/notifications'

type NotificationItem = {
  id: string
  message: string
  isRead: boolean
  createdAt: string | Date
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function NotificationBell({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setLoadError(null)
      return
    }

    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const items = await getNotifications()
        if (!isMounted) {
          return
        }

        setNotifications(
          items.map((item) => ({
            id: item.id,
            message: item.message,
            isRead: item.isRead,
            createdAt: item.createdAt,
          })),
        )
      } catch {
        if (!isMounted) {
          return
        }

        setLoadError('Unable to load notifications right now.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [userId])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  if (!userId) {
    return null
  }

  const markAsRead = async (id: string) => {
    const currentItem = notifications.find((notification) => notification.id === id)
    if (!currentItem || currentItem.isRead) {
      return
    }

    setMarkingId(id)
    setNotifications((existing) =>
      existing.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    )

    try {
      await markNotificationRead({ data: id })
    } catch {
      setNotifications((existing) =>
        existing.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: false,
              }
            : notification,
        ),
      )
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <details className="relative">
      <summary
        className="relative inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
        aria-label="Open notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 1 5.454 1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 8.642 23.848 23.848 0 0 1 5.454-1.31m5.714 0a24.255 24.255 0 0 0-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border border-white bg-[var(--lagoon-deep)] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border border-[var(--line)] bg-[var(--header-bg)] p-2 shadow-[0_18px_38px_rgba(23,58,64,0.18)]">
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">Notifications</p>
          <span className="text-xs text-[var(--sea-ink-soft)]">{unreadCount} unread</span>
        </div>

        {isLoading && (
          <p className="m-0 rounded-xl px-2 py-6 text-center text-sm text-[var(--sea-ink-soft)]">
            Loading...
          </p>
        )}

        {!isLoading && loadError && (
          <p className="m-0 rounded-xl border border-[rgba(177,75,70,0.25)] bg-[rgba(177,75,70,0.08)] px-3 py-2 text-sm text-[var(--sea-ink)]">
            {loadError}
          </p>
        )}

        {!isLoading && !loadError && notifications.length === 0 && (
          <p className="m-0 rounded-xl px-2 py-6 text-center text-sm text-[var(--sea-ink-soft)]">
            You are all caught up.
          </p>
        )}

        {!isLoading && !loadError && notifications.length > 0 && (
          <ul className="m-0 max-h-80 list-none space-y-1 overflow-y-auto p-0">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="rounded-xl border border-[var(--line)] bg-white/60 p-2"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p
                    className={`m-0 text-sm ${notification.isRead ? 'text-[var(--sea-ink-soft)]' : 'font-semibold text-[var(--sea-ink)]'}`}
                  >
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--lagoon-deep)]" />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {DATE_TIME_FORMATTER.format(new Date(notification.createdAt))}
                  </span>
                  <button
                    type="button"
                    disabled={notification.isRead || markingId === notification.id}
                    onClick={() => {
                      void markAsRead(notification.id)
                    }}
                    className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notification.isRead ? 'Read' : markingId === notification.id ? 'Saving...' : 'Mark read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}