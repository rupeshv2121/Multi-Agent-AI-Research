import { cn } from '@/utils/cn'
import type { AgentStatus } from '@/types'

export const STATUS_STYLES: Record<AgentStatus, { dot: string; text: string; ring: string; label: string }> = {
  idle: { dot: 'bg-white/25', text: 'text-ink-faint', ring: 'ring-white/10', label: 'Waiting' },
  running: { dot: 'bg-accent-blue', text: 'text-accent-blue', ring: 'ring-accent-blue/40', label: 'Running' },
  done: { dot: 'bg-accent-emerald', text: 'text-accent-emerald', ring: 'ring-accent-emerald/40', label: 'Complete' },
  warn: { dot: 'bg-accent-amber', text: 'text-accent-amber', ring: 'ring-accent-amber/40', label: 'Skipped' },
  error: { dot: 'bg-accent-rose', text: 'text-accent-rose', ring: 'ring-accent-rose/40', label: 'Failed' },
}

/** Status pip; running gets an expanding halo so it reads as live. */
export function StatusDot({ status, className }: { status: AgentStatus; className?: string }) {
  const style = STATUS_STYLES[status]

  return (
    <span className={cn('relative inline-flex h-2 w-2 shrink-0', className)}>
      {status === 'running' && (
        <span className={cn('absolute inline-flex h-full w-full animate-pulse-ring rounded-full', style.dot)} />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', style.dot)} />
      <span className="sr-only">{style.label}</span>
    </span>
  )
}
