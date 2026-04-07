import { createFileRoute } from '@tanstack/react-router'
import CalendarPage from '#/components/calendar/CalendarPage'
import CalendarSkeleton from '#/components/skeletons/CalendarSkeleton'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { getUserRides } from '#/lib/rides'
import { getUserBookings } from '#/lib/user-bookings'

export const Route = createFileRoute('/dashboard/calendar')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async () => {
    const [rides, bookings] = await Promise.all([
      getUserRides(),
      getUserBookings(),
    ])
    return { rides, bookings }
  },
  pendingComponent: CalendarSkeleton,
  pendingMs: 100,
  component: CalendarRoute,
})

function CalendarRoute() {
  const { rides, bookings } = Route.useLoaderData()
  return <CalendarPage rides={rides} bookings={bookings} />
}
