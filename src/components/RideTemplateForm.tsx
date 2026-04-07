import { useState } from 'react'

type RideType = 'SHARED' | 'EXCLUSIVE'

export type RideTemplateFormValues = {
  origin: string
  destination: string
  type: RideType
  seats: number
  price: number
  description: string
  daysOfWeek: Array<number>
  departureHour: number
  departureMin: number
  startsOn: string // YYYY-MM-DD
  endsOn: string // YYYY-MM-DD or ''
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const todayDateString = () => new Date().toISOString().slice(0, 10)

export const buildEmptyTemplateValues = (): RideTemplateFormValues => ({
  origin: '',
  destination: '',
  type: 'SHARED',
  seats: 3,
  price: 0,
  description: '',
  daysOfWeek: [1, 2, 3, 4, 5],
  departureHour: 8,
  departureMin: 0,
  startsOn: todayDateString(),
  endsOn: '',
})

export default function RideTemplateForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: RideTemplateFormValues
  submitLabel: string
  onSubmit: (values: RideTemplateFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<RideTemplateFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof RideTemplateFormValues>(
    key: K,
    value: RideTemplateFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }))

  const toggleDay = (day: number) => {
    setValues((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(day)
        ? current.daysOfWeek.filter((d) => d !== day)
        : [...current.daysOfWeek, day].sort((a, b) => a - b),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!values.origin.trim() || !values.destination.trim()) {
      setError('Origin and destination are required.')
      return
    }
    if (values.daysOfWeek.length === 0) {
      setError('Pick at least one day of the week.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save template.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Origin
        <input
          type="text"
          value={values.origin}
          onChange={(e) => update('origin', e.target.value)}
          placeholder="Salt Lake City"
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Destination
        <input
          type="text"
          value={values.destination}
          onChange={(e) => update('destination', e.target.value)}
          placeholder="Provo"
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <fieldset className="grid gap-2 text-sm font-medium text-[var(--sea-ink)] sm:col-span-2">
        <legend>Days of week</legend>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, day) => {
            const active = values.daysOfWeek.includes(day)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={isSubmitting}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'border-[rgba(50,143,151,0.4)] bg-[rgba(79,184,178,0.22)] text-[var(--lagoon-deep)]'
                    : 'border-[var(--line)] bg-white/60 text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Departure hour (0–23)
        <input
          type="number"
          min={0}
          max={23}
          value={values.departureHour}
          onChange={(e) =>
            update('departureHour', Math.max(0, Math.min(23, Number(e.target.value) || 0)))
          }
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Departure minute (0–59)
        <input
          type="number"
          min={0}
          max={59}
          value={values.departureMin}
          onChange={(e) =>
            update('departureMin', Math.max(0, Math.min(59, Number(e.target.value) || 0)))
          }
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Ride Type
        <select
          value={values.type}
          onChange={(e) =>
            update('type', e.target.value === 'EXCLUSIVE' ? 'EXCLUSIVE' : 'SHARED')
          }
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        >
          <option value="SHARED">Shared</option>
          <option value="EXCLUSIVE">Exclusive</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Seats
        <input
          type="number"
          min={1}
          value={values.seats}
          onChange={(e) => update('seats', Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Price per seat (USD)
        <input
          type="number"
          min={0}
          step={0.5}
          value={values.price}
          onChange={(e) => update('price', Math.max(0, Number(e.target.value) || 0))}
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Starts on
        <input
          type="date"
          value={values.startsOn}
          onChange={(e) => update('startsOn', e.target.value)}
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
        Ends on (optional)
        <input
          type="date"
          value={values.endsOn}
          onChange={(e) => update('endsOn', e.target.value)}
          disabled={isSubmitting}
          className="h-10 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--sea-ink)] sm:col-span-2">
        Description (optional)
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          disabled={isSubmitting}
          placeholder="Share details riders should know."
          className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
      </label>

      {error ? (
        <p className="m-0 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-3 text-sm text-[rgb(138,44,35)] sm:col-span-2">
          {error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.18)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
