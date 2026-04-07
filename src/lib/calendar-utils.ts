export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfMonth(date: Date): Date {
  const d = startOfMonth(date)
  d.setMonth(d.getMonth() + 1)
  d.setMilliseconds(-1)
  return d
}

// Sunday-start week
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 7)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
})

export function formatMonthYear(date: Date): string {
  return MONTH_FORMATTER.format(date)
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
})

export function formatWeekday(date: Date): string {
  return WEEKDAY_FORMATTER.format(date)
}

export function formatHour(hour: number): string {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(d)
}

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatTime(date: Date): string {
  return TIME_FORMATTER.format(date)
}

// Build the 6-week (42-cell) grid that contains the full month.
export function buildMonthGrid(cursor: Date): Array<Date> {
  const start = startOfWeek(startOfMonth(cursor))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}
