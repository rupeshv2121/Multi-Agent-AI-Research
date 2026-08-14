import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The mark: three orbiting nodes around a core — a multi-agent system in one
 * glyph. Rotation is a single transform on the outer group, so it costs one
 * composited layer.
 */
export function Logo({ className, animated = true }: { className?: string; animated?: boolean }) {
  const reduced = useReducedMotion()
  const spin = animated && !reduced

  return (
    <span className={cn('relative inline-grid h-9 w-9 shrink-0 place-items-center', className)}>
      <span className="absolute inset-0 rounded-xl bg-gradient-accent opacity-20 blur-md" aria-hidden />
      <span className="absolute inset-0 rounded-xl bg-gradient-accent bg-[length:200%_200%] animate-gradient-pan" aria-hidden />
      <svg viewBox="0 0 32 32" className="relative h-5 w-5" fill="none" aria-hidden>
        <motion.g
          animate={spin ? { rotate: 360 } : undefined}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '16px', originY: '16px' }}
        >
          <circle cx="16" cy="5" r="2.6" fill="white" />
          <circle cx="26.5" cy="22" r="2.6" fill="white" fillOpacity="0.85" />
          <circle cx="5.5" cy="22" r="2.6" fill="white" fillOpacity="0.7" />
          <path
            d="M16 5 L26.5 22 L5.5 22 Z"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </motion.g>
        <circle cx="16" cy="16" r="3.4" fill="white" />
      </svg>
    </span>
  )
}
