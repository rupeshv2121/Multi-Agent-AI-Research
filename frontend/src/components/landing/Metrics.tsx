import { useInView } from 'framer-motion'
import { useRef } from 'react'
import CountUp from 'react-countup'
import { Reveal, Section } from './Section'
import { IS_PLACEHOLDER_CONTENT, METRICS } from '@/content/placeholders'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Animated counters.
 *
 * The figures come from `content/placeholders.ts` and are illustrative — see
 * the header of that file. The note under the row says so rather than letting
 * invented numbers pass as measurements.
 */
export function Metrics() {
  const container = useRef<HTMLDivElement>(null)
  // `once` so the counters do not re-run every time the row scrolls past.
  const inView = useInView(container, { once: true, margin: '-100px' })
  const reduced = useReducedMotion()

  return (
    <Section className="border-y border-hairline bg-surface-sunken/30">
      <div ref={container} className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-5">
        {METRICS.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 0.07} className="text-center">
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient">
                {inView && !reduced ? (
                  <CountUp
                    end={metric.value}
                    decimals={metric.decimals ?? 0}
                    duration={2}
                    separator=","
                  />
                ) : (
                  metric.value.toFixed(metric.decimals ?? 0)
                )}
                {metric.suffix}
              </span>
            </p>
            <p className="mt-1.5 text-[13px] font-medium">{metric.label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">{metric.caption}</p>
          </Reveal>
        ))}
      </div>

      {IS_PLACEHOLDER_CONTENT && (
        <Reveal delay={0.3}>
          <p className="mt-10 text-center text-[11px] text-ink-faint/70">
            Illustrative figures for layout — replace them in{' '}
            <code className="rounded bg-white/[0.05] px-1 py-0.5 font-mono">
              src/content/placeholders.ts
            </code>{' '}
            with numbers you can stand behind, or remove this section.
          </p>
        </Reveal>
      )}
    </Section>
  )
}
