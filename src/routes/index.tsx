import { authClient } from '#/lib/auth-client'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    validateSearch: (search: Record<string, unknown>) => ({
        loggedOut: search.loggedOut === '1' ? '1' : undefined,
        loggedOutName:
            typeof search.loggedOutName === 'string' && search.loggedOutName.trim().length > 0
                ? search.loggedOutName.trim().slice(0, 50)
                : undefined,
    }),
    component: App,
})

function App() {
    const router = useRouter()
    const { loggedOut, loggedOutName } = Route.useSearch()
    const { data: session } = authClient.useSession()

    return (
        <main className="pb-8">
            <section className="hero-commuter hero-full-bleed rise-in relative overflow-hidden">
                <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
                {loggedOut === '1' && (
                    <div className="pointer-events-none absolute inset-x-0 top-4 z-20">
                        <div className="page-wrap px-6 sm:px-10">
                            <div className="pointer-events-auto max-w-2xl rounded-xl border border-[rgba(230,255,250,0.42)] bg-[rgba(7,34,41,0.62)] p-4 text-white shadow-[0_14px_34px_rgba(3,11,16,0.36)] backdrop-blur-md">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="m-0 text-sm text-white/95">
                                        {loggedOutName
                                            ? `Goodbye and ride safe, ${loggedOutName}. You have been logged out.`
                                            : 'You have been logged out. Goodbye and ride safe.'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void router.navigate({
                                                to: '/',
                                                search: { loggedOut: undefined, loggedOutName: undefined },
                                            })
                                        }}
                                        className="rounded-full border border-white/45 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="page-wrap px-6 py-5 sm:px-10 sm:py-8">
                    <p className="island-kicker mb-3">Ride Sharing Made Simple</p>
                    <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
                        Share the ride, share the journey.
                    </h1>
                    <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
                        Connect with riders and drivers in your community. Save money, reduce
                        your carbon footprint, and make every commute count.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {session?.user && (
                            <>
                            <Link
                                to="/rides/search"
                                className="hero-cta hero-cta-primary"
                            >
                                Find Rides
                            </Link>

                            <Link
                                to="/home"
                                search={{ bookingCreated: undefined, bookedRide: undefined }}
                                className="hero-cta hero-cta-secondary"
                            >
                                View Dashboard
                            </Link>

                            </>
                        )}
                        {!session?.user && (
                            <>
                                <Link
                                    to="/auth/signup"
                                    className="hero-cta hero-cta-primary"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/auth/login"
                                    className="hero-cta hero-cta-secondary"
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="page-wrap mt-8 grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    [
                        'Share Rides',
                        'Find drivers and passengers heading your way. Carpooling has never been easier.',
                    ],
                    [
                        'Save Money',
                        'Split fuel costs and tolls with fellow riders. Keep more in your wallet.',
                    ],
                    [
                        'Go Green',
                        'Fewer cars on the road means less emissions. Every shared ride helps the planet.',
                    ],
                    [
                        'Stay Safe',
                        'Verified profiles, ride tracking, and community ratings you can trust.',
                    ],
                ].map(([title, desc], index) => (
                    <article
                        key={title}
                        className="island-shell feature-card rise-in rounded-2xl p-5"
                        style={{ animationDelay: `${index * 90 + 80}ms` }}
                    >
                        <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                            {title}
                        </h2>
                        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
                    </article>
                ))}
            </section>

            <section className="page-wrap px-4">
                <div className="island-shell mt-8 rounded-2xl p-6">
                <p className="island-kicker mb-2">How It Works</p>
                <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
                    <li>
                        <strong className="text-[var(--sea-ink)]">Sign up</strong> — Create
                        your free account in seconds.
                    </li>
                    <li>
                        <strong className="text-[var(--sea-ink)]">Find a ride</strong> —
                        Search for rides near you or post your own route.
                    </li>
                    <li>
                        <strong className="text-[var(--sea-ink)]">Hit the road</strong> —
                        Connect with your match and enjoy the journey together.
                    </li>
                </ul>
                </div>
            </section>
        </main>
    )
}
