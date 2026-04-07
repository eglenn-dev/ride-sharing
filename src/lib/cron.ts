export function assertCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    throw new Response('CRON_SECRET not configured', { status: 500 })
  }

  const header = request.headers.get('authorization')
  if (header !== `Bearer ${secret}`) {
    throw new Response('Unauthorized', { status: 401 })
  }
}
