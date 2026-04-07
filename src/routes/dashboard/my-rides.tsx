import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { getUserRides } from '#/lib/rides'

export const Route = createFileRoute('/dashboard/my-rides')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async () => {
    return { rides: await getUserRides() }
  },
  component: MyRidesPage,
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const priceFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

function MyRidesPage() {
  const { rides } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Driver dashboard</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          My Rides
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Rides you have created.
        </p>

        {rides.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/40 p-6 text-center">
            <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
              You haven&apos;t created any rides yet.
            </p>
            <Link
              to="/rides/create"
              className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:bg-[rgba(79,184,178,0.24)]"
            >
              Create a ride
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4">
            {rides.map((ride) => (
              <li
                key={ride.id}
                className="rounded-2xl border border-[var(--line)] bg-white/50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[var(--sea-ink)]">
                      {ride.origin} → {ride.destination}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">
                      {dateFormatter.format(new Date(ride.departureTime))}
                    </p>
                  </div>
                  <div className="text-sm text-[var(--sea-ink-soft)] sm:text-right">
                    <p>
                      {ride.availableSeats}/{ride.seats} seats available
                    </p>
                    <p>{priceFormatter.format(ride.price)} per seat</p>
                    <p className="uppercase tracking-wide">{ride.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
                  {ride._count.bookings} booking
                  {ride._count.bookings === 1 ? '' : 's'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
