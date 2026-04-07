export type CalendarEvent = {
  id: string
  kind: 'ride' | 'booking'
  title: string
  start: Date
  href: string
  hrefParams?: Record<string, string>
}
