import { Suspense, lazy, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, GitBranch, Link2, Terminal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { AgentCard } from './AgentCard'
import { ActivityFeed } from './ActivityFeed'
import { SourcesList } from '@/components/research/SourcesList'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useResearchStore } from '@/store/researchStore'
import { useElapsed } from '@/hooks/useElapsed'
import { formatDuration } from '@/utils/format'

// React Flow and its stylesheet are a sizeable dependency for one panel, so the
// graph loads on demand behind a skeleton rather than in the initial bundle.
const AgentGraph = lazy(() => import('./AgentGraph').then((m) => ({ default: m.AgentGraph })))

type Tab = 'agents' | 'sources' | 'logs'

const TABS: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
  { id: 'agents', label: 'Agents', icon: Activity },
  { id: 'sources', label: 'Sources', icon: Link2 },
  { id: 'logs', label: 'Logs', icon: Terminal },
]

/**
 * The run's control tower: pipeline graph on top, then per-agent cards,
 * sources, or raw logs.
 */
export function AgentPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>('agents')

  const agents = useResearchStore((s) => s.agents)
  const logs = useResearchStore((s) => s.logs)
  const sources = useResearchStore((s) => s.sources)
  const status = useResearchStore((s) => s.status)
  const startedAt = useResearchStore((s) => s.startedAt)
  const progress = useResearchStore((s) => s.progress())

  const running = status === 'running'
  const elapsed = useElapsed(startedAt, running)

  // Log lines are attributed to whichever agent was live when they arrived.
  const logsByAgent = useMemo(() => {
    const map = new Map<string, typeof logs>()
    for (const log of logs) {
      if (!log.agentId) continue
      map.set(log.agentId, [...(map.get(log.agentId) ?? []), log])
    }
    return map
  }, [logs])

  const doneCount = agents.filter((a) => a.status === 'done' || a.status === 'warn').length

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-surface-sunken/70 backdrop-blur-2xl', className)}>
      {/* Header + run summary */}
      <div className="shrink-0 border-b border-hairline px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="h-4 w-4 text-accent-purple" />
            Agent pipeline
          </h2>
          <span className="text-[11px] tabular-nums text-ink-faint">
            {doneCount}/{agents.length}
            {status !== 'idle' && <> · {formatDuration(running ? elapsed : undefined)}</>}
          </span>
        </div>

        <ProgressBar value={progress} active={running} className="mt-3" />
      </div>

      {/* Graph */}
      {/* Sized for the vertical chain: one node per row plus breathing room. */}
      <div className="h-[300px] shrink-0 border-b border-hairline">
        <Suspense
          fallback={
            <div className="flex h-full flex-col items-center justify-center gap-2.5 px-4">
              {agents.map((agent) => (
                <div key={agent.id} className="shimmer h-11 w-[212px] rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          }
        >
          <AgentGraph className="h-full w-full" />
        </Suspense>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-hairline p-2" role="tablist" aria-label="Agent panel views">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          const count = id === 'sources' ? sources.length : id === 'logs' ? logs.length : 0
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              {active && (
                <motion.span
                  layoutId="agent-tab"
                  className="absolute inset-0 rounded-lg border border-hairline bg-white/[0.07]"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <Icon className="relative h-3 w-3" />
              <span className="relative">{label}</span>
              {count > 0 && (
                <span className="relative rounded-full bg-white/[0.10] px-1.5 text-[9px] tabular-nums">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-3"
          >
            {tab === 'agents' && (
              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <AgentCard key={agent.id} agent={agent} logs={logsByAgent.get(agent.id) ?? []} index={index} />
                ))}
              </div>
            )}

            {tab === 'sources' && <SourcesList sources={sources} loading={running} compact />}

            {tab === 'logs' && <ActivityFeed />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
