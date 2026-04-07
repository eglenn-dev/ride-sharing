import Skeleton, {
  BookingCardSkeleton,
  PanelSkeleton,
} from '#/components/Skeleton'

export default function HomeSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <Skeleton width={320} height={36} className="mb-3" />
        <Skeleton width={220} height={16} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PanelSkeleton title="Your Rides" rows={3} />
        <PanelSkeleton title="Recent Activity" rows={3} />
        <PanelSkeleton title="Quick Actions" rows={3} />
        <PanelSkeleton title="Stats" rows={4} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Skeleton width={140} height={22} />
          <Skeleton width={80} height={14} />
        </div>
        <div className="grid justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      </section>
    </main>
  )
}
