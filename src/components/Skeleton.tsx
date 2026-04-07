import type { CSSProperties } from 'react'

type SkeletonProps = {
  width?: number | string
  height?: number | string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  style?: CSSProperties
}

const ROUNDED_CLASS: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
}

export default function Skeleton({
  width,
  height,
  rounded = 'md',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-shimmer block ${ROUNDED_CLASS[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height ?? '1em',
        ...style,
      }}
    />
  )
}

export function SkeletonLine({ width = '100%' }: { width?: number | string }) {
  return <Skeleton width={width} height={14} />
}

export function SkeletonHeading({
  width = '60%',
}: {
  width?: number | string
}) {
  return <Skeleton width={width} height={28} rounded="md" />
}

export function RideCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <Skeleton width={220} height={18} />
          <Skeleton width={160} height={14} />
        </div>
        <div className="grid gap-2 sm:justify-items-end">
          <Skeleton width={120} height={14} />
          <Skeleton width={100} height={14} />
          <Skeleton width={70} height={14} />
        </div>
      </div>
      <div className="mt-3">
        <Skeleton width={80} height={12} />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton width={70} height={28} rounded="full" />
        <Skeleton width={90} height={28} rounded="full" />
      </div>
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Skeleton width={200} height={20} />
        <Skeleton width={70} height={20} rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton height={14} />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton width={100} height={28} rounded="full" />
        <Skeleton width={120} height={28} rounded="full" />
      </div>
    </article>
  )
}

export function PanelSkeleton({
  title,
  rows = 3,
}: {
  title?: string
  rows?: number
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      {title ? (
        <h2 className="m-0 mb-3 text-base font-semibold text-[var(--sea-ink)]">
          {title}
        </h2>
      ) : (
        <Skeleton width={140} height={18} className="mb-3" />
      )}
      <div className="grid gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={14} />
        ))}
      </div>
    </article>
  )
}
