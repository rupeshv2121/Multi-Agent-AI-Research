import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { StatusDot, STATUS_STYLES } from '@/components/common/StatusDot'
import { useElapsed } from '@/hooks/useElapsed'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatDuration } from '@/utils/format'
import type { AgentRuntime, LogEntry } from '@/types'

interface AgentCardProps {
  agent: AgentRuntime
  logs: LogEntry[]
  index: number
}

/**
 * One agent's live card: status, elapsed time, and its log lines.
 *
 * While running it shows a ticking clock; once settled it swaps to the
 * backend-reported duration, which is authoritative (it excludes the time the
 * event spent in transit).
 */
export function AgentCard({ agent, logs, index }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const running = agent.status === 'running'
  const live = useElapsed(agent.startedAt, running)

  const style = STATUS_STYLES[agent.status]
  const hasDetail = logs.length > 0 || !!agent.error

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : index * 0.05, type: 'spring', stiffness: 260, damping: 26 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-surface/60 backdrop-blur-xl transition-colors duration-500',
        running ? 'border-accent-primary/30' : 'border-hairline',
      )}
    >
      {/* Sheen that sweeps while the agent works. */}
      {running && !reduced && (
        <div className="shimmer pointer-events-none absolute inset-0" aria-hidden />
      )}

      <button
        onClick={() => hasDetail && setExpanded((value) => !value)}
        disabled={!hasDetail}
        aria-expanded={hasDetail ? expanded : undefined}
        className="relative flex w-full items-start gap-3 p-3 text-left disabled:cursor-default"
      >
        <span className="mt-1.5">
          <StatusDot status={agent.status} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold">{agent.name}</span>
            <span className={cn('shrink-0 text-[10px] font-medium uppercase tracking-wide', style.text)}>
              {agent.note ?? style.label}
            </span>
          </span>

          <span className="mt-0.5 block truncate text-[11px] leading-relaxed text-ink-muted">{agent.role}</span>

          {agent.error && agent.status !== 'error' && (
            <span className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-accent-amber">
              <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
              <span className="line-clamp-2">Continued without this step.</span>
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          <AnimatePresence mode="wait">
            {(running || agent.duration != null) && (
              <motion.span
                key={running ? 'live' : 'final'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] tabular-nums text-ink-faint"
              >
                <Clock className="h-2.5 w-2.5" />
                {formatDuration(running ? live : agent.duration)}
              </motion.span>
            )}
          </AnimatePresence>
          {hasDetail && (
            <ChevronDown
              className={cn('h-3.5 w-3.5 text-ink-faint transition-transform', expanded && 'rotate-180')}
            />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-hairline"
          >
            <div className="space-y-1.5 p-3">
              {agent.error && (
                <p className="rounded-lg border border-accent-rose/20 bg-accent-rose/[0.07] p-2 text-[11px] leading-relaxed text-accent-rose">
                  {agent.error}
                </p>
              )}
              {logs.map((log) => (
                <p key={log.id} className="font-mono text-[10px] leading-relaxed text-ink-faint">
                  {log.message}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress rail along the bottom edge while running. */}
      {running && (
        <motion.span
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          aria-hidden
        />
      )}
    </motion.div>
  )
}
