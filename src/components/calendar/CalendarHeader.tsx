import { formatMonthYear } from '#/lib/calendar-utils'

type View = 'month' | 'week'

export default function CalendarHeader({
  cursor,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: {
  cursor: Date
  view: View
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: View) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
          aria-label="Next"
        >
          ›
        </button>
        <button
          type="button"
          onClick={onToday}
          className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
        >
          Today
        </button>
        <h2 className="ml-2 text-lg font-semibold text-[var(--sea-ink)]">
          {formatMonthYear(cursor)}
        </h2>
      </div>

      <div className="inline-flex overflow-hidden rounded-full border border-[var(--line)] bg-white/60 text-xs font-semibold">
        {(['month', 'week'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onViewChange(option)}
            className={`px-3 py-1.5 transition ${
              view === option
                ? 'bg-[var(--lagoon-deep)] text-white'
                : 'text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]'
            }`}
          >
            {option === 'month' ? 'Month' : 'Week'}
          </button>
        ))}
      </div>
    </div>
  )
}
