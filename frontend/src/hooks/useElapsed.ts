import { useEffect, useState } from 'react'

/**
 * Seconds since `startedAt`, ticking while `active`. Returns 0 when there is
 * no start time, so callers can render a placeholder without a null check.
 */
export function useElapsed(startedAt: number | null | undefined, active: boolean): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }
    const tick = () => setElapsed((Date.now() - startedAt) / 1000)
    tick()
    if (!active) return
    const timer = window.setInterval(tick, 100)
    return () => window.clearInterval(timer)
  }, [startedAt, active])

  return elapsed
}
