import Skeleton from '#/components/Skeleton'

export default function BookingPageSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] p-6 sm:p-10">
        <Skeleton width={100} height={14} className="mb-2" />
        <Skeleton width={260} height={36} className="mb-3" />
        <Skeleton width={320} height={14} className="mb-6" />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
            <Skeleton height={120} rounded="lg" className="mb-3" />
            <Skeleton width={220} height={22} className="mb-3" />
            <div className="grid gap-2">
              <Skeleton height={14} />
              <Skeleton height={14} />
              <Skeleton height={14} />
              <Skeleton height={14} />
              <Skeleton height={14} />
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
            <Skeleton width={160} height={22} className="mb-3" />
            <Skeleton width={120} height={40} className="mb-3" />
            <Skeleton width={180} height={20} className="mb-3" />
            <Skeleton width={160} height={36} rounded="full" />
          </article>
        </div>
      </section>
    </main>
  )
}
