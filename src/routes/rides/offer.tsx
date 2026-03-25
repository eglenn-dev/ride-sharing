import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { createRide } from '#/lib/rides'

type RideType = 'SHARED' | 'EXCLUSIVE'

const getDefaultDepartureTime = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

export const Route = createFileRoute('/rides/offer')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  component: OfferRidePage,
})

function OfferRidePage() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState(getDefaultDepartureTime)
  const [seats, setSeats] = useState(1)
  const [price, setPrice] = useState(0)
  const [type, setType] = useState<RideType>('SHARED')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError(null)

    if (!origin.trim() || !destination.trim()) {
      setError('Origin and destination are required.')
      return
    }

    if (!departureTime) {
      setError('Departure time is required.')
      return
    }

    setIsSubmitting(true)

    try {
      await createRide({
        data: {
          origin: origin.trim(),
          destination: destination.trim(),
          departureTime: new Date(departureTime).toISOString(),
          seats,
          price,
          type,
          description: description.trim() || undefined,
        },
      })

      await router.navigate({
        to: '/home',
        search: {
          bookingCreated: undefined,
          bookedRide: undefined,
        },
      })
    } catch (createRideError) {
      setError(
        createRideError instanceof Error
          ? createRideError.message
          : 'Unable to create ride.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Driver</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Offer a Ride
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Set your route, departure time, and available seats.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Origin
            <input
              type="text"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="Salt Lake City"
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Destination
            <input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Provo"
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
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
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Ride Type
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value === 'EXCLUSIVE' ? 'EXCLUSIVE' : 'SHARED')
              }
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
            >
              <option value="SHARED">Shared</option>
              <option value="EXCLUSIVE">Exclusive</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Seats
            <input
              type="number"
              min={1}
              step={1}
              value={seats}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isNaN(value)) {
                  setSeats(Math.max(1, Math.floor(value)))
                }
              }}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
            Price Per Seat (USD)
            <input
              type="number"
              min={0}
              step={0.5}
              value={price}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isNaN(value)) {
                  setPrice(Math.max(0, value))
                }
              }}
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)] sm:col-span-2">
            Description (optional)
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              disabled={isSubmitting}
              className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
              placeholder="Share details riders should know."
            />
          </label>

          {error ? (
            <p className="m-0 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)] sm:col-span-2">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.18)] disabled:bg-white/50 disabled:text-[var(--sea-ink-soft)]"
            >
              {isSubmitting ? 'Creating Ride...' : 'Create Ride'}
            </button>
            <Link
              to="/home"
              search={{
                bookingCreated: undefined,
                bookedRide: undefined,
              }}
              className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-center text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[rgba(23,58,64,0.35)]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
