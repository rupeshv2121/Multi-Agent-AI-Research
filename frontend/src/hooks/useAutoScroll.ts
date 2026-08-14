import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Keep a scroll container pinned to the bottom as content streams in — but
 * stop the moment the user scrolls up, so reading back through a long report
 * is never yanked away. Re-pins when they return to the bottom.
 */
export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T | null>(null)
  const pinned = useRef(true)
  const [showJump, setShowJump] = useState(false)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const element = ref.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
    pinned.current = true
    setShowJump(false)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const onScroll = () => {
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight
      pinned.current = distance < 80
      setShowJump(distance > 240)
    }

    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (pinned.current) {
      const element = ref.current
      element?.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
    }
  }, [dependency])

  return { ref, showJump, scrollToBottom }
}
