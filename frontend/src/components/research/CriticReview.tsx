import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Gauge } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Markdown } from '@/components/chat/Markdown'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CriticReviewProps {
  feedback: string
  score: number | null
}

const scoreTone = (score: number) =>
  score >= 8
    ? { ring: 'stroke-accent-emerald', text: 'text-accent-emerald', label: 'Strong' }
    : score >= 6
      ? { ring: 'stroke-accent-blue', text: 'text-accent-blue', label: 'Solid' }
      : score >= 4
        ? { ring: 'stroke-accent-amber', text: 'text-accent-amber', label: 'Mixed' }
        : { ring: 'stroke-accent-rose', text: 'text-accent-rose', label: 'Weak' }

/**
 * The Critic agent's verdict, collapsed by default so it does not compete with
 * the report itself. The score is drawn as a ring gauge from the `Score: X/10`
 * line the critic prompt asks for; when it could not be parsed the gauge is
 * omitted rather than faked.
 */
export function CriticReview({ feedback, score }: CriticReviewProps) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  const tone = score != null ? scoreTone(score) : null
  // Circumference of an r=26 circle, used to drive the arc via dash offset.
  const circumference = 2 * Math.PI * 26
  const offset = useMemo(
    () => (score != null ? circumference * (1 - score / 10) : circumference),
    [score, circumference],
  )

  if (!feedback?.trim()) return null

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface/50 backdrop-blur-xl">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        {score != null && tone ? (
          <span className="relative grid h-14 w-14 shrink-0 place-items-center">
            <svg viewBox="0 0 60 60" className="absolute h-14 w-14 -rotate-90">
              <circle cx="30" cy="30" r="26" className="fill-none stroke-white/[0.07]" strokeWidth="4" />
              <motion.circle
                cx="30"
                cy="30"
                r="26"
                className={cn('fill-none', tone.ring)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: reduced ? offset : circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </svg>
            <span className={cn('relative text-sm font-semibold tabular-nums', tone.text)}>{score}</span>
          </span>
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
            <Gauge className="h-4 w-4 text-ink-muted" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Critic review</span>
          <span className="mt-0.5 block text-xs text-ink-muted">
            {score != null && tone
              ? `${tone.label} — scored ${score}/10 by the Critic agent`
              : 'The Critic agent reviewed this report'}
          </span>
        </span>

        <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-hairline"
          >
            <div className="p-4">
              <Markdown content={feedback} className="text-[13px] leading-relaxed" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
