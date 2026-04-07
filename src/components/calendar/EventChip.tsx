import { Link } from '@tanstack/react-router'
import type { CalendarEvent } from './types'
import { formatTime } from '#/lib/calendar-utils'

const KIND_CLASS: Record<CalendarEvent['kind'], string> = {
  ride: 'border-[rgba(50,143,151,0.4)] bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]',
  booking:
    'border-[rgba(183,63,48,0.35)] bg-[rgba(232,138,113,0.18)] text-[rgb(138,44,35)]',
}

export default function EventChip({
  event,
  showTime = true,
}: {
  event: CalendarEvent
  showTime?: boolean
}) {
  const cls = `block truncate rounded-md border px-1.5 py-0.5 text-[11px] font-semibold no-underline transition hover:brightness-95 ${KIND_CLASS[event.kind]}`

  if (event.kind === 'ride') {
    return (
      <Link
        to="/dashboard/my-rides/$rideId/edit"
        params={{ rideId: event.id }}
        className={cls}
        title={`${event.title} — ${formatTime(event.start)}`}
      >
        {showTime ? `${formatTime(event.start)} ` : ''}
        {event.title}
      </Link>
    )
  }

  return (
    <Link
      to="/home"
      search={{ bookingCreated: undefined, bookedRide: undefined }}
      className={cls}
      title={`${event.title} — ${formatTime(event.start)}`}
    >
      {showTime ? `${formatTime(event.start)} ` : ''}
      {event.title}
    </Link>
  )
}
