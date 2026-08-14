import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface TooltipProps {
  label: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Classes for the tooltip bubble. */
  className?: string
  /**
   * Classes for the trigger wrapper. The wrapper defaults to `inline-flex`,
   * which is right for icon buttons sitting in a row but collapses a
   * full-width trigger down to its content — pass `block w-full` when the
   * child is meant to fill its container, as the collapsed sidebar nav does.
   */
  wrapperClassName?: string
}

const placement = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

/**
 * Floating tooltip that appears on hover *and* keyboard focus, and is wired to
 * its trigger with aria-describedby so screen readers announce it too.
 */
export function Tooltip({ label, children, side = 'top', className, wrapperClassName }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className={cn('relative inline-flex', wrapperClassName)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-hairline',
              'bg-surface-raised/95 px-2.5 py-1.5 text-xs font-medium text-ink shadow-float backdrop-blur-xl',
              placement[side],
              className,
            )}
            initial={{ opacity: 0, scale: 0.94, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
