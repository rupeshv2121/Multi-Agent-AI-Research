import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Reveal-on-scroll wrapper.
 *
 * `whileInView` with `once` means each block animates the first time it is
 * reached and then stays put — re-animating on every scroll-past is the thing
 * that makes long marketing pages feel restless.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  /** Constrains the inner column; sections that bleed set this to false. */
  contained?: boolean
}

export function Section({ id, children, className, contained = true }: SectionProps) {
  return (
    <section id={id} className={cn('relative py-20 sm:py-28', className)}>
      {contained ? <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div> : children}
    </section>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn('mb-12 sm:mb-16', align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <span
          className={cn(
            'mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03]',
            'px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted backdrop-blur-xl',
          )}
        >
          <span className="h-1 w-1 rounded-full bg-accent-primary" aria-hidden />
          {eyebrow}
        </span>
      )}

      <h2 className="text-balance font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            'mt-4 text-balance text-[15px] leading-relaxed text-ink-muted sm:text-base',
            align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  )
}
