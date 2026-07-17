import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="flex w-full flex-col items-center bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="w-full max-w-6xl px-4 pt-8 sm:pt-16 sm:px-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48 mb-6 bg-slate-200/60" />
        
        <div className="space-y-4 mb-12">
          <Skeleton className="h-12 w-3/4 max-w-2xl bg-slate-200/60" />
          <Skeleton className="h-12 w-1/2 max-w-md bg-slate-200/60" />
          <Skeleton className="h-5 w-full max-w-xl bg-slate-200/60 mt-4" />
        </div>

        {/* Content Tabs / Categories */}
        <div className="mt-8 space-y-12">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-6">
              <Skeleton className="h-8 w-64 bg-slate-200/60" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="rounded-2xl border border-slate-100 bg-white p-6 h-48 flex flex-col justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-slate-200/60" />
                      <Skeleton className="h-4 w-full bg-slate-200/60" />
                      <Skeleton className="h-4 w-5/6 bg-slate-200/60" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4">
                      <Skeleton className="h-4 w-20 bg-slate-200/60" />
                      <Skeleton className="h-4 w-20 bg-slate-200/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
