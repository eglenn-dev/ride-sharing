import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import { assertCronRequest } from '#/lib/cron'
import { materializeTemplate } from '#/lib/materialize-template'

const DAYS_AHEAD = 14

export const Route = createFileRoute('/api/cron/materialize-recurring-rides')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          assertCronRequest(request)
        } catch (response) {
          if (response instanceof Response) return response
          throw response
        }

        const templates = await prisma.rideTemplate.findMany({
          where: { isPaused: false },
        })

        const until = new Date()
        until.setDate(until.getDate() + DAYS_AHEAD)

        let totalCreated = 0
        for (const template of templates) {
          totalCreated += await materializeTemplate(template, until)
        }

        return Response.json({
          templates: templates.length,
          created: totalCreated,
        })
      },
    },
  },
})
