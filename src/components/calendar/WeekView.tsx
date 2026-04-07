import {
  addDays,
  formatHour,
  formatWeekday,
  isSameDay,
  startOfWeek,
} from '#/lib/calendar-utils'
import EventChip from './EventChip'
import type { CalendarEvent } from './types'

const START_HOUR = 6
const END_HOUR = 23
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i,
)

export default function WeekView({
  cursor,
  events,
}: {
  cursor: Date
  events: Array<CalendarEvent>
}) {
  const weekStart = startOfWeek(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/40">
      <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-[var(--line)] bg-white/60 text-xs font-semibold text-[var(--sea-ink-soft)]">
        <div className="px-2 py-2" />
        {days.map((day) => {
          const isToday = isSameDay(day, today)
          return (
            <div
              key={day.toISOString()}
              className={`px-2 py-2 text-center ${isToday ? 'text-[var(--lagoon-deep)]' : ''}`}
            >
              <div className="uppercase tracking-wide">{formatWeekday(day)}</div>
              <div
                className={`mx-auto mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] ${
                  isToday ? 'bg-[var(--lagoon-deep)] text-white' : 'text-[var(--sea-ink)]'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
        {/* hour gutter */}
        <div className="border-r border-[var(--line)] bg-white/30">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-12 px-2 text-right text-[10px] font-semibold text-[var(--sea-ink-soft)]"
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(event.start, day))
          return (
            <div
              key={day.toISOString()}
              className="relative border-r border-[var(--line)]"
              style={{ height: `${HOURS.length * 48}px` }}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-[var(--line)]"
                />
              ))}

              {dayEvents.map((event) => {
                const minutesFromStart =
                  (event.start.getHours() - START_HOUR) * 60 +
                  event.start.getMinutes()
                if (minutesFromStart < 0) return null
                const top = (minutesFromStart / 60) * 48
                if (top > HOURS.length * 48 - 4) return null
                return (
                  <div
                    key={`${event.kind}-${event.id}`}
                    className="absolute left-1 right-1"
                    style={{ top: `${top}px` }}
                  >
                    <EventChip event={event} showTime={false} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
