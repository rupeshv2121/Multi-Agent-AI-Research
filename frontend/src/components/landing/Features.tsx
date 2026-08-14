import { motion } from 'framer-motion'
import { Reveal, Section, SectionHeading } from './Section'
import { FEATURES } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'
import { useRef, useState } from 'react'

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Capabilities"
        title={
          <>
            Everything a research run needs,
            <br className="hidden sm:block" /> in one workspace
          </>
        }
        description="Each of these is built and working today — not a roadmap. Open the app and you can use every one of them."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={Math.min((index % 3) * 0.06, 0.18)}>
            <FeatureCard {...feature} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  tone,
}: (typeof FEATURES)[number]) {
  const card = useRef<HTMLDivElement>(null)
  const [pointer, setPointer] = useState({ x: -300, y: -300 })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={card}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      onMouseMove={
        reduced
          ? undefined
          : (event) => {
              const rect = card.current?.getBoundingClientRect()
              if (!rect) return
              setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })
            }
      }
      onMouseLeave={() => setPointer({ x: -300, y: -300 })}
      className={cn(
        'group relative h-full overflow-hidden rounded-card border border-hairline bg-surface/50 p-5',
        'backdrop-blur-xl transition-colors duration-300 hover:border-white/[0.14]',
      )}
    >
      {/* Pointer-tracking highlight. */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(360px circle at ${pointer.x}px ${pointer.y}px, rgba(99,102,241,0.13), transparent 65%)`,
          }}
        />
      )}

      {/* Gradient hairline that lights along the top edge on hover. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-accent transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="relative">
        <span
          className={cn(
            'mb-4 grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-white/[0.04]',
            'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
            tone,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>

        <h3 className="font-display text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{description}</p>
      </div>
    </motion.div>
  )
}
