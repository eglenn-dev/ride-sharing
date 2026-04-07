import {
  buildMonthGrid,
  formatWeekday,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from '#/lib/calendar-utils'
import EventChip from './EventChip'
import type { CalendarEvent } from './types'

const MAX_VISIBLE = 3

export default function MonthView({
  cursor,
  events,
}: {
  cursor: Date
  events: Array<CalendarEvent>
}) {
  const cells = buildMonthGrid(cursor)
  const today = new Date()

  // pre-build a quick lookup map: dayKey -> events[]
  const byDay = new Map<string, Array<CalendarEvent>>()
  for (const event of events) {
    const key = event.start.toDateString()
    const list = byDay.get(key)
    if (list) {
      list.push(event)
    } else {
      byDay.set(key, [event])
    }
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  const weekStart = startOfWeek(new Date())

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/40">
      <div className="grid grid-cols-7 border-b border-[var(--line)] bg-white/60 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
        {Array.from({ length: 7 }, (_, i) => {
          const sample = new Date(weekStart)
          sample.setDate(sample.getDate() + i)
          return (
            <div key={i} className="px-2 py-2 text-center">
              {formatWeekday(sample)}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day) => {
          const isCurrentMonth = isSameMonth(day, cursor)
          const isToday = isSameDay(day, today)
          const dayEvents = byDay.get(day.toDateString()) ?? []
          const visible = dayEvents.slice(0, MAX_VISIBLE)
          const overflow = dayEvents.length - visible.length

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[96px] border-b border-r border-[var(--line)] p-1.5 text-xs ${
                isCurrentMonth ? 'bg-white/40' : 'bg-white/10 text-[var(--sea-ink-soft)]'
              }`}
            >
              <div
                className={`mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                  isToday
                    ? 'bg-[var(--lagoon-deep)] text-white'
                    : isCurrentMonth
                      ? 'text-[var(--sea-ink)]'
                      : 'text-[var(--sea-ink-soft)]'
                }`}
              >
                {day.getDate()}
              </div>
              <div className="grid gap-1">
                {visible.map((event) => (
                  <EventChip key={`${event.kind}-${event.id}`} event={event} />
                ))}
                {overflow > 0 && (
                  <p className="m-0 px-1 text-[10px] font-semibold text-[var(--sea-ink-soft)]">
                    +{overflow} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
