import { createFileRoute, useRouter } from '@tanstack/react-router'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/home')({
    beforeLoad: async () => {
        await requireAuthenticatedRoute()
    },
    loader: async () => {
        const session = await requireAuthenticatedRoute()
        return { session }
    },
    component: HomePage,
})

function HomePage() {
    const router = useRouter()
    const { session } = Route.useLoaderData()

    const handleLogout = async () => {
        await authClient.signOut()
        await router.navigate({
            to: '/',
            search: {
                loggedOut: '1',
                loggedOutName: session.user.name,
            },
        })
    }

    return (
        <main className="page-wrap px-4 pb-8 pt-14">
            <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
                <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
                    Welcome back, {session.user.name}
                </h1>
                <p className="text-base text-[var(--sea-ink-soft)]">
                    Here's your ride-sharing dashboard.
                </p>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                    style={{ animationDelay: '80ms' }}
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Your Rides
                    </h2>
                    <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                        No upcoming rides yet. Request or offer a ride to get started.
                    </p>
                </article>

                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                    style={{ animationDelay: '170ms' }}
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Recent Activity
                    </h2>
                    <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                        No recent activity to show. Your ride history will appear here.
                    </p>
                </article>

                <article
                    className="island-shell feature-card rise-in rounded-2xl p-5"
                    style={{ animationDelay: '260ms' }}
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Quick Actions
                    </h2>
                    <div className="mt-3 flex flex-col gap-2">
                        <button className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)]">
                            Request a Ride
                        </button>
                        <button className="w-full rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[rgba(23,58,64,0.35)]">
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
                    style={{ animationDelay: '350ms' }}
                >
                    <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
                        Stats
                    </h2>
                    <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Rides</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">0</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Miles</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">0</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">Saved</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">$0</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--sea-ink-soft)]">CO2 Saved</dt>
                            <dd className="m-0 text-lg font-semibold text-[var(--sea-ink)]">0 lb</dd>
                        </div>
                    </dl>
                </article>
            </section>
        </main>
    )
}
