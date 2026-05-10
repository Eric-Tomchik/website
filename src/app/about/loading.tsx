export default function AboutLoading() {
  return (
    <div className="py-16 animate-pulse">
      <div className="section-container">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-20 bg-surface-800 rounded-full mx-auto mb-6" />
          <div className="h-12 w-56 bg-surface-800 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-80 bg-surface-800/60 rounded mx-auto" />
        </div>

        {/* Bio section skeleton */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="aspect-square bg-surface-800 rounded-2xl" />
          <div className="space-y-4 py-4">
            <div className="h-8 w-48 bg-surface-800 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-surface-800/60 rounded" />
              <div className="h-4 w-full bg-surface-800/60 rounded" />
              <div className="h-4 w-5/6 bg-surface-800/60 rounded" />
              <div className="h-4 w-4/6 bg-surface-800/60 rounded" />
            </div>
            <div className="space-y-2 mt-6">
              <div className="h-4 w-full bg-surface-800/60 rounded" />
              <div className="h-4 w-full bg-surface-800/60 rounded" />
              <div className="h-4 w-3/4 bg-surface-800/60 rounded" />
            </div>
          </div>
        </div>

        {/* Skills skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="h-10 w-10 bg-surface-800 rounded-lg mx-auto mb-2" />
              <div className="h-4 w-20 bg-surface-800/60 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
