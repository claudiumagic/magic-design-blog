export default function ArticleSkeleton() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-6" />

      {/* Image (LCP!) */}
      <div className="h-80 bg-gray-300 rounded-2xl mb-10" />

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-10/12" />
        <div className="h-4 bg-gray-200 rounded w-9/12" />
      </div>
    </article>
  );
}
