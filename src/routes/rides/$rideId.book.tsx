import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import BookingPageSkeleton from '#/components/skeletons/BookingPageSkeleton'
import { createBooking } from '#/lib/bookings'
import { getRideById } from '#/lib/ride-detail'

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const Route = createFileRoute('/rides/$rideId/book')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async ({ params }) => {
    const ride = await getRideById({ data: params.rideId })
    return { ride }
  },
  pendingComponent: BookingPageSkeleton,
  pendingMs: 100,
  component: RideBookingPage,
})

function RideBookingPage() {
  const router = useRouter()
  const { ride } = Route.useLoaderData()
  const { rideId } = Route.useParams()

  const maxSeats = Math.max(1, ride.availableSeats)
  const [seats, setSeats] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canBook = ride.status === 'ACTIVE' && ride.availableSeats > 0

  const handleConfirmBooking = async () => {
    if (!canBook) {
      setError('This ride is not available for booking.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await createBooking({ data: { rideId, seats } })
      await router.navigate({
        to: '/home',
        search: {
          bookingCreated: true,
          bookedRide: `${ride.origin} to ${ride.destination}`,
        },
      })
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : 'Unable to complete booking.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Booking</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Confirm Your Ride
        </h1>
        <p className="text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Review details, choose seats, and confirm your booking.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-[var(--line)] bg-white/60 p-5">
            <img
              src="/ride-car.svg"
              alt="Car illustration"
              className="mb-4 h-36 w-full rounded-xl border border-[var(--line)] bg-white/70 object-cover"
            />

            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              {ride.origin} to {ride.destination}
            </h2>

            <dl className="mt-4 grid gap-2 text-sm">
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
                <dt className="text-[var(--sea-ink-soft)]">Available Seats</dt>
                <dd className="m-0 font-medium text-[var(--sea-ink)]">{ride.availableSeats}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--sea-ink-soft)]">Price Per Seat</dt>
                <dd className="m-0 font-medium text-[var(--sea-ink)]">
                  ${ride.price.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--sea-ink-soft)]">Ride Type</dt>
                <dd className="m-0 font-medium text-[var(--sea-ink)]">
                  {ride.type === 'SHARED' ? 'Shared' : 'Exclusive'}
                </dd>
              </div>
            </dl>

            {ride.description ? (
              <p className="mt-4 rounded-lg border border-[var(--line)] bg-white/40 p-3 text-sm text-[var(--sea-ink-soft)]">
                {ride.description}
              </p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-white/60 p-5">
            <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">
              Booking Details
            </h2>

            <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
              Seats
              <input
                type="number"
                min={1}
                max={maxSeats}
                value={seats}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isNaN(value)) {
                    setSeats(Math.min(Math.max(value, 1), maxSeats))
                  }
                }}
                disabled={!canBook || isSubmitting}
                className="h-10 rounded-xl border border-[var(--line)] bg-white/80 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
              />
            </label>

            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--sea-ink-soft)]">Total</dt>
                <dd className="m-0 text-base font-semibold text-[var(--sea-ink)]">
                  ${(ride.price * seats).toFixed(2)}
                </dd>
              </div>
            </dl>

            {error ? (
              <p className="mt-4 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)]">
                {error}
              </p>
            ) : null}

            {!canBook ? (
              <p className="mt-4 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)]">
                This ride is currently unavailable.
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!canBook || isSubmitting}
                className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.18)] disabled:bg-white/50 disabled:text-[var(--sea-ink-soft)]"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
              <Link
                to="/rides/search"
                className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-center text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[rgba(23,58,64,0.35)]"
              >
                Back to Search
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
