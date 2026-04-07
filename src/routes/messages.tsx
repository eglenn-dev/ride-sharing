import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { listMyThreads } from '#/lib/messages'

export const Route = createFileRoute('/messages')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async () => {
    return { threads: await listMyThreads() }
  },
  pendingMs: 100,
  component: MessagesInboxPage,
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function MessagesInboxPage() {
  const { threads } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Inbox</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Messages
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Conversations with the drivers and riders on your trips.
        </p>

        {threads.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/40 p-6 text-center text-sm text-[var(--sea-ink-soft)]">
            No conversations yet. Book a ride or wait for a rider to start chatting.
          </div>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link
                  to="/messages/$threadId"
                  params={{ threadId: thread.id }}
                  className="block rounded-2xl border border-[var(--line)] bg-white/50 p-4 no-underline transition hover:bg-[var(--link-bg-hover)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                        {thread.counterparty.name}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                        {thread.rideLabel}
                      </p>
                      {thread.lastMessagePreview ? (
                        <p className="m-0 mt-2 truncate text-sm text-[var(--sea-ink)]">
                          {thread.lastMessagePreview}
                        </p>
                      ) : (
                        <p className="m-0 mt-2 text-sm italic text-[var(--sea-ink-soft)]">
                          No messages yet.
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-[var(--sea-ink-soft)]">
                      {thread.lastMessageAt
                        ? DATE_TIME_FORMATTER.format(new Date(thread.lastMessageAt))
                        : DATE_TIME_FORMATTER.format(new Date(thread.updatedAt))}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
