import { useMemo, useState } from 'react'
import CalendarHeader from './CalendarHeader'
import MonthView from './MonthView'
import WeekView from './WeekView'
import type { CalendarEvent } from './types'
import { addDays } from '#/lib/calendar-utils'

type View = 'month' | 'week'

type CalendarRide = {
  id: string
  origin: string
  destination: string
  departureTime: string | Date
  status: string
}

type CalendarBooking = {
  id: string
  status: string
  ride: {
    origin: string
    destination: string
    departureTime: string | Date
  }
}

export default function CalendarPage({
  rides,
  bookings,
}: {
  rides: Array<CalendarRide>
  bookings: Array<CalendarBooking>
}) {
  const [view, setView] = useState<View>('month')
  const [cursor, setCursor] = useState(() => new Date())

  const events = useMemo<Array<CalendarEvent>>(() => {
    const rideEvents: Array<CalendarEvent> = rides
      .filter((ride) => ride.status !== 'CANCELLED')
      .map((ride) => ({
        id: ride.id,
        kind: 'ride' as const,
        title: `${ride.origin} → ${ride.destination}`,
        start: new Date(ride.departureTime),
        href: '/dashboard/my-rides/$rideId/edit',
      }))

    const bookingEvents: Array<CalendarEvent> = bookings
      .filter((booking) => booking.status !== 'CANCELLED')
      .map((booking) => ({
        id: booking.id,
        kind: 'booking' as const,
        title: `${booking.ride.origin} → ${booking.ride.destination}`,
        start: new Date(booking.ride.departureTime),
        href: '/home',
      }))

    return [...rideEvents, ...bookingEvents]
  }, [rides, bookings])

  const handlePrev = () => {
    if (view === 'month') {
      const next = new Date(cursor)
      next.setMonth(next.getMonth() - 1)
      setCursor(next)
    } else {
      setCursor(addDays(cursor, -7))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      const next = new Date(cursor)
      next.setMonth(next.getMonth() + 1)
      setCursor(next)
    } else {
      setCursor(addDays(cursor, 7))
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Schedule</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Calendar
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Your offered rides and bookings on a single timeline.
        </p>

        <CalendarHeader
          cursor={cursor}
          view={view}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={() => setCursor(new Date())}
          onViewChange={setView}
        />

        {view === 'month' ? (
          <MonthView cursor={cursor} events={events} />
        ) : (
          <WeekView cursor={cursor} events={events} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--sea-ink-soft)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-[rgba(50,143,151,0.4)] bg-[rgba(79,184,178,0.18)]" />
            Offered ride
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-[rgba(183,63,48,0.35)] bg-[rgba(232,138,113,0.18)]" />
            Booking
          </span>
        </div>
      </section>
    </main>
  )
}
