import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import {
  deleteRideTemplate,
  listRideTemplates,
  pauseRideTemplate,
  resumeRideTemplate,
} from '#/lib/ride-templates'

export const Route = createFileRoute('/rides/templates')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async () => {
    return { templates: await listRideTemplates() }
  },
  pendingMs: 100,
  component: TemplatesPage,
})

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PRICE_FORMATTER = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

function formatTimeOfDay(hour: number, minute: number): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

function TemplatesPage() {
  const { templates } = Route.useLoaderData()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAction = async (
    id: string,
    fn: () => Promise<unknown>,
    confirmText?: string,
  ) => {
    if (confirmText && !confirm(confirmText)) return
    setPendingId(id)
    setError(null)
    try {
      await fn()
      await router.invalidate()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action failed')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="island-kicker mb-2">Driver dashboard</p>
            <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              Recurring Ride Templates
            </h1>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              Schedule rides that repeat on a weekly cadence.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/my-rides"
              className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
            >
              ← My Rides
            </Link>
            <Link
              to="/rides/templates/new"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.18)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:bg-[rgba(79,184,178,0.28)]"
            >
              + New template
            </Link>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)]">
            {error}
          </p>
        ) : null}

        {templates.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/40 p-6 text-center text-sm text-[var(--sea-ink-soft)]">
            You haven&apos;t created any recurring templates yet.
          </div>
        ) : (
          <ul className="grid gap-4">
            {templates.map((template) => (
              <li
                key={template.id}
                className="rounded-2xl border border-[var(--line)] bg-white/50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[var(--sea-ink)]">
                      {template.origin} → {template.destination}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">
                      {template.daysOfWeek
                        .map((d) => DAY_LABELS[d])
                        .join(', ')}{' '}
                      at {formatTimeOfDay(template.departureHour, template.departureMin)}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">
                      {template.seats} seat{template.seats === 1 ? '' : 's'} ·{' '}
                      {PRICE_FORMATTER.format(template.price)} per seat ·{' '}
                      {template.type === 'EXCLUSIVE' ? 'Exclusive' : 'Shared'}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--sea-ink-soft)]">
                    <p>{template._count.rides} active rides</p>
                    {template.isPaused ? (
                      <p className="font-semibold uppercase tracking-wide text-[rgb(138,44,35)]">
                        Paused
                      </p>
                    ) : (
                      <p className="font-semibold uppercase tracking-wide text-[var(--lagoon-deep)]">
                        Active
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/rides/templates/$templateId/edit"
                    params={{ templateId: template.id }}
                    className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-3 py-1.5 text-xs font-semibold text-[var(--lagoon-deep)] no-underline transition hover:bg-[rgba(79,184,178,0.24)]"
                  >
                    Edit
                  </Link>
                  {template.isPaused ? (
                    <button
                      type="button"
                      disabled={pendingId === template.id}
                      onClick={() =>
                        void runAction(template.id, () =>
                          resumeRideTemplate({ data: { id: template.id } }),
                        )
                      }
                      className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:opacity-60"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pendingId === template.id}
                      onClick={() =>
                        void runAction(template.id, () =>
                          pauseRideTemplate({ data: { id: template.id } }),
                        )
                      }
                      className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:opacity-60"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pendingId === template.id}
                    onClick={() =>
                      void runAction(
                        template.id,
                        () => deleteRideTemplate({ data: { id: template.id } }),
                        'Delete this template? Future un-booked rides will be cancelled.',
                      )
                    }
                    className="rounded-full border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] px-3 py-1.5 text-xs font-semibold text-[rgb(138,44,35)] transition hover:bg-[rgba(183,63,48,0.16)] disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
