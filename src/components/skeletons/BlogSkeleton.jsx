export default function BlogSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard priority />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

function SkeletonCard({ priority }) {
  return (
    <article className="rounded-2xl overflow-hidden border animate-pulse">
      {/* imagine (LCP placeholder) */}
      <div
        className={`bg-gray-300 ${
          priority ? "h-72" : "h-56"
        }`}
      />

      {/* conținut */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </article>
  );
}
