export default function BlogLoading() {
  return (
    <div className="py-16 animate-pulse">
      <div className="section-container">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-20 bg-surface-800 rounded-full mx-auto mb-6" />
          <div className="h-12 w-80 bg-surface-800 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-96 bg-surface-800/60 rounded mx-auto" />
        </div>

        {/* Tab skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-10 w-28 bg-surface-800 rounded-lg" />
          <div className="h-10 w-32 bg-surface-800 rounded-lg" />
        </div>

        {/* Post grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[16/9] bg-surface-800" />
              <div className="p-6 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-24 bg-surface-800 rounded-full" />
                  <div className="h-5 w-16 bg-surface-800/60 rounded" />
                </div>
                <div className="h-6 w-full bg-surface-800 rounded" />
                <div className="h-4 w-4/5 bg-surface-800/60 rounded" />
                <div className="h-4 w-3/5 bg-surface-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
