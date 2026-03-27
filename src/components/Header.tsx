import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { data: session } = authClient.useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between gap-3 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            search={{ loggedOut: undefined, loggedOutName: undefined }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            RideShare
          </Link>
        </h2>

        <div className="hidden items-center gap-4 text-sm font-semibold md:flex">
          <Link
            to="/"
            search={{ loggedOut: undefined, loggedOutName: undefined }}
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          {session?.user && (
            <Link
              to="/home"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Dashboard
            </Link>
          )}
          {session?.user && (
            <Link
              to="/rides/search"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Find Rides
            </Link>
          )}
          <details className="relative">
            <summary className="nav-link list-none cursor-pointer">
              Demos
            </summary>
            <div className="absolute right-0 mt-2 min-w-56 rounded-xl border border-[var(--line)] bg-[var(--header-bg)] p-2 shadow-lg">
              <a
                href="/demo/better-auth"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
              >
                Better Auth
              </a>
            </div>
          </details>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationBell userId={session?.user?.id} />
          <BetterAuthHeader />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]"
          >
            <span className="sr-only">Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="page-wrap pb-4 md:hidden">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-2 shadow-[0_14px_30px_rgba(23,58,64,0.14)]">
            <div className="grid gap-1 text-sm font-semibold">
              <Link
                to="/"
                search={{ loggedOut: undefined, loggedOutName: undefined }}
                className="rounded-lg px-3 py-2 text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {session?.user && (
                <Link
                  to="/home"
                  className="rounded-lg px-3 py-2 text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {session?.user && (
                <Link
                  to="/rides/search"
                  className="rounded-lg px-3 py-2 text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Rides
                </Link>
              )}
              <a
                href="/demo/better-auth"
                className="rounded-lg px-3 py-2 text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Better Auth Demo
              </a>
            </div>

            <div className="mt-2 border-t border-[var(--line)] pt-2">
              <div className="mb-2 flex justify-end px-1">
                <NotificationBell userId={session?.user?.id} />
              </div>
              <BetterAuthHeader />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
