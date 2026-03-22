import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { requireGuestRoute } from '#/lib/auth-guard'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    await requireGuestRoute()
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })
      if (result.error) {
        setError(result.error.message || 'Sign in failed')
      } else {
        await router.navigate({ to: '/home' })
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in mx-auto max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-2 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          Log in
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Enter your email below to log in to your account
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-[var(--sea-ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[var(--line)] bg-transparent px-3 text-sm text-[var(--sea-ink)] focus:outline-none focus:border-[var(--lagoon-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium leading-none text-[var(--sea-ink)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[var(--line)] bg-transparent px-3 text-sm text-[var(--sea-ink)] focus:outline-none focus:border-[var(--lagoon-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.24)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--lagoon-deep)]/30 border-t-[var(--lagoon-deep)]" />
                <span>Please wait</span>
              </span>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[var(--lagoon-deep)] hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
