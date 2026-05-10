export default function ServicesLoading() {
  return (
    <div className="py-16 animate-pulse">
      <div className="section-container">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-24 bg-surface-800 rounded-full mx-auto mb-6" />
          <div className="h-12 w-72 bg-surface-800 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-96 bg-surface-800/60 rounded mx-auto" />
        </div>

        {/* Service cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-8 space-y-4">
              <div className="h-12 w-12 bg-surface-800 rounded-xl" />
              <div className="h-7 w-2/3 bg-surface-800 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface-800/60 rounded" />
                <div className="h-4 w-5/6 bg-surface-800/60 rounded" />
                <div className="h-4 w-4/6 bg-surface-800/60 rounded" />
              </div>
              <div className="h-10 w-32 bg-surface-800 rounded-lg mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
