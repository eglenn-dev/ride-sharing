import { createFileRoute, useRouter } from '@tanstack/react-router'
import RideTemplateForm from '#/components/RideTemplateForm'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { getRideTemplate, updateRideTemplate } from '#/lib/ride-templates'

export const Route = createFileRoute('/rides/templates_/$templateId/edit')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  loader: async ({ params }) => {
    return { template: await getRideTemplate({ data: params.templateId }) }
  },
  pendingMs: 100,
  component: EditTemplatePage,
})

function toDateInput(value: Date | string | null): string {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function EditTemplatePage() {
  const { template } = Route.useLoaderData()
  const router = useRouter()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Driver</p>
        <h1 className="display-title mb-6 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Edit template
        </h1>

        <RideTemplateForm
          initialValues={{
            origin: template.origin,
            destination: template.destination,
            type: template.type,
            seats: template.seats,
            price: template.price,
            description: template.description ?? '',
            daysOfWeek: template.daysOfWeek,
            departureHour: template.departureHour,
            departureMin: template.departureMin,
            startsOn: toDateInput(template.startsOn),
            endsOn: toDateInput(template.endsOn),
          }}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await updateRideTemplate({
              data: {
                id: template.id,
                origin: values.origin.trim(),
                destination: values.destination.trim(),
                type: values.type,
                seats: values.seats,
                price: values.price,
                description: values.description.trim() || undefined,
                daysOfWeek: values.daysOfWeek,
                departureHour: values.departureHour,
                departureMin: values.departureMin,
                startsOn: new Date(values.startsOn).toISOString(),
                endsOn: values.endsOn
                  ? new Date(values.endsOn).toISOString()
                  : undefined,
              },
            })
            await router.navigate({ to: '/rides/templates' })
          }}
        />
      </section>
    </main>
  )
}
