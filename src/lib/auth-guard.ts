import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getServerSession } from '#/lib/auth-session'

export const getRouteSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await getServerSession()
  },
)

export async function requireAuthenticatedRoute() {
  const session = await getRouteSession()
  if (!session) {
    throw redirect({ to: '/auth/login' })
  }
  return session
}

export async function requireGuestRoute() {
  const session = await getRouteSession()
  if (session) {
    throw redirect({ to: '/home', search: { bookingCreated: undefined, bookedRide: undefined } })
  }
}
