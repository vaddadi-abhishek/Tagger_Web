export function ScreenSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Wireframe Skeleton Cards Matching Normal Layout */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Top Media Skeleton Box */}
            <div className="h-36 sm:h-40 w-full bg-slate-200 dark:bg-zinc-800 opacity-60" />

            {/* Content Skeleton Lines */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-200 dark:bg-zinc-700 rounded-full w-4/5" />
                <div className="h-3 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/5" />
                <div className="h-2.5 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-full mt-2" />
                <div className="h-2.5 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-2/3" />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-5 w-14 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
              </div>
            </div>

            {/* Card Footer Skeleton */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="h-2.5 w-16 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
              <div className="h-2.5 w-6 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
