import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  label: string
  children: ReactNode
  className?: string
}

/**
 * Off-canvas panel used below `lg`, where the sidebar and agent panel cannot
 * both stay resident. Traps focus and restores it on close so keyboard users
 * are not dropped back at the top of the document.
 */
export function Drawer({ open, onClose, side = 'left', label, children, className }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreFocus.current = document.activeElement as HTMLElement
    panel.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panel.current) return
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      restoreFocus.current?.focus()
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cn(
              'fixed inset-y-0 z-50 flex w-[min(88vw,340px)] flex-col bg-surface-sunken shadow-lift lg:hidden',
              side === 'left' ? 'left-0 border-r border-hairline' : 'right-0 border-l border-hairline',
              className,
            )}
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-white/10 hover:text-ink"
              aria-label={`Close ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
