import { useState } from 'react'
import { submitReview } from '#/lib/ratings'

type ReviewDialogProps = {
  rideId: string
  rideLabel: string
  subject: { id: string; name: string }
  onClose: () => void
  onSubmitted: () => void
}

export default function ReviewDialog({
  rideId,
  rideLabel,
  subject,
  onClose,
  onSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await submitReview({
        data: {
          rideId,
          subjectId: subject.id,
          rating,
          comment: comment.trim() || undefined,
        },
      })
      onSubmitted()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to submit review.',
      )
      setIsSubmitting(false)
    }
  }

  const displayed = hovered ?? rating

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--header-bg)] p-6 shadow-[0_18px_38px_rgba(23,58,64,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="review-dialog-title"
          className="m-0 mb-1 text-lg font-semibold text-[var(--sea-ink)]"
        >
          Review {subject.name}
        </h2>
        <p className="m-0 mb-4 text-sm text-[var(--sea-ink-soft)]">{rideLabel}</p>

        <div
          className="mb-4 flex items-center gap-1"
          onMouseLeave={() => setHovered(null)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} stars`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              className="text-3xl leading-none transition"
              style={{
                color:
                  value <= displayed
                    ? 'var(--lagoon-deep)'
                    : 'rgba(23,58,64,0.18)',
              }}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-[var(--sea-ink-soft)]">
            {rating} star{rating === 1 ? '' : 's'}
          </span>
        </div>

        <label className="mb-4 grid gap-2 text-sm font-medium text-[var(--sea-ink)]">
          Comment (optional)
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            disabled={isSubmitting}
            placeholder="What was great? Anything to improve?"
            className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
          />
        </label>

        {error ? (
          <p className="mb-3 m-0 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-2 text-sm text-[rgb(138,44,35)]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.18)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.28)] disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  )
}
