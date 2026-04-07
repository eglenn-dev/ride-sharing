import Skeleton from '#/components/Skeleton'

export default function CalendarSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] p-6 sm:p-10">
        <Skeleton width={120} height={14} className="mb-2" />
        <Skeleton width={200} height={36} className="mb-3" />
        <Skeleton width={320} height={14} className="mb-6" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={36} height={36} rounded="full" />
            <Skeleton width={36} height={36} rounded="full" />
            <Skeleton width={64} height={28} rounded="full" />
            <Skeleton width={140} height={24} className="ml-2" />
          </div>
          <Skeleton width={120} height={32} rounded="full" />
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)]">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="min-h-[96px] bg-white/40 p-1.5">
              <Skeleton width={20} height={14} className="mb-2" />
              <Skeleton width="80%" height={12} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
