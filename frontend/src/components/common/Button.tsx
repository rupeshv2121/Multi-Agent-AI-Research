import { forwardRef, useCallback, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const button = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden font-medium ' +
    'transition-colors disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-accent bg-[length:200%_200%] text-white shadow-glow-blue hover:bg-[position:100%_50%] ' +
          'transition-[background-position,box-shadow] duration-500',
        secondary: 'bg-white/[0.06] text-ink hover:bg-white/[0.10] border border-hairline',
        ghost: 'text-ink-muted hover:text-ink hover:bg-white/[0.06]',
        danger: 'bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25 border border-accent-rose/25',
        outline: 'border border-hairline text-ink hover:border-white/20 hover:bg-white/[0.04]',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-lg',
        sm: 'h-9 px-3.5 text-sm rounded-xl',
        md: 'h-11 px-5 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9 rounded-xl',
        'icon-sm': 'h-7 w-7 rounded-lg',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

interface Ripple {
  id: number
  x: number
  y: number
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  /** Adds a subtle pointer-tracking pull. Skipped when motion is reduced. */
  magnetic?: boolean
  loading?: boolean
  children?: ReactNode
}

let rippleSeed = 0

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, magnetic = false, loading = false, children, onClick, disabled, ...props },
  forwardedRef,
) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const localRef = useRef<HTMLButtonElement | null>(null)
  const reduced = useReducedMotion()

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!reduced) {
      const rect = event.currentTarget.getBoundingClientRect()
      const ripple = { id: rippleSeed++, x: event.clientX - rect.left, y: event.clientY - rect.top }
      setRipples((current) => [...current, ripple])
      window.setTimeout(() => setRipples((current) => current.filter((r) => r.id !== ripple.id)), 600)
    }
    onClick?.(event)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    // Pull toward the cursor at a fraction of the distance from centre.
    setOffset({
      x: (event.clientX - rect.left - rect.width / 2) * 0.18,
      y: (event.clientY - rect.top - rect.height / 2) * 0.28,
    })
  }

  return (
    <motion.button
      ref={setRefs}
      className={cn(button({ variant, size }), className)}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/25"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
            animate={{ width: 320, height: 320, x: -160, y: -160, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {loading && (
        <span
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </motion.button>
  )
})
