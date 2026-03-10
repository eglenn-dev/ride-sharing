import { createServerFn } from '@tanstack/react-start'
import { getServerSession } from '#/lib/auth-session'

export const getRouteSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await getServerSession()
  },
)
