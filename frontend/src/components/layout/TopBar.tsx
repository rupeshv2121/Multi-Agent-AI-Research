import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Command, Menu, PanelRight, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tooltip } from '@/components/common/Tooltip'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useUIStore } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'
import { useHealth } from '@/hooks/useHealth'
import { useElapsed } from '@/hooks/useElapsed'
import { formatDuration } from '@/utils/format'

/**
 * Top chrome: run progress, connection health, panel toggles.
 *
 * The progress strip sits flush against the bottom edge so it reads as a
 * property of the whole window rather than a widget.
 */
export function TopBar() {
  const toggleAgentPanel = useUIStore((s) => s.toggleAgentPanel)
  const agentPanelOpen = useUIStore((s) => s.agentPanelOpen)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const setMobileAgentDrawerOpen = useUIStore((s) => s.setMobileAgentDrawerOpen)

  const status = useResearchStore((s) => s.status)
  const startedAt = useResearchStore((s) => s.startedAt)
  const progress = useResearchStore((s) => s.progress())
  const phase = useResearchStore((s) => s.currentPhase())
  const agents = useResearchStore((s) => s.agents)

  const { online, missingKeys, isLoading } = useHealth()
  const elapsed = useElapsed(startedAt, status === 'running')

  const running = status === 'running'

  /**
   * Rough ETA from the steps that have already finished. With only four steps
   * this is a coarse estimate, so it is labelled "~" and hidden until at least
   * one step has completed and given us a real duration to extrapolate from.
   */
  const settled = agents.filter((a) => a.duration != null)
  const remaining = agents.length - settled.length
  const averageStep = settled.length ? settled.reduce((sum, a) => sum + (a.duration ?? 0), 0) / settled.length : 0
  const eta = settled.length > 0 && remaining > 0 ? averageStep * remaining : null

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-3 border-b border-hairline bg-surface-sunken/60 px-4 backdrop-blur-2xl">
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Phase readout */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="flex min-w-0 items-center gap-2.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {running && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-blue" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-blue" />
              </span>
            )}
            <p className="truncate text-sm font-medium">
              {running ? <span className="text-gradient">{phase}</span> : <span className="text-ink-muted">{phase}</span>}
            </p>
          </motion.div>
        </AnimatePresence>

        {running && (
          <div className="hidden shrink-0 items-center gap-3 text-xs text-ink-faint sm:flex">
            <span className="tabular-nums">{formatDuration(elapsed)}</span>
            {eta != null && <span className="tabular-nums">~{formatDuration(eta)} left</span>}
            <span className="tabular-nums text-ink-muted">{progress}%</span>
          </div>
        )}
      </div>

      {/* Health */}
      <div className="flex shrink-0 items-center gap-1.5">
        {missingKeys.length > 0 && (
          <Tooltip
            label={`Missing API key${missingKeys.length > 1 ? 's' : ''}: ${missingKeys.join(', ').toUpperCase()} — set them in .env`}
            side="bottom"
          >
            <span className="flex items-center gap-1.5 rounded-lg border border-accent-amber/25 bg-accent-amber/10 px-2 py-1 text-[11px] font-medium text-accent-amber">
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Keys missing</span>
            </span>
          </Tooltip>
        )}

        <Tooltip
          label={online ? 'Connected to the research server' : 'Cannot reach the server — is `python server.py` running?'}
          side="bottom"
        >
          <span
            className={cn(
              'grid h-9 w-9 place-items-center rounded-xl transition-colors',
              isLoading ? 'text-ink-faint' : online ? 'text-accent-emerald' : 'text-accent-rose',
            )}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </span>
        </Tooltip>

        <Tooltip label="Command palette  ⌘K" side="bottom">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden h-9 items-center gap-1.5 rounded-xl border border-hairline px-2.5 text-xs text-ink-muted transition-colors hover:border-white/20 hover:text-ink sm:flex"
            aria-label="Open command palette"
          >
            <Command className="h-3 w-3" />K
          </button>
        </Tooltip>

        <Tooltip label="Toggle agent panel  ⌘J" side="bottom">
          <button
            onClick={() => {
              toggleAgentPanel()
              setMobileAgentDrawerOpen(true)
            }}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-xl transition-colors',
              agentPanelOpen ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:bg-white/[0.06] hover:text-ink',
            )}
            aria-label="Toggle agent panel"
            aria-pressed={agentPanelOpen}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {/* Run progress, flush to the header's bottom edge */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProgressBar value={progress} active={running} label={`Research progress: ${phase}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
