import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { BookOpenCheck, Check, PenLine, Search, ShieldQuestion, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatDuration } from '@/utils/format'
import type { AgentStatus } from '@/types'

/**
 * Icons for the agents the backend ships with. Unknown ids fall back to the
 * generic search glyph, so a new pipeline step renders sensibly without a code
 * change here.
 */
const AGENT_ICONS: Record<string, LucideIcon> = {
  search: Search,
  read: BookOpenCheck,
  write: PenLine,
  critique: ShieldQuestion,
}

export interface AgentNodeData {
  id: string
  name: string
  role: string
  status: AgentStatus
  duration?: number
  note?: string
}

const STATUS_RING: Record<AgentStatus, string> = {
  idle: 'border-white/10 bg-white/[0.03]',
  running: 'border-accent-blue/50 bg-accent-blue/[0.10] shadow-glow-blue',
  done: 'border-accent-emerald/45 bg-accent-emerald/[0.09]',
  warn: 'border-accent-amber/45 bg-accent-amber/[0.09]',
  error: 'border-accent-rose/50 bg-accent-rose/[0.10]',
}

const STATUS_TEXT: Record<AgentStatus, string> = {
  idle: 'text-ink-faint',
  running: 'text-accent-blue',
  done: 'text-accent-emerald',
  warn: 'text-accent-amber',
  error: 'text-accent-rose',
}

function AgentNodeComponent({ data }: NodeProps<AgentNodeData>) {
  const Icon = AGENT_ICONS[data.id] ?? Search
  const reduced = useReducedMotion()
  const running = data.status === 'running'

  return (
    <div className="relative w-[212px]">
      {/* Halo, drawn behind and only while the agent is live. */}
      {running && !reduced && (
        <motion.span
          className="absolute -inset-2 rounded-2xl bg-accent-blue/20 blur-xl"
          animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      )}

      <motion.div
        className={cn(
          'relative rounded-2xl border px-3 py-2.5 backdrop-blur-xl transition-colors duration-500',
          STATUS_RING[data.status],
        )}
        animate={running && !reduced ? { x: [0, 3, 0] } : { x: 0 }}
        transition={{ duration: 3, repeat: running && !reduced ? Infinity : 0, ease: 'easeInOut' }}
      >
        {/* Top/bottom handles: the graph flows downward (see AgentGraph). */}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05]',
              STATUS_TEXT[data.status],
            )}
          >
            {data.status === 'done' ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            ) : data.status === 'error' ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Icon className={cn('h-3.5 w-3.5', running && !reduced && 'animate-pulse')} />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-tight">{data.name}</span>
            <span className={cn('block truncate text-[10px] leading-tight', STATUS_TEXT[data.status])}>
              {data.note ?? (data.duration != null ? formatDuration(data.duration) : statusLabel(data.status))}
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function statusLabel(status: AgentStatus): string {
  return { idle: 'Waiting', running: 'Working…', done: 'Done', warn: 'Skipped', error: 'Failed' }[status]
}

export const AgentNode = memo(AgentNodeComponent)
