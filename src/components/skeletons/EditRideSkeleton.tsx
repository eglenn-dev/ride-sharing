import Skeleton from '#/components/Skeleton'

export default function EditRideSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] p-6 sm:p-10">
        <Skeleton width={100} height={14} className="mb-2" />
        <Skeleton width={200} height={36} className="mb-6" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={140} className="sm:col-span-2" />
          <Skeleton width={160} height={40} rounded="full" className="sm:col-span-2" />
        </div>
      </section>
    </main>
  )
}
