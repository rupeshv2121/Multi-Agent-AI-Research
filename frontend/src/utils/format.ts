/** Presentation-only formatting helpers. */

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/** "just now" / "12m ago" / "3d ago" — good enough for a history list. */
export function formatRelative(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(ts)
}

/** Seconds as `8.2s` or `1m 04s`. */
export function formatDuration(seconds?: number): string {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

/**
 * Rough token estimate. There is no tokenizer in the browser bundle and the
 * backend does not report usage, so this is an approximation (~4 chars/token)
 * used for the live counter only — never for billing.
 */
export function estimateTokens(text: string): number {
  return Math.ceil((text?.length ?? 0) / 4)
}

/** Group timestamps into the buckets the sidebar renders under. */
export function bucketByRecency(ts: number): 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older' {
  const day = 86_400_000
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  if (ts >= startOfToday) return 'Today'
  if (ts >= startOfToday - day) return 'Yesterday'
  if (ts >= startOfToday - 7 * day) return 'Previous 7 days'
  return 'Older'
}
