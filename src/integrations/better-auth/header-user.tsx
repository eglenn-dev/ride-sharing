import { authClient } from '#/lib/auth-client'
import { Link, useRouter } from '@tanstack/react-router'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  if (isPending) {
    return (
      <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {session.user.name.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          onClick={async () => {
            await authClient.signOut()
            await router.navigate({
              to: '/',
              search: {
                loggedOut: true,
                loggedOutName: session.user.name,
              },
            })
          }}
          className="h-9 px-4 text-sm font-medium rounded-full border border-[var(--line)] bg-transparent text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/auth/login"
        className="h-9 px-4 text-sm font-medium rounded-full border border-[var(--line)] bg-transparent text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition-colors inline-flex items-center no-underline"
      >
        Log in
      </Link>
      <Link
        to="/auth/signup"
        className="h-9 px-4 text-sm font-medium rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] text-[var(--lagoon-deep)] hover:bg-[rgba(79,184,178,0.24)] transition-colors inline-flex items-center no-underline"
      >
        Sign up
      </Link>
    </div>
  )
}
