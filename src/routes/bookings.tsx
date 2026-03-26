import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRouteSession } from '#/lib/auth-guard'
import { prisma } from '#/db'

export const Route = createFileRoute('/bookings')({
    beforeLoad: async () => {
        const session = await getRouteSession()
        if (!session) {
            throw redirect({ to: '/login' })
        }
    },
    loader: async () => {
        const session = await getRouteSession()
        const userId = session!.user.id

        const bookings = await prisma.booking.findMany({
            where: { riderId: userId },
            include: {
                ride: {
                    select: {
                        id: true,
                        origin: true,
                        destination: true,
                        departureTime: true,
                        price: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return { bookings }
    },
    component: BookingsPage,
})

function BookingsPage() {
    const { bookings } = Route.useLoaderData()

    return (
        <main className="page-wrap px-4 pb-8 pt-14">
            <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
                <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
                    Your Bookings
                </h1>
                <p className="mb-6 text-base text-[var(--sea-ink-soft)]">
                    Review your confirmed and past ride bookings.
                </p>

                {bookings.length === 0 ? (
                    <p className="text-sm text-[var(--sea-ink-soft)]">You have no bookings yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking: (typeof bookings)[number]) => (
                            <article
                                key={booking.id}
                                className="feature-card rounded-2xl border border-[var(--line)] p-5"
                            >
                                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                                    {booking.ride.origin} to {booking.ride.destination}
                                </p>
                                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                                    Departure: {new Date(booking.ride.departureTime).toLocaleString()}
                                </p>
                                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                                    Seats booked: {booking.seatsBooked}
                                </p>
                                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                                    Booking status: {booking.status}
                                </p>
                                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                                    Ride status: {booking.ride.status}
                                </p>
                                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                                    Price: ${booking.ride.price.toFixed(2)}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}