import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsDesktop } from '@/hooks/useMediaQuery'

/**
 * A soft light that trails the pointer.
 *
 * Position lives in motion values rather than React state, so pointer movement
 * never triggers a re-render. Desktop only — there is no cursor to follow on
 * touch, and it is skipped outright under reduced motion.
 */
export function CursorGlow() {
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()

  const x = useMotionValue(-400)
  const y = useMotionValue(-400)
  const springX = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 })

  useEffect(() => {
    if (reduced || !isDesktop) return
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX - 220)
      y.set(event.clientY - 220)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, isDesktop, x, y])

  if (reduced || !isDesktop) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-0 h-[440px] w-[440px] rounded-full opacity-[0.5] blur-[90px]"
      style={{
        x: springX,
        y: springY,
        background: 'radial-gradient(circle, rgba(99,102,241,0.16), rgba(34,211,238,0.06) 45%, transparent 70%)',
      }}
    />
  )
}
