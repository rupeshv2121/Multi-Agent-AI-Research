import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './useReducedMotion'

/**
 * Lenis smooth scrolling for the landing page.
 *
 * Deliberately skipped when motion is reduced: hijacking the scroll wheel is
 * exactly the kind of motion that setting exists to opt out of, and the page
 * reads fine with the browser's native scrolling.
 *
 * Returns nothing — the effect owns the instance and tears it down on unmount,
 * so the workspace (which manages its own scroll containers) is unaffected.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.05,
      // Gentle exponential ease-out; long enough to feel smooth, short enough
      // that anchor jumps do not feel sluggish.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // In-page anchors need to go through Lenis, or the browser's instant jump
    // fights the smoothed scroll position.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')?.slice(1)
      const target = id && document.getElementById(id)
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target, { offset: -80 })
    }

    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick)
      lenis.destroy()
    }
  }, [reduced])
}
