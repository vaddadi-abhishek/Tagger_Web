export function ScreenSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Wireframe Skeleton Cards Matching Normal Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[1.75rem] overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Top Media Skeleton Box */}
            <div className="h-48 sm:h-52 w-full bg-slate-200 dark:bg-zinc-800 opacity-60" />

            {/* Content Skeleton Lines */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded-full w-4/5" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/5" />
                <div className="h-3 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-full mt-3" />
                <div className="h-3 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-2/3" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
              </div>
            </div>

            {/* Card Footer Skeleton */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
              <div className="h-3 w-8 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
