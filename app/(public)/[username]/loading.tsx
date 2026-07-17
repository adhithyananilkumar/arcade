import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfileLoading() {
  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-4xl space-y-8 pb-16 px-4 sm:px-6 relative animate-in fade-in duration-500">
        
        {/* Main Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            
            {/* Avatar Skeleton */}
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full shrink-0">
              <Skeleton className="h-full w-full rounded-full bg-slate-200/60" />
            </div>

            {/* Details / Bio */}
            <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-2 w-full space-y-4">
              <Skeleton className="h-10 w-64 bg-slate-200/60" />
              <Skeleton className="h-5 w-32 bg-slate-200/60" />
              
              <div className="space-y-2 w-full max-w-lg mt-4">
                <Skeleton className="h-4 w-full bg-slate-200/60" />
                <Skeleton className="h-4 w-3/4 bg-slate-200/60" />
                <Skeleton className="h-4 w-5/6 bg-slate-200/60" />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 w-full pt-5 border-t border-slate-100">
                <Skeleton className="h-5 w-40 bg-slate-200/60" />
                <Skeleton className="h-5 w-48 bg-slate-200/60" />
                <Skeleton className="h-5 w-44 bg-slate-200/60" />
                <Skeleton className="h-5 w-36 bg-slate-200/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4 px-1">
            <Skeleton className="h-7 w-32 bg-slate-200/60" />
            <Skeleton className="h-5 w-20 bg-slate-200/60" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 h-32">
                <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200/60" />
                <Skeleton className="h-3 w-20 bg-slate-200/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Graph Area */}
        <div className="relative mt-8">
          <Skeleton className="h-7 w-64 mb-4 bg-slate-200/60" />
          <div className="border border-slate-100 rounded-2xl p-4 sm:p-6 bg-slate-50/50 h-56 flex flex-col justify-between">
            <Skeleton className="h-32 w-full bg-slate-200/60 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-sm bg-slate-200/60" />
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mt-8">
          <Skeleton className="h-7 w-48 mb-6 bg-slate-200/60" />
          <div className="flex border-b border-slate-100 gap-6 mb-6">
            <Skeleton className="h-6 w-24 mb-4 bg-slate-200/60" />
            <Skeleton className="h-6 w-24 mb-4 bg-slate-200/60" />
            <Skeleton className="h-6 w-24 mb-4 bg-slate-200/60" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-slate-200/60" />
                  <Skeleton className="h-3 w-full bg-slate-200/60" />
                  <Skeleton className="h-3 w-5/6 bg-slate-200/60" />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-4">
                  <Skeleton className="h-8 w-full bg-slate-200/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
