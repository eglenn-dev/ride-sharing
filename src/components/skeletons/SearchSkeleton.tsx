import Skeleton from '#/components/Skeleton'

function ResultCardSkeleton() {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      <Skeleton height={120} rounded="lg" className="mb-3" />
      <div className="mb-2 flex items-center justify-between gap-2">
        <Skeleton width={180} height={20} />
        <Skeleton width={70} height={20} rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton height={14} />
      </div>
      <Skeleton width={140} height={32} rounded="full" className="mt-3" />
    </article>
  )
}

export default function SearchSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] p-6 sm:p-10">
        <Skeleton width={140} height={14} className="mb-2" />
        <Skeleton width={300} height={36} className="mb-3" />
        <Skeleton width={360} height={14} className="mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} rounded="full" />
        </div>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCardSkeleton />
        <ResultCardSkeleton />
        <ResultCardSkeleton />
        <ResultCardSkeleton />
      </section>
    </main>
  )
}
