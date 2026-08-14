import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/uiStore'

/**
 * True when motion should be suppressed — either the OS asks for it or the
 * user turned it off in Settings. Components branch on this to skip decorative
 * animation entirely rather than merely shortening it.
 */
export function useReducedMotion(): boolean {
  const preference = useUIStore((s) => s.reducedMotion)
  const [system, setSystem] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (event: MediaQueryListEvent) => setSystem(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return system || preference
}
