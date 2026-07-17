import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-12 animate-in fade-in duration-500 transition-colors">
      {/* Header Section / Search Hero */}
      <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center border-b border-slate-100 dark:border-transparent transition-colors">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Skeleton className="h-10 w-3/4 max-w-[400px] mb-4 bg-slate-200/60 dark:bg-neutral-800" />
          <Skeleton className="h-6 w-5/6 max-w-[500px] mb-8 bg-slate-200/60 dark:bg-neutral-800" />
          
          <Skeleton className="h-[68px] w-full rounded-2xl bg-slate-200/60 dark:bg-neutral-800 mb-10" />

          {/* Popular Categories */}
          <div className="flex flex-col items-center gap-4 w-full">
            <Skeleton className="h-4 w-32 mb-2 bg-slate-200/60 dark:bg-neutral-800" />
            
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full bg-slate-200/60 dark:bg-neutral-800" />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-36 rounded-full bg-slate-200/60 dark:bg-neutral-800" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Courses Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64 bg-slate-200/60 dark:bg-neutral-800" />
          <Skeleton className="h-5 w-20 bg-slate-200/60 dark:bg-neutral-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-black flex flex-col">
              {/* Image Skeleton */}
              <Skeleton className="h-48 w-full bg-slate-200/60 dark:bg-neutral-800 rounded-none" />
              
              {/* Content Skeleton */}
              <div className="p-5 flex flex-col flex-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full bg-slate-200/60 dark:bg-neutral-800" />
                  <Skeleton className="h-4 w-2/3 bg-slate-200/60 dark:bg-neutral-800" />
                </div>
                
                <Skeleton className="h-4 w-1/3 bg-slate-200/60 dark:bg-neutral-800" />
                
                <div className="flex items-center gap-4 mt-auto">
                  <Skeleton className="h-4 w-20 bg-slate-200/60 dark:bg-neutral-800" />
                  <Skeleton className="h-4 w-24 bg-slate-200/60 dark:bg-neutral-800" />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
                  <Skeleton className="h-6 w-16 bg-slate-200/60 dark:bg-neutral-800" />
                  <Skeleton className="h-10 w-28 rounded-lg bg-slate-200/60 dark:bg-neutral-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
