export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1e1e1e] rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Greeting */}
        <div className="space-y-2 mb-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-40" />
        </div>
        {/* Hero card */}
        <Skeleton className="h-36 w-full rounded-2xl" />
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        {/* Profile */}
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </div>
  );
}

export function BookSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      <Skeleton className="flex-1 rounded-none" />
      <div className="bg-[#0f0f0f] border-t border-[#1e1e1e] p-4 space-y-3" style={{ height:"45vh" }}>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        <Skeleton className="h-7 w-36 mb-6" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
