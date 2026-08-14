import type { Transition, Variants } from 'framer-motion'

/**
 * Shared motion vocabulary.
 *
 * Two springs do most of the work: `spring` for anything the user's pointer or
 * intent drives, `soft` for ambient/entrance motion. Keeping them here stops
 * every component from inventing its own timing.
 */
export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }
export const soft: Transition = { type: 'spring', stiffness: 180, damping: 24 }
export const swift: Transition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: soft },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: swift },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: swift },
  exit: { opacity: 0, transition: swift },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.98, transition: swift },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: soft },
  exit: { opacity: 0, x: 24, transition: swift },
}

/** Parent that walks its children in with a small offset. */
export const stagger = (delay = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.04 } },
})

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(8px)', transition: { duration: 0.2 } },
}

/** Card hover lift, applied via `whileHover`. */
export const lift = { y: -4, transition: spring }
export const press = { scale: 0.97, transition: { duration: 0.1 } }
