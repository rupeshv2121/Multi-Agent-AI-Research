import { forwardRef, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { spring } from '@/animations/variants'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode
  /** Lift on hover. */
  interactive?: boolean
  /** A soft radial highlight that tracks the pointer across the card. */
  spotlight?: boolean
  gradientBorder?: boolean
  className?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, interactive = false, spotlight = false, gradientBorder = false, className, ...props },
  ref,
) {
  const reduced = useReducedMotion()
  const [pointer, setPointer] = useState({ x: -200, y: -200 })
  const localRef = useRef<HTMLDivElement | null>(null)

  return (
    <motion.div
      ref={(node) => {
        localRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        'glass relative',
        gradientBorder && 'gradient-border',
        interactive && 'transition-colors hover:border-white/[0.14]',
        className,
      )}
      whileHover={interactive && !reduced ? { y: -4, transition: spring } : undefined}
      onMouseMove={
        spotlight && !reduced
          ? (event) => {
              const rect = localRef.current?.getBoundingClientRect()
              if (!rect) return
              setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })
            }
          : undefined
      }
      onMouseLeave={spotlight ? () => setPointer({ x: -200, y: -200 }) : undefined}
      {...props}
    >
      {spotlight && !reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 transition-opacity"
          style={{
            background: `radial-gradient(340px circle at ${pointer.x}px ${pointer.y}px, rgba(249,115,22,0.10), transparent 70%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  )
})
