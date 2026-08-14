import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Check, Clock, FileText, Globe, Link2, Search, Sparkles } from 'lucide-react'
import { Section, SectionHeading, Reveal } from './Section'
import { AGENTS } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/**
 * A scaled-down recreation of the real workspace, built from the same design
 * tokens as the app itself rather than a screenshot — so it stays sharp at any
 * resolution and never drifts out of date with the product's styling.
 *
 * It tilts back and straightens as it scrolls into view.
 */
export function Showcase() {
  const container = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start 0.9', 'center 0.55'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1])

  return (
    <Section id="showcase">
      <SectionHeading
        eyebrow="The workspace"
        title="Watch the research happen"
        description="Report on the left, live agent pipeline on the right. Nothing is hidden behind a spinner — every stage, source and timing is on screen as it lands."
      />

      <div ref={container} className="[perspective:1600px]">
        <motion.div
          style={reduced ? undefined : { rotateX, scale, opacity }}
          className="relative origin-top"
        >
          {/* Ambient glow behind the frame */}
          <div
            className="absolute -inset-x-10 -top-8 bottom-0 rounded-[40px] bg-gradient-to-r from-accent-primary/20 via-accent-secondary/20 to-accent-tertiary/20 blur-[70px]"
            aria-hidden
          />

          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.10] bg-canvas shadow-lift">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-hairline bg-surface-sunken/80 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
              </span>
              <span className="mx-auto rounded-md bg-white/[0.04] px-3 py-0.5 text-[10px] text-ink-faint">
                localhost:8000/app
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
              {/* Report column */}
              <div className="min-w-0 border-hairline p-4 sm:p-6 lg:border-r">
                <div className="mb-4 flex justify-end">
                  <span className="rounded-2xl rounded-br-md border border-hairline bg-white/[0.06] px-3 py-2 text-[12px]">
                    Future of quantum computing
                  </span>
                </div>

                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-accent">
                    <Sparkles className="h-3 w-3 text-canvas" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1 rounded-card border border-hairline bg-surface/60 p-4">
                    <h3 className="font-display text-[15px] font-semibold">
                      The Future of Quantum Computing
                    </h3>

                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Introduction
                    </p>
                    <div className="mt-1.5 space-y-1.5" aria-hidden>
                      <Line w="100%" />
                      <Line w="94%" />
                      <Line w="78%" />
                    </div>

                    <p className="mt-3.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Key findings
                    </p>
                    <div className="mt-1.5 space-y-1.5" aria-hidden>
                      <Line w="88%" accent />
                      <Line w="97%" />
                      <Line w="72%" />
                    </div>

                    {/* Mini chart, matching the app's run-insight bars */}
                    <div className="mt-4 rounded-xl border border-hairline bg-white/[0.02] p-3">
                      <p className="mb-2.5 text-[10px] font-medium text-ink-muted">Time per agent</p>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Scout', pct: 22 },
                          { name: 'Reader', pct: 74 },
                          { name: 'Writer', pct: 48 },
                          { name: 'Critic', pct: 36 },
                        ].map((row, index) => (
                          <div key={row.name} className="flex items-center gap-2">
                            <span className="w-11 shrink-0 text-[9px] text-ink-faint">{row.name}</span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                              <motion.span
                                className="block h-full rounded-full bg-[#3987e5]"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${row.pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source cards */}
                    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {[
                        { site: 'Nature', domain: 'nature.com', score: 92 },
                        { site: 'Arxiv', domain: 'arxiv.org', score: 88 },
                      ].map((source) => (
                        <div
                          key={source.domain}
                          className="flex items-center gap-2 rounded-lg border border-hairline bg-white/[0.02] p-2"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/[0.05]">
                            <Globe className="h-2.5 w-2.5 text-ink-faint" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10px] font-medium">{source.site}</span>
                            <span className="block truncate text-[9px] text-ink-faint">{source.domain}</span>
                          </span>
                          <span className="text-[9px] tabular-nums text-ink-faint">{source.score}</span>
                        </div>
                      ))}
                    </div>

                    {/* Critic strip */}
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-accent-emerald/20 bg-accent-emerald/[0.06] p-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-accent-emerald/60 text-[10px] font-semibold text-accent-emerald">
                        8
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold">Critic review</span>
                        <span className="block text-[9px] text-ink-muted">Strong — scored 8/10</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent panel */}
              <aside className="hidden bg-surface-sunken/50 p-3 lg:block">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold">Agent pipeline</span>
                  <span className="text-[9px] tabular-nums text-ink-faint">4/4</span>
                </div>

                <span className="mb-4 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>

                <div className="space-y-1.5">
                  {AGENTS.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.12, duration: 0.4 }}
                      className="rounded-xl border border-hairline bg-surface/60 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-2.5 w-2.5 shrink-0 text-accent-emerald" aria-hidden />
                        <span className="flex-1 truncate text-[11px] font-semibold">{agent.name}</span>
                        <span className="flex items-center gap-0.5 text-[9px] tabular-nums text-ink-faint">
                          <Clock className="h-2 w-2" aria-hidden />
                          {['1.4s', '7.1s', '8.1s', '3.3s'][index]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[9px] text-ink-muted">{agent.role}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-hairline pt-3">
                  {[
                    { icon: Search, label: 'Searching the web…' },
                    { icon: Link2, label: '12 sources collected' },
                    { icon: FileText, label: 'Report written' },
                  ].map((row) => (
                    <p key={row.label} className="flex items-center gap-1.5 text-[9px] text-ink-faint">
                      <row.icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
                      {row.label}
                    </p>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
      </div>

      <Reveal delay={0.15} className="mt-6 text-center">
        <p className="text-[12px] text-ink-faint">
          An illustration of the workspace built from the app's own components — open{' '}
          <span className="text-ink-muted">/app</span> to use the real thing.
        </p>
      </Reveal>
    </Section>
  )
}

/** Placeholder text run inside the mock document. */
function Line({ w, accent = false }: { w: string; accent?: boolean }) {
  return (
    <span
      className={cn('block h-1.5 rounded-full', accent ? 'bg-white/[0.14]' : 'bg-white/[0.07]')}
      style={{ width: w }}
    />
  )
}
