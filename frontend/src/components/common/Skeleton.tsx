import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg bg-white/[0.04]', className)} aria-hidden />
}

/** Placeholder for a streaming report before the first content arrives. */
export function ReportSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Generating report">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[92%]" />
      <Skeleton className="h-3 w-[78%]" />
      <div className="h-2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-[88%]" />
      <Skeleton className="h-3 w-[95%]" />
      <Skeleton className="h-3 w-[64%]" />
    </div>
  )
}

export function SourceSkeleton() {
  return (
    <div className="glass flex gap-3 p-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
