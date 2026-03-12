import { getRequest } from '@tanstack/react-start/server'
import { auth } from './auth'

export async function getServerSession() {
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
}

export async function requireServerSession() {
  const session = await getServerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
