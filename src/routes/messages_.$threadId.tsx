import { createFileRoute, Link } from '@tanstack/react-router'
import MessageThreadPanel from '#/components/messages/MessageThreadPanel'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { listMyThreads } from '#/lib/messages'

export const Route = createFileRoute('/messages_/$threadId')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async ({ params }) => {
    const session = await requireAuthenticatedRoute()
    const threads = await listMyThreads()
    const thread = threads.find((t) => t.id === params.threadId)
    if (!thread) {
      throw new Error('Thread not found')
    }
    return { thread, session }
  },
  pendingMs: 100,
  component: ThreadPage,
})

function ThreadPage() {
  const { thread, session } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="island-kicker mb-1">Conversation</p>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
              {thread.counterparty.name}
            </h1>
            <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
              {thread.rideLabel}
            </p>
          </div>
          <Link
            to="/messages"
            className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
          >
            ← Inbox
          </Link>
        </div>

        <MessageThreadPanel
          threadId={thread.id}
          currentUserId={session.user.id}
        />
      </section>
    </main>
  )
}
