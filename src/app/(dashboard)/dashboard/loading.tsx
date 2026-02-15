export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8F2] p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="skeleton mb-2 h-8 w-48 rounded-lg" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>

        {/* Stats row skeleton */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-5">
              <div className="skeleton mb-2 h-4 w-24 rounded" />
              <div className="skeleton h-8 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Menu cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-5">
              <div className="skeleton mb-3 h-6 w-3/4 rounded" />
              <div className="skeleton mb-2 h-4 w-1/2 rounded" />
              <div className="skeleton mb-4 h-4 w-1/3 rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-8 flex-1 rounded-lg" />
                <div className="skeleton h-8 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
