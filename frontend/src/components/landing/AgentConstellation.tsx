import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { AGENTS } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/**
 * Node positions as percentages of the frame — a zig-zag, so the links read as
 * a flow rather than a straight row. Kept well inside the edges so the node
 * labels (which are HTML, and wider than the dot) never clip.
 */
const LAYOUT = [
  { x: 12, y: 26 },
  { x: 37, y: 74 },
  { x: 63, y: 26 },
  { x: 88, y: 74 },
]

const VIEW_W = 100
const VIEW_H = 100

/**
 * An SVG constellation of the four agents with particles flowing along the
 * links, cycling through the pipeline so the section demonstrates the handoff
 * rather than describing it.
 *
 * SVG rather than canvas here because there are only four nodes and three
 * links: the browser's own animation of a handful of elements is cheaper than
 * a per-frame redraw, and the nodes stay in the accessibility tree.
 */
export function AgentConstellation() {
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    // +1 beyond the last agent gives a brief "all complete" beat before looping.
    const timer = window.setInterval(() => setActive((index) => (index + 1) % (AGENTS.length + 1)), 1600)
    return () => window.clearInterval(timer)
  }, [reduced])

  const statusOf = (index: number) => {
    if (reduced) return 'done' as const
    if (index < active) return 'done' as const
    if (index === active) return 'running' as const
    return 'idle' as const
  }

  return (
    <Section id="agents" className="overflow-hidden">
      <SectionHeading
        eyebrow="The pipeline"
        title="Four agents, one continuous handoff"
        description="Each agent does one job well and passes its output to the next. In the app this same graph is driven by the live run, not a loop."
      />

      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-hairline bg-surface/40 p-4 backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_65%)]" aria-hidden />

          <div className="relative aspect-[5/3] w-full sm:aspect-[3.4/1]">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="link-live" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>

              {LAYOUT.slice(0, -1).map((from, index) => {
                const to = LAYOUT[index + 1]
                const passed = statusOf(index) === 'done'
                const flowing = passed && statusOf(index + 1) === 'running'

                return (
                  <g key={index}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={flowing ? 'url(#link-live)' : passed ? '#10B981' : 'rgba(255,255,255,0.14)'}
                      // non-scaling-stroke means these are CSS pixels, not
                      // viewBox units — the viewBox is stretched hard here.
                      strokeWidth={flowing ? 2.5 : passed ? 1.75 : 1.25}
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      className="transition-all duration-700"
                      style={flowing ? { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.75))' } : undefined}
                    />

                    {/* Particle riding the active link. */}
                    {flowing && !reduced && (
                      <motion.circle
                        r="1.4"
                        fill="#fff"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))' }}
                        initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                        animate={{ cx: to.x, cy: to.y, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Nodes are positioned HTML so their text stays selectable and legible. */}
            {AGENTS.map((agent, index) => {
              const status = statusOf(index)
              const position = LAYOUT[index]
              return (
                <ConstellationNode
                  key={agent.id}
                  agent={agent}
                  status={status}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                />
              )
            })}
          </div>

          {/* Screen readers get the roster as a list, not a diagram. */}
          <ol className="sr-only">
            {AGENTS.map((agent) => (
              <li key={agent.id}>
                {agent.name}: {agent.role}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* Roles in full, below the graphic */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((agent, index) => (
          <Reveal key={agent.id} delay={index * 0.06}>
            <div className="h-full rounded-card border border-hairline bg-surface/50 p-4 backdrop-blur-xl">
              <span className={cn('mb-3 grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-white/[0.04]', agent.tone)}>
                <agent.icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="font-display text-sm font-semibold tracking-tight">{agent.name}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{agent.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function ConstellationNode({
  agent,
  status,
  style,
}: {
  agent: (typeof AGENTS)[number]
  status: 'idle' | 'running' | 'done'
  style: React.CSSProperties
}) {
  const reduced = useReducedMotion()
  const Icon = agent.icon

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      {status === 'running' && !reduced && (
        <motion.span
          className="absolute -inset-3 rounded-2xl bg-accent-blue/25 blur-xl"
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.94, 1.08, 0.94] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      )}

      <motion.div
        animate={status === 'running' && !reduced ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 2.4, repeat: status === 'running' && !reduced ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'relative flex items-center gap-2 rounded-2xl border px-2.5 py-2 backdrop-blur-xl transition-colors duration-500 sm:px-3',
          status === 'running'
            ? 'border-accent-blue/50 bg-accent-blue/[0.12]'
            : status === 'done'
              ? 'border-accent-emerald/40 bg-accent-emerald/[0.09]'
              : 'border-hairline bg-white/[0.03]',
        )}
      >
        <span
          className={cn(
            'grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05]',
            status === 'running' ? 'text-accent-blue' : status === 'done' ? 'text-accent-emerald' : 'text-ink-faint',
          )}
        >
          {status === 'done' ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
        </span>
        <span className="whitespace-nowrap text-[11px] font-semibold sm:text-[12px]">{agent.name}</span>
      </motion.div>
    </div>
  )
}
