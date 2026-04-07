import Skeleton, { RideCardSkeleton } from '#/components/Skeleton'

export default function MyRidesSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] p-6 sm:p-10">
        <Skeleton width={120} height={14} className="mb-2" />
        <Skeleton width={220} height={36} className="mb-3" />
        <Skeleton width={260} height={14} className="mb-6" />
        <ul className="grid gap-4">
          <li>
            <RideCardSkeleton />
          </li>
          <li>
            <RideCardSkeleton />
          </li>
          <li>
            <RideCardSkeleton />
          </li>
        </ul>
      </section>
    </main>
  )
}
