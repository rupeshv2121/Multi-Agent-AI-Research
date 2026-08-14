import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { IS_PLACEHOLDER_CONTENT, TESTIMONIALS } from '@/content/placeholders'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/**
 * Testimonial carousel.
 *
 * The quotes are placeholders (see `content/placeholders.ts`) and the section
 * says so plainly. Avatars are initials, not stock photos or generated faces —
 * inventing a likeness for a person who does not exist compounds the problem.
 *
 * Auto-advance stops on hover, on focus within, and under reduced motion, so it
 * never yanks a quote away from someone mid-sentence.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (paused || reduced) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 5200)
    return () => window.clearInterval(timer)
  }, [paused, reduced])

  const go = (delta: number) =>
    setIndex((i) => (i + delta + TESTIMONIALS.length) % TESTIMONIALS.length)

  const current = TESTIMONIALS[index]

  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Feedback"
        title="What researchers say"
        description={
          IS_PLACEHOLDER_CONTENT
            ? 'Placeholder quotes shown for layout — swap them for real ones before publishing.'
            : undefined
        }
      />

      <Reveal>
        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="gradient-border relative min-h-[260px] rounded-[24px] bg-surface/50 p-7 backdrop-blur-2xl sm:min-h-[230px] sm:p-10">
            <Quote className="mb-5 h-7 w-7 text-accent-primary/50" aria-hidden />

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, y: -14, filter: 'blur(6px)' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-balance text-[16px] leading-relaxed sm:text-lg">“{current.quote}”</p>

                <footer className="mt-6 flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-accent text-canvas text-[13px] font-semibold"
                    aria-hidden
                  >
                    {current.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <cite className="block truncate text-[13px] font-semibold not-italic">
                      {current.name}
                    </cite>
                    <span className="block truncate text-[11px] text-ink-muted">
                      {current.role} · {current.company}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-0.5" aria-label={`Rated ${current.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < current.rating ? 'fill-accent-amber text-accent-amber' : 'text-white/15',
                        )}
                        aria-hidden
                      />
                    ))}
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <CarouselButton label="Previous testimonial" onClick={() => go(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </CarouselButton>

            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === index ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/15 hover:bg-white/30',
                  )}
                />
              ))}
            </div>

            <CarouselButton label="Next testimonial" onClick={() => go(1)}>
              <ChevronRight className="h-4 w-4" />
            </CarouselButton>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      className="grid h-9 w-9 place-items-center rounded-xl border border-hairline text-ink-muted transition-colors hover:border-white/20 hover:text-ink"
    >
      {children}
    </motion.button>
  )
}
