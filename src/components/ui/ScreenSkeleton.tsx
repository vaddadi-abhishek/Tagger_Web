export function ScreenSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-2">
      {/* Header Skeleton Lines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[var(--border)] opacity-70 rounded-full" />
          <div className="h-3.5 w-64 bg-[var(--border)] opacity-50 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-44 bg-[var(--border)] opacity-60 rounded-xl" />
          <div className="h-9 w-24 bg-[var(--border)] opacity-60 rounded-xl" />
        </div>
      </div>

      {/* Wireframe Gray Skeleton Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Top Media Gray Skeleton Box */}
            <div className="h-48 sm:h-52 w-full bg-[var(--border)] opacity-60" />

            {/* Gray Content Skeleton Lines */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                {/* Title Skeleton Lines */}
                <div className="h-4 bg-[var(--border)] rounded-full w-4/5" />
                <div className="h-4 bg-[var(--border)] rounded-full w-3/5" />

                {/* Description Skeleton Lines */}
                <div className="h-3 bg-[var(--border)] opacity-60 rounded-full w-full mt-3" />
                <div className="h-3 bg-[var(--border)] opacity-60 rounded-full w-2/3" />
              </div>

              {/* Tags & Badges Skeleton */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-16 bg-[var(--border)] opacity-70 rounded-full" />
                <div className="h-6 w-20 bg-[var(--border)] opacity-70 rounded-full" />
              </div>
            </div>

            {/* Card Footer Skeleton */}
            <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between">
              <div className="h-3 w-20 bg-[var(--border)] opacity-60 rounded-full" />
              <div className="h-3 w-8 bg-[var(--border)] opacity-60 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
