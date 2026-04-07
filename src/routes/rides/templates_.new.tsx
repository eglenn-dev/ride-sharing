import { createFileRoute, useRouter } from '@tanstack/react-router'
import RideTemplateForm, {
  buildEmptyTemplateValues,
} from '#/components/RideTemplateForm'
import { requireAuthenticatedRoute } from '#/lib/auth-guard'
import { createRideTemplate } from '#/lib/ride-templates'

export const Route = createFileRoute('/rides/templates_/new')({
  beforeLoad: async () => {
    await requireAuthenticatedRoute()
  },
  component: NewTemplatePage,
})

function NewTemplatePage() {
  const router = useRouter()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <p className="island-kicker mb-2">Driver</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          New recurring template
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Set the schedule once. We&apos;ll publish concrete rides for the next two weeks automatically.
        </p>

        <RideTemplateForm
          initialValues={buildEmptyTemplateValues()}
          submitLabel="Create template"
          onSubmit={async (values) => {
            await createRideTemplate({
              data: {
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
