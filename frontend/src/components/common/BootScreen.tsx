import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from './Logo'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const PHASES = ['Waking the agents', 'Connecting to the pipeline', 'Ready']

/**
 * A brief boot sequence on first paint.
 *
 * It is deliberately short and non-blocking: the app renders underneath the
 * whole time, so this covers the first frame rather than delaying it. Skipped
 * entirely when motion is reduced.
 */
export function BootScreen() {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(!reduced)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (reduced) {
      setVisible(false)
      return
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 420),
      window.setTimeout(() => setPhase(2), 840),
      window.setTimeout(() => setVisible(false), 1180),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [reduced])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-canvas"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative"
            >
              <motion.span
                className="absolute inset-0 scale-[2.2] rounded-full bg-accent-blue/25 blur-2xl"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Logo className="relative h-14 w-14 rounded-2xl" />
            </motion.div>

            <div className="h-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs tracking-wide text-ink-muted"
                >
                  {PHASES[phase]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="h-px w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
