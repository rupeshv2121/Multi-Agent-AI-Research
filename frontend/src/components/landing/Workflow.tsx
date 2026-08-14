import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Download, MessageSquare } from 'lucide-react'
import { Section, SectionHeading } from './Section'
import { AGENTS } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/** The full journey: what you do, what the four agents do, what you get. */
const STEPS = [
  {
    id: 'ask',
    name: 'Enter a research question',
    role: 'You describe the topic in a sentence',
    detail:
      'Anything from a technology comparison to a literature scan. The topic is the only input the pipeline needs.',
    icon: MessageSquare,
    tone: 'text-ink',
    kind: 'you' as const,
  },
  ...AGENTS.map((agent) => ({ ...agent, kind: 'agent' as const })),
  {
    id: 'export',
    name: 'Take the report away',
    role: 'Markdown, Word or PDF — with references attached',
    detail:
      'The finished document keeps its numbered reference list and the critic’s score, so it stands on its own outside the app.',
    icon: Download,
    tone: 'text-ink',
    kind: 'you' as const,
  },
]

/**
 * Scroll-driven timeline.
 *
 * A single progress line fills as the section passes through the viewport, and
 * each step brightens once the line reaches it — so the workflow is read at the
 * pace the reader scrolls rather than on a timer.
 */
export function Workflow() {
  const container = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start 0.75', 'end 0.55'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="How it works"
        title="One question in, a sourced report out"
        description="Six stages, four of them autonomous. Every one reports its status to the interface while it runs."
      />

      <div ref={container} className="relative mx-auto max-w-3xl">
        {/* Rail */}
        <div className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-white/[0.07]" aria-hidden />
        <motion.div
          className="absolute left-[19px] top-2 w-px origin-top bg-gradient-to-b from-accent-blue via-accent-purple to-accent-emerald"
          style={{ height: reduced ? '100%' : lineHeight }}
          aria-hidden
        />

        <ol className="space-y-8">
          {STEPS.map((step, index) => (
            <StepRow key={step.id} step={step} index={index} total={STEPS.length} />
          ))}
        </ol>
      </div>
    </Section>
  )
}

function StepRow({
  step,
  index,
  total,
}: {
  step: (typeof STEPS)[number]
  index: number
  total: number
}) {
  const reduced = useReducedMotion()
  const Icon = step.icon

  return (
    <motion.li
      className="relative flex gap-5"
      initial={reduced ? false : { opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Node */}
      <span className="relative z-10 shrink-0">
        <span
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-xl',
            step.kind === 'agent'
              ? 'border-white/[0.12] bg-surface-raised'
              : 'border-hairline bg-white/[0.04]',
          )}
        >
          <Icon className={cn('h-4 w-4', step.tone)} aria-hidden />
        </span>
      </span>

      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Step {index + 1} of {total}
          </span>
          {step.kind === 'agent' && (
            <span className="rounded-full border border-accent-blue/25 bg-accent-blue/[0.10] px-2 py-0.5 text-[10px] font-medium text-accent-blue">
              Agent
            </span>
          )}
        </div>

        <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">{step.name}</h3>
        <p className="mt-0.5 text-[13px] text-ink-muted">{step.role}</p>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-faint">{step.detail}</p>
      </div>
    </motion.li>
  )
}
