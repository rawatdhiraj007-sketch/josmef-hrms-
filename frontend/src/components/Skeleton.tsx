/**
 * Shimmer skeleton placeholders. Use these instead of "Loading..." text.
 * <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-100/80 rounded ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]"
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
}

/** Card-shaped skeleton with header + body */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-surface-200 bg-white p-5 shadow-card ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-2 w-32" />
    </div>
  );
}

/** Table row skeleton */
export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-3 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/** Page-level skeleton (header + cards grid) */
export function SkeletonPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-surface-200 bg-white p-7 shadow-card">
        <Skeleton className="h-3 w-32 mb-3" />
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-3 w-80" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 rounded-2xl border border-surface-200 bg-white shadow-card">
          <div className="p-6">
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-3 w-56 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <div className="h-72 rounded-2xl border border-surface-200 bg-white shadow-card p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
