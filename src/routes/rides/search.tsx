import { createFileRoute, useRouter } from '@tanstack/react-router'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { searchRides } from '#/lib/search-rides'

type RideSearchType = 'SHARED' | 'EXCLUSIVE'

type RideSearchFilters = {
  origin?: string
  destination?: string
  date?: string
  type?: RideSearchType
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const Route = createFileRoute('/rides/search')({
  validateSearch: (search: Record<string, unknown>): RideSearchFilters => {
    const rawType = search.type

    return {
      origin:
        typeof search.origin === 'string' && search.origin.trim()
          ? search.origin.trim()
          : undefined,
      destination:
        typeof search.destination === 'string' && search.destination.trim()
          ? search.destination.trim()
          : undefined,
      date:
        typeof search.date === 'string' && search.date.trim()
          ? search.date.trim()
          : undefined,
      type: rawType === 'SHARED' || rawType === 'EXCLUSIVE' ? rawType : undefined,
    }
  },
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return {
      results: await searchRides({ data: deps }),
    }
  },
  component: RidesSearchPage,
})

function RidesSearchPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const { results } = Route.useLoaderData()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const next: RideSearchFilters = {
      origin: String(form.get('origin') || '').trim() || undefined,
      destination: String(form.get('destination') || '').trim() || undefined,
      date: String(form.get('date') || '').trim() || undefined,
      type: (() => {
        const value = String(form.get('type') || '')
        return value === 'SHARED' || value === 'EXCLUSIVE' ? value : undefined
      })(),
    }

    await router.navigate({ to: '/rides/search', search: next })
  }

  const clearFilters = async () => {
    await router.navigate({
      to: '/rides/search',
      search: {
        origin: undefined,
        destination: undefined,
        date: undefined,
        type: undefined,
      },
    })
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10">
        <p className="island-kicker mb-2">Find Your Next Ride</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Search Available Rides
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Filter by route, departure day, and ride type to find your best match.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Origin
            <input
              type="text"
              id="origin"
              name="origin"
              defaultValue={search.origin}
              placeholder="Salt Lake City"
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Destination
            <input
              type="text"
              id="destination"
              name="destination"
              defaultValue={search.destination}
              placeholder="Provo"
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Date
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={search.date}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Type
            <select
              id="type"
              name="type"
              defaultValue={search.type}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            >
              <option value="">Any ride type</option>
              <option value="SHARED">Shared</option>
              <option value="EXCLUSIVE">Exclusive</option>
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]"
            >
              Search Rides
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[rgba(23,58,64,0.35)]"
            >
              Clear
            </button>
            <span className="text-sm text-[var(--sea-ink-soft)]">
              {results.length} result{results.length === 1 ? '' : 's'}
            </span>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.length === 0 ? (
          <article className="island-shell rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--sea-ink-soft)] sm:col-span-2 xl:col-span-3">
            No rides matched these filters. Try broadening your search criteria.
          </article>
        ) : (
          results.map((ride) => (
            <article
              key={ride.id}
              className="island-shell feature-card rise-in rounded-2xl p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">
                  {ride.origin} to {ride.destination}
                </h2>
                <span className="rounded-full border border-[var(--line)] bg-white/60 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
                  {ride.type === 'SHARED' ? 'Shared' : 'Exclusive'}
                </span>
              </div>

              <dl className="m-0 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--sea-ink-soft)]">Departure</dt>
                  <dd className="m-0 font-medium text-[var(--sea-ink)]">
                    {DATE_TIME_FORMATTER.format(new Date(ride.departureTime))}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--sea-ink-soft)]">Driver</dt>
                  <dd className="m-0 font-medium text-[var(--sea-ink)]">{ride.driver.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--sea-ink-soft)]">Seats Left</dt>
                  <dd className="m-0 font-medium text-[var(--sea-ink)]">{ride.availableSeats}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--sea-ink-soft)]">Price</dt>
                  <dd className="m-0 font-medium text-[var(--sea-ink)]">
                    ${ride.price.toFixed(2)}
                  </dd>
                </div>
              </dl>

              {ride.description && (
                <p className="mt-3 rounded-lg border border-[var(--line)] bg-white/40 p-3 text-sm text-[var(--sea-ink-soft)]">
                  {ride.description}
                </p>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  )
}
