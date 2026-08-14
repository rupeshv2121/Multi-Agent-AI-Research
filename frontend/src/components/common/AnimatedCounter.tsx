import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedCounterProps {
  value: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  /** Format with thousands separators / compact notation. */
  format?: (value: number) => string
}

/** Counts up to `value` when it changes. Jumps straight there if motion is off. */
export function AnimatedCounter({
  value,
  decimals = 0,
  duration = 1.1,
  prefix = '',
  suffix = '',
  format,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)
  const previous = useRef(reduced ? value : 0)

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => {
        previous.current = value
      },
    })
    return () => controls.stop()
  }, [value, duration, reduced])

  const text = format ? format(display) : display.toFixed(decimals)

  return (
    <span className="tabular-nums">
      {prefix}
      {text}
      {suffix}
    </span>
  )
}
