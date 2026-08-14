import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Globe, RotateCcw } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { Button } from '@/components/common/Button'
import { AGENTS } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

const QUERY = 'Future of quantum computing'

/** Sources surface progressively, as they would during a real Scout pass. */
const SOURCES = [
  { site: 'Nature', domain: 'nature.com', title: 'Quantum error correction at scale', at: 1 },
  { site: 'Arxiv', domain: 'arxiv.org', title: 'Logical qubits below threshold', at: 1 },
  { site: 'IBM', domain: 'research.ibm.com', title: 'The quantum roadmap to 2033', at: 2 },
  { site: 'Nist', domain: 'nist.gov', title: 'Post-quantum cryptography standards', at: 2 },
]

/** Log lines keyed to the stage that emits them. */
const LOGS: Array<{ at: number; text: string }> = [
  { at: 0, text: 'Searching for information on: Future of quantum computing' },
  { at: 1, text: 'Extracting information from URLs found in search results…' },
  { at: 2, text: 'Writing a research report based on the gathered information…' },
  { at: 3, text: 'Critiquing the research report…' },
]

type Phase = -1 | 0 | 1 | 2 | 3 | 4

/**
 * A scripted walkthrough of a run.
 *
 * This is a simulation, not a live pipeline — it is labelled as such, and the
 * button beside it goes to the real workspace. It exists so a visitor can see
 * the shape of a run without needing API keys first.
 *
 * It starts itself once when scrolled into view, and can be replayed.
 */
export function LiveDemo() {
  const container = useRef<HTMLDivElement>(null)
  const inView = useInView(container, { once: true, margin: '-120px' })
  const reduced = useReducedMotion()

  const [phase, setPhase] = useState<Phase>(-1)
  const [typed, setTyped] = useState('')
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  const run = useCallback(() => {
    clearTimers()
    setTyped('')
    setPhase(-1)

    if (reduced) {
      // No theatre: show the finished state immediately.
      setTyped(QUERY)
      setPhase(4)
      return
    }

    // Type the query, then walk the four stages.
    QUERY.split('').forEach((_, index) => {
      timers.current.push(
        window.setTimeout(() => setTyped(QUERY.slice(0, index + 1)), 320 + index * 42),
      )
    })

    const afterTyping = 320 + QUERY.length * 42 + 400
    ;([0, 1, 2, 3, 4] as Phase[]).forEach((next, index) => {
      timers.current.push(window.setTimeout(() => setPhase(next), afterTyping + index * 1500))
    })
  }, [reduced, clearTimers])

  useEffect(() => {
    if (inView) run()
    return clearTimers
  }, [inView, run, clearTimers])

  const statusOf = (index: number) => {
    if (phase < 0) return 'idle' as const
    if (phase > index) return 'done' as const
    if (phase === index) return 'running' as const
    return 'idle' as const
  }

  const progress = phase < 0 ? 0 : Math.round((Math.min(phase, 4) / 4) * 100)
  const visibleSources = SOURCES.filter((source) => phase >= source.at)
  const visibleLogs = LOGS.filter((log) => phase >= log.at)

  return (
    <Section id="demo">
      <SectionHeading
        eyebrow="See it run"
        title="A research run, start to finish"
        description="A scripted walkthrough of what happens after you press enter. The real thing streams these same events from the backend."
      />

      <Reveal>
        <div ref={container} className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-[24px] border border-hairline bg-surface/50 backdrop-blur-2xl">
            {/* Query bar */}
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-accent text-[11px] font-semibold">
                Q
              </span>
              <p className="min-w-0 flex-1 truncate text-[14px]">
                {typed || <span className="text-ink-faint">Waiting…</span>}
                {typed.length < QUERY.length && phase < 0 && (
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-caret-blink bg-accent-blue align-middle" />
                )}
              </p>
              <button
                onClick={run}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                aria-label="Replay the demo"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Progress */}
            <div className="px-5 pt-4">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className={cn(phase >= 0 && phase < 4 ? 'text-gradient font-medium' : 'text-ink-muted')}>
                  {phase < 0
                    ? 'Ready'
                    : phase >= 4
                      ? 'Complete'
                      : `${AGENTS[phase].name} — ${AGENTS[phase].role}`}
                </span>
                <span className="tabular-nums text-ink-faint">{progress}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-accent"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                />
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              {/* Agents */}
              <div className="space-y-1.5">
                {AGENTS.map((agent, index) => {
                  const status = statusOf(index)
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        'relative flex items-center gap-2.5 overflow-hidden rounded-xl border p-2.5 transition-colors duration-500',
                        status === 'running'
                          ? 'border-accent-blue/35 bg-accent-blue/[0.07]'
                          : status === 'done'
                            ? 'border-accent-emerald/25 bg-accent-emerald/[0.05]'
                            : 'border-hairline bg-white/[0.02]',
                      )}
                    >
                      {status === 'running' && !reduced && (
                        <span className="shimmer absolute inset-0" aria-hidden />
                      )}

                      <span
                        className={cn(
                          'relative grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05]',
                          status === 'running'
                            ? 'text-accent-blue'
                            : status === 'done'
                              ? 'text-accent-emerald'
                              : 'text-ink-faint',
                        )}
                      >
                        {status === 'done' ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check className="h-3 w-3" />
                          </motion.span>
                        ) : (
                          <agent.icon className={cn('h-3 w-3', status === 'running' && !reduced && 'animate-pulse')} />
                        )}
                      </span>

                      <span className="relative min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold">{agent.name}</span>
                        <span className="block truncate text-[10px] text-ink-muted">{agent.role}</span>
                      </span>

                      <span
                        className={cn(
                          'relative shrink-0 text-[9px] font-medium uppercase tracking-wide',
                          status === 'running'
                            ? 'text-accent-blue'
                            : status === 'done'
                              ? 'text-accent-emerald'
                              : 'text-ink-faint',
                        )}
                      >
                        {status === 'running' ? 'Working' : status === 'done' ? 'Done' : 'Waiting'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Sources + logs */}
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Sources found
                  </p>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {visibleSources.map((source) => (
                        <motion.div
                          key={source.domain}
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35 }}
                          className="flex items-center gap-2 rounded-lg border border-hairline bg-white/[0.02] p-2"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/[0.05]">
                            <Globe className="h-2.5 w-2.5 text-ink-faint" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10px] font-medium">{source.title}</span>
                            <span className="block truncate text-[9px] text-ink-faint">{source.domain}</span>
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {visibleSources.length === 0 && (
                      <p className="rounded-lg border border-dashed border-hairline p-3 text-center text-[10px] text-ink-faint">
                        Waiting for the Scout agent…
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Activity
                  </p>
                  <div className="space-y-1 rounded-lg border border-hairline bg-black/20 p-2.5">
                    {visibleLogs.length === 0 ? (
                      <p className="font-mono text-[9px] text-ink-faint/60">idle</p>
                    ) : (
                      visibleLogs.map((log) => (
                        <motion.p
                          key={log.text}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-mono text-[9px] leading-relaxed text-ink-muted"
                        >
                          {log.text}
                        </motion.p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Result */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-hairline"
                >
                  <div className="flex flex-wrap items-center gap-4 p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-accent-emerald/60 font-display text-sm font-semibold text-accent-emerald">
                      8
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-semibold">Report ready</span>
                      <span className="block text-[11px] text-ink-muted">
                        4 sources · scored 8/10 by the Critic agent
                      </span>
                    </span>
                    <Link to="/app" className="shrink-0">
                      <Button variant="primary" size="sm" magnetic>
                        Run a real one
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-3 text-center text-[11px] text-ink-faint/70">
            A scripted simulation — timings and sources are illustrative. Real runs stream from the backend.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
