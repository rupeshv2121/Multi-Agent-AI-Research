import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useResearchStore } from '@/store/researchStore'
import { EmptyState } from '@/components/common/EmptyState'
import { formatTime } from '@/utils/format'

/** Raw log lines as the pipeline prints them, newest at the bottom. */
export function ActivityFeed() {
  const logs = useResearchStore((s) => s.logs)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = container.current
    if (element) element.scrollTop = element.scrollHeight
  }, [logs.length])

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Terminal}
        title="No activity yet"
        description="Log lines from the pipeline stream in here once a run starts."
      />
    )
  }

  return (
    <div ref={container} className="max-h-64 space-y-1 overflow-y-auto p-3 scrollbar-none" aria-live="polite">
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 font-mono text-[10px] leading-relaxed"
          >
            <span className="shrink-0 tabular-nums text-ink-faint/60">{formatTime(log.at)}</span>
            <span className="min-w-0 flex-1 break-words text-ink-muted">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
