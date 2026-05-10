export default function PortfolioLoading() {
  return (
    <div className="py-16 animate-pulse">
      <div className="section-container">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-24 bg-surface-800 rounded-full mx-auto mb-6" />
          <div className="h-12 w-64 bg-surface-800 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-80 bg-surface-800/60 rounded mx-auto" />
        </div>

        {/* Portfolio grid skeleton */}
        <div className="grid md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[16/10] bg-surface-800" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-2/3 bg-surface-800 rounded" />
                <div className="h-4 w-full bg-surface-800/60 rounded" />
                <div className="h-4 w-4/5 bg-surface-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
