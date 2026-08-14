import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Three dots that breathe in sequence — the "thinking" tell. */
export function TypingDots({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-label="Working">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={reduced ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}
