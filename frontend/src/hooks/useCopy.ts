import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/** Copy to clipboard with a short-lived "copied" flag for the checkmark morph. */
export function useCopy(resetAfter = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const copy = useCallback(
    async (text: string, label = 'Copied to clipboard') => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(label)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfter)
      } catch {
        toast.error('Clipboard access was blocked by the browser.')
      }
    },
    [resetAfter],
  )

  return { copied, copy }
}
