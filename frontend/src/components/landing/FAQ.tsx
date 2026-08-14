import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { FAQ as QUESTIONS } from '@/content/product'
import { cn } from '@/utils/cn'

/**
 * Accordion. One panel open at a time, and the open panel can be closed —
 * a forced-open item makes the list feel stuck.
 */
export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="Questions"
        title="Answers before you start"
        description="Everything below describes how the software works today, not what is planned."
      />

      <div className="mx-auto max-w-3xl space-y-2.5">
        {QUESTIONS.map((item, index) => {
          const expanded = open === index
          const panelId = `faq-panel-${index}`
          const buttonId = `faq-button-${index}`

          return (
            <Reveal key={item.question} delay={Math.min(index * 0.05, 0.2)}>
              <div
                className={cn(
                  'overflow-hidden rounded-card border bg-surface/40 backdrop-blur-xl transition-colors duration-300',
                  expanded ? 'border-white/[0.14]' : 'border-hairline hover:border-white/[0.11]',
                )}
              >
                <h3>
                  <button
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : index)}
                    className="flex w-full items-center gap-4 p-5 text-left"
                  >
                    <span className="flex-1 font-display text-[15px] font-medium tracking-tight">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: expanded ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors',
                        expanded
                          ? 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
                          : 'border-hairline text-ink-faint',
                      )}
                      aria-hidden
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-ink-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
