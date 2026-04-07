import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { getEditableRide, updateRide } from '#/lib/rides'

export const Route = createFileRoute('/dashboard/my-rides_/$rideId/edit')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async ({ params }) => {
    return { ride: await getEditableRide({ data: params.rideId }) }
  },
  component: EditRidePage,
})

const toLocalDateTime = (value: Date) => {
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function EditRidePage() {
  const { ride } = Route.useLoaderData()
  const router = useRouter()
  const [origin, setOrigin] = useState(ride.origin)
  const [destination, setDestination] = useState(ride.destination)
  const [departureTime, setDepartureTime] = useState(
    toLocalDateTime(ride.departureTime),
  )
  const [seats, setSeats] = useState(ride.seats)
  const [price, setPrice] = useState(ride.price)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await updateRide({
        data: {
          id: ride.id,
          origin: origin.trim(),
          destination: destination.trim(),
          departureTime: new Date(departureTime).toISOString(),
          seats,
          price,
        },
      })
      await router.navigate({ to: '/dashboard/my-rides' })
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update ride.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Driver</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Edit Ride
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Origin
            <input
              type="text"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Destination
            <input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Departure Time
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Seats
            <input
              type="number"
              min={1}
              step={1}
              value={seats}
              onChange={(event) => setSeats(Math.max(1, Number(event.target.value) || 1))}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)] sm:col-span-2">
            Price Per Seat (USD)
            <input
              type="number"
              min={0}
              step={0.5}
              value={price}
              onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)]"
            />
          </label>

          {error ? (
            <p className="m-0 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)] sm:col-span-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>
    </main>
  )
}
