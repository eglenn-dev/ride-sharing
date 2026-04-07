import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { authClient } from '#/lib/auth-client'
import BookingCard from '#/components/BookingCard'
import HomeSkeleton from '#/components/skeletons/HomeSkeleton'
import ReviewDialog from '#/components/reviews/ReviewDialog'
import { cancelBooking } from '#/lib/cancel-booking'
import { updateBookingSeats } from '#/lib/bookings'
import { getNotifications } from '#/lib/notifications'
import { getPendingReviewsForCurrentUser } from '#/lib/ratings'
import { getUserRides } from '#/lib/rides'
import { getUserBookings } from '#/lib/user-bookings'

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
})

export const Route = createFileRoute('/home')({
    validateSearch: (search: Record<string, unknown>) => ({
        bookingCreated: search.bookingCreated === true ? true : undefined,
        bookedRide:
            typeof search.bookedRide === 'string' && search.bookedRide.trim().length > 0
                ? search.bookedRide.trim().slice(0, 80)
                : undefined,
    }),
    beforeLoad: async () => {
        await requireAuthenticatedRoute()
    },
    loader: async () => {
        const session = await requireAuthenticatedRoute()
        const [rides, bookings, notifications, pendingReviews] = await Promise.all([
            getUserRides(),
            getUserBookings(),
            getNotifications(),
            getPendingReviewsForCurrentUser(),
        ])
        return { session, rides, bookings, notifications, pendingReviews }
    },
    pendingComponent: HomeSkeleton,
    pendingMs: 100,
    component: HomePage,
})

function HomePage() {
    const router = useRouter()
    const { session, rides, bookings, notifications, pendingReviews } = Route.useLoaderData()
    const { bookingCreated, bookedRide } = Route.useSearch()
    const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
    const [cancelError, setCancelError] = useState<string | null>(null)
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
    const [editingSeats, setEditingSeats] = useState(1)
    const [savingBookingId, setSavingBookingId] = useState<string | null>(null)
    const [nowMs, setNowMs] = useState(Date.now())
    const [activeReviewKey, setActiveReviewKey] = useState<string | null>(null)
    const activeReview = pendingReviews.find(
        (item) => `${item.rideId}:${item.subject.id}` === activeReviewKey,
    )

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNowMs(Date.now())
        }, 1000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [])

    const now = new Date()
    const upcomingRides = rides
        .filter((ride) => ride.status === 'ACTIVE' && new Date(ride.departureTime) >= now)
        .sort(
            (a, b) =>
                new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
        )
    const activeRides = rides
        .filter((ride) => ride.status === 'ACTIVE')
        .sort(
            (a, b) =>
                new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
        )
    const ridesToShow = (upcomingRides.length > 0 ? upcomingRides : activeRides).slice(0, 3)
    const upcomingBookedRides = bookings
        .filter(
            (booking) =>
                booking.status === 'CONFIRMED' &&
                new Date(booking.ride.departureTime) >= now,
        )
        .sort(
            (a, b) =>
                new Date(a.ride.departureTime).getTime() -
                new Date(b.ride.departureTime).getTime(),
        )
    const bookedRidesToShow = upcomingBookedRides.slice(0, 3)
    const showingBookedRides = ridesToShow.length === 0 && bookedRidesToShow.length > 0
    const ridePanelItems = showingBookedRides
        ? bookedRidesToShow.map((booking) => ({
              id: booking.id,
              title: `${booking.ride.origin} to ${booking.ride.destination}`,
              subtitle: `${DATE_TIME_FORMATTER.format(new Date(booking.ride.departureTime))} • ${booking.seatsBooked} seat${booking.seatsBooked === 1 ? '' : 's'} booked`,
          }))
        : ridesToShow.map((ride) => ({
              id: ride.id,
              title: `${ride.origin} to ${ride.destination}`,
              subtitle: `${DATE_TIME_FORMATTER.format(new Date(ride.departureTime))} • ${ride.availableSeats} seats left`,
          }))
    const totalRideCountForPanel = showingBookedRides
        ? upcomingBookedRides.length
        : upcomingRides.length > 0
          ? upcomingRides.length
          : activeRides.length
    const recentActivity = (
        notifications.length > 0
            ? notifications.map((notification) => ({
                  id: notification.id,
                  message: notification.message,
                  createdAt: notification.createdAt,
              }))
            : bookings.map((booking) => ({
                  id: booking.id,
                  message:
                      booking.status === 'CONFIRMED'
                          ? `Booked ride from ${booking.ride.origin} to ${booking.ride.destination}`
                          : `Cancelled ride from ${booking.ride.origin} to ${booking.ride.destination}`,
                  createdAt: booking.createdAt,
              }))
    )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3)
    const confirmedBookings = bookings.filter(
        (booking) => booking.status === 'CONFIRMED',
    )
    const cancelledBookings = bookings.filter(
        (booking) => booking.status === 'CANCELLED',
    )
    const sortedBookings = [...bookings].sort((a, b) => {
        const getPriority = (booking: (typeof bookings)[number]) => {
            if (booking.status === 'CONFIRMED' && booking.ride.status === 'ACTIVE') {
                return 0
            }
            if (booking.status === 'CONFIRMED') {
                return 1
            }
            return 2
        }

        const priorityDiff = getPriority(a) - getPriority(b)
        if (priorityDiff !== 0) {
            return priorityDiff
        }

        return (
            new Date(b.ride.departureTime).getTime() -
            new Date(a.ride.departureTime).getTime()
        )
    })
    const totalSpent = confirmedBookings.reduce(
        (sum, booking) => sum + booking.ride.price * booking.seatsBooked,
        0,
    )
    const upcomingRideMoments = [
        ...upcomingRides.map((ride) => ({
            id: `driver-${ride.id}`,
            title: `${ride.origin} to ${ride.destination}`,
            departureTime: new Date(ride.departureTime),
        })),
        ...upcomingBookedRides.map((booking) => ({
            id: `booking-${booking.id}`,
            title: `${booking.ride.origin} to ${booking.ride.destination}`,
            departureTime: new Date(booking.ride.departureTime),
        })),
    ].sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime())
    const nextUpcomingRide = upcomingRideMoments.at(0)
    const timeUntilNextRideMs = nextUpcomingRide
        ? nextUpcomingRide.departureTime.getTime() - nowMs
        : null
    const showNextRideCountdown =
        timeUntilNextRideMs !== null &&
        timeUntilNextRideMs > 0 &&
        timeUntilNextRideMs <= 12 * 60 * 60 * 1000
    const countdownTotalSeconds = showNextRideCountdown
        ? Math.floor(timeUntilNextRideMs / 1000)
        : 0
    const countdownHours = Math.floor(countdownTotalSeconds / 3600)
    const countdownMinutes = Math.floor((countdownTotalSeconds % 3600) / 60)
    const countdownSeconds = countdownTotalSeconds % 60

    const handleLogout = async () => {
        await authClient.signOut()
        await router.navigate({
            to: '/',
            search: {
                loggedOut: true,
                loggedOutName: session.user.name,
            },
        })
    }

    const handleCancelBooking = async (bookingId: string) => {
        setCancelError(null)
        setCancellingBookingId(bookingId)

        try {
            await cancelBooking({ data: bookingId })
            await router.invalidate()
        } catch (error) {
            setCancelError(
                error instanceof Error ? error.message : 'Unable to cancel booking.',
            )
        } finally {
            setCancellingBookingId(null)
        }
    }

    const handleStartEditingBooking = (bookingId: string, seatsBooked: number) => {
        setCancelError(null)
        setEditingBookingId(bookingId)
        setEditingSeats(seatsBooked)
    }

    const handleSaveBooking = async (bookingId: string) => {
        setCancelError(null)
        setSavingBookingId(bookingId)

        try {
            await updateBookingSeats({
                data: {
                    bookingId,
                    seats: editingSeats,
                },
            })
            setEditingBookingId(null)
            await router.invalidate()
        } catch (error) {
            setCancelError(
                error instanceof Error ? error.message : 'Unable to update booking.',
            )
        } finally {
            setSavingBookingId(null)
        }
    }

    return (
        <main className="page-wrap px-4 pb-8 pt-14">
            {bookingCreated === true && (
                <section className="island-shell mb-6 rounded-xl border border-[rgba(50,143,151,0.25)] bg-[rgba(79,184,178,0.12)] p-4">
                    <div className="flex items-start justify-between gap-3">
                        <p className="m-0 text-sm text-[var(--sea-ink)]">
                            {bookedRide
                                ? `Booking confirmed for ${bookedRide}.`
                                : 'Your booking has been confirmed.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                void router.navigate({
                                    to: '/home',
                                    search: {
                                        bookingCreated: undefined,
                                        bookedRide: undefined,
                                    },
                                })
                            }}
                            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
                        >
                            Dismiss
                        </button>
                    </div>
                </section>
            )}

            <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
                <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
                    Welcome back, {session.user.name}
                </h1>
                <p className="text-base text-[var(--sea-ink-soft)]">
                    Here's your ride-sharing dashboard.
                </p>
                {showNextRideCountdown && nextUpcomingRide != null ? (
                    <div className="mt-4 rounded-xl border border-[rgba(50,143,151,0.28)] bg-[rgba(79,184,178,0.1)] p-4">
                        <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                            Next ride in {countdownHours}h {countdownMinutes}m {countdownSeconds}s
                        </p>
                        <p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">
                            {nextUpcomingRide.title} departs at{' '}
                            {DATE_TIME_FORMATTER.format(nextUpcomingRide.departureTime)}
                        </p>
                    </div>
                ) : null}
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Your Rides
                    </h2>
                    {ridesToShow.length === 0 && bookedRidesToShow.length === 0 ? (
                        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                            No active rides yet. Offer a ride or book one to get started.
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {ridePanelItems.map((ride) => (
                                <div
                                    key={ride.id}
                                    className="rounded-xl border border-[var(--line)] bg-white/60 p-2.5"
                                >
                                    <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                                        {ride.title}
                                    </p>
                                    <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                                        {ride.subtitle}
                                    </p>
                                </div>
                            ))}
                            {totalRideCountForPanel > 3 ? (
                                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                                    +{totalRideCountForPanel - 3} more rides
                                </p>
                            ) : null}
                        </div>
                    )}
                </article>

                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Recent Activity
                    </h2>
                    {recentActivity.length === 0 ? (
                        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                            No recent activity to show yet.
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="rounded-xl border border-[var(--line)] bg-white/60 p-2.5"
                                >
                                    <p className="m-0 text-sm text-[var(--sea-ink)]">{activity.message}</p>
                                    <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                                        {DATE_TIME_FORMATTER.format(new Date(activity.createdAt))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Quick Actions
                    </h2>
                    <div className="mt-3 flex flex-col gap-2">
                        <button
                            className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]"
                            onClick={() => {
                                void router.navigate({ to: '/rides/search' })
                            }}
                        >
                            Request a Ride
                        </button>
                        <button
                            className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[rgba(23,58,64,0.35)]"
                            onClick={() => {
                                void router.navigate({ to: '/rides/create' })
                            }}
                        >
                            Offer a Ride
                        </button>
                        <button
                            className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[rgba(23,58,64,0.35)]"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </article>

                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Stats
                    </h2>
                    <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Offered</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                                {activeRides.length}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Booked</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                                {confirmedBookings.length}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Cancelled</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                                {cancelledBookings.length}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Spent</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                                ${totalSpent.toFixed(2)}
                            </dd>
                        </div>
                    </dl>
                </article>
            </section>

            {pendingReviews.length > 0 && (
                <section className="mt-8">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="m-0 text-xl font-semibold text-[var(--sea-ink)]">
                            Awaiting your review
                        </h2>
                        <span className="text-sm text-[var(--sea-ink-soft)]">
                            {pendingReviews.length} pending
                        </span>
                    </div>
                    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                        {pendingReviews.map((item) => {
                            const key = `${item.rideId}:${item.subject.id}`
                            return (
                                <li
                                    key={key}
                                    className="rounded-2xl border border-[var(--line)] bg-white/50 p-4"
                                >
                                    <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                                        {item.subject.name}
                                    </p>
                                    <p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">
                                        {item.rideLabel}
                                    </p>
                                    <p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">
                                        {DATE_TIME_FORMATTER.format(new Date(item.departureTime))}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveReviewKey(key)}
                                        className="mt-3 inline-flex rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.18)] px-3 py-1.5 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.28)]"
                                    >
                                        Leave a review
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            )}

            {activeReview ? (
                <ReviewDialog
                    rideId={activeReview.rideId}
                    rideLabel={activeReview.rideLabel}
                    subject={activeReview.subject}
                    onClose={() => setActiveReviewKey(null)}
                    onSubmitted={() => {
                        setActiveReviewKey(null)
                        void router.invalidate()
                    }}
                />
            ) : null}

            <section className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="m-0 text-xl font-semibold text-[var(--sea-ink)]">
                        My Bookings
                    </h2>
                    <span className="text-sm text-[var(--sea-ink-soft)]">
                        {bookings.length} booking{bookings.length === 1 ? '' : 's'}
                    </span>
                </div>

                {cancelError ? (
                    <article className="island-shell mb-4 rounded-2xl border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-4 text-sm font-medium text-[rgb(138,44,35)]">
                        {cancelError}
                    </article>
                ) : null}

                {bookings.length === 0 ? (
                    <article className="island-shell rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--sea-ink-soft)]">
                        You have no bookings yet. Find a ride and reserve your seat.
                    </article>
                ) : (
                    <div className="grid justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {sortedBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                nowMs={nowMs}
                                isEditing={editingBookingId === booking.id}
                                editingSeats={editingSeats}
                                isSaving={savingBookingId === booking.id}
                                isCancelling={cancellingBookingId === booking.id}
                                onStartEditing={handleStartEditingBooking}
                                onSaveEditing={handleSaveBooking}
                                onCancelEditing={() => setEditingBookingId(null)}
                                onCancelBooking={handleCancelBooking}
                                onEditingSeatsChange={setEditingSeats}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
