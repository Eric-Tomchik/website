export default function BooksLoading() {
  return (
    <div className="py-16 animate-pulse">
      <div className="section-container">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-24 bg-surface-800 rounded-full mx-auto mb-6" />
          <div className="h-12 w-72 bg-surface-800 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-96 bg-surface-800/60 rounded mx-auto" />
        </div>

        {/* Book grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[3/4] bg-surface-800" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-surface-800 rounded" />
                <div className="h-4 w-full bg-surface-800/60 rounded" />
                <div className="h-4 w-2/3 bg-surface-800/60 rounded" />
                <div className="h-8 w-24 bg-surface-800 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
