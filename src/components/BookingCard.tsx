import type { getUserBookings } from '#/lib/user-bookings'

type Booking = Awaited<ReturnType<typeof getUserBookings>>[number]

type BookingCardProps = {
  booking: Booking
  nowMs: number
  isEditing: boolean
  editingSeats: number
  isSaving: boolean
  isCancelling: boolean
  onStartEditing: (bookingId: string, seatsBooked: number) => void
  onSaveEditing: (bookingId: string) => void
  onCancelEditing: () => void
  onCancelBooking: (bookingId: string) => void
  onEditingSeatsChange: (seats: number) => void
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function BookingCard({
  booking,
  nowMs,
  isEditing,
  editingSeats,
  isSaving,
  isCancelling,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onCancelBooking,
  onEditingSeatsChange,
}: BookingCardProps) {
  const canEditBooking =
    booking.status === 'CONFIRMED' &&
    new Date(booking.ride.departureTime).getTime() > nowMs
  const maxEditableSeats = booking.seatsBooked + booking.ride.availableSeats

  return (
    <article className="island-shell feature-card rise-in w-full max-w-sm rounded-2xl p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
          {booking.ride.origin} to {booking.ride.destination}
        </h3>
        <span className="rounded-full border border-[var(--line)] bg-white/60 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
          {booking.status}
        </span>
      </div>

      <dl className="m-0 grid gap-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--sea-ink-soft)]">Departure</dt>
          <dd className="m-0 font-medium text-[var(--sea-ink)]">
            {DATE_TIME_FORMATTER.format(new Date(booking.ride.departureTime))}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--sea-ink-soft)]">Driver</dt>
          <dd className="m-0 font-medium text-[var(--sea-ink)]">
            {booking.ride.driver.name}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--sea-ink-soft)]">Seats</dt>
          <dd className="m-0 font-medium text-[var(--sea-ink)]">
            {isEditing ? (
              <input
                type="number"
                aria-label="Edit booked seats"
                title="Edit booked seats"
                min={1}
                max={Math.max(1, maxEditableSeats)}
                value={editingSeats}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isNaN(value)) {
                    onEditingSeatsChange(
                      Math.min(Math.max(value, 1), Math.max(1, maxEditableSeats)),
                    )
                  }
                }}
                disabled={isSaving}
                className="h-8 w-20 rounded-lg border border-[var(--line)] bg-white/80 px-2 text-xs text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
              />
            ) : (
              booking.seatsBooked
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--sea-ink-soft)]">Total</dt>
          <dd
            className={`m-0 font-medium ${booking.status === 'CANCELLED' ? 'text-[var(--sea-ink-soft)] line-through' : 'text-[var(--sea-ink)]'}`}
          >
            ${(booking.ride.price * (isEditing ? editingSeats : booking.seatsBooked)).toFixed(2)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => {
                void onSaveEditing(booking.id)
              }}
              disabled={isSaving}
              className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.18)] disabled:bg-white/50 disabled:text-[var(--sea-ink-soft)]"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[rgba(23,58,64,0.35)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.12)] disabled:bg-white/30 disabled:text-[var(--sea-ink-soft)]"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!canEditBooking}
            onClick={() => {
              onStartEditing(booking.id, booking.seatsBooked)
            }}
            className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.18)] disabled:bg-white/50 disabled:text-[var(--sea-ink-soft)]"
          >
            Edit Booking
          </button>
        )}
        <button
          type="button"
          disabled={
            booking.status !== 'CONFIRMED' ||
            isCancelling ||
            new Date(booking.ride.departureTime).getTime() <= nowMs ||
            isEditing
          }
          onClick={() => {
            if (!window.confirm('Cancel this booking? This cannot be undone.')) return
            void onCancelBooking(booking.id)
          }}
          className="w-full rounded-full border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] px-4 py-2 text-sm font-semibold text-[rgb(138,44,35)] transition hover:bg-[rgba(183,63,48,0.14)] disabled:cursor-not-allowed disabled:border-[rgba(23,58,64,0.18)] disabled:bg-white/50 disabled:text-[var(--sea-ink-soft)]"
        >
          {isCancelling
            ? 'Cancelling...'
            : booking.status === 'CONFIRMED'
              ? 'Cancel Booking'
              : 'Cancelled'}
        </button>
      </div>
    </article>
  )
}
