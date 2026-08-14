import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ProgressBarProps {
  /** 0-100. */
  value: number
  className?: string
  /** Adds the travelling sheen; turn off for static summaries. */
  active?: boolean
  label?: string
}

export function ProgressBar({ value, className, active = false, label }: ProgressBarProps) {
  const reduced = useReducedMotion()
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn('relative h-1 w-full overflow-hidden rounded-full bg-white/[0.06]', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Research progress'}
    >
      <motion.div
        className="relative h-full rounded-full bg-gradient-accent bg-[length:200%_200%]"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
      >
        {active && !reduced && (
          <motion.span
            className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-white/50"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  )
}
