import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** How long the whole reveal should take, however long the report is. */
const BUDGET_MS = 900
/** Update cadence. Each tick re-parses the markdown, so this is not per-frame. */
const TICK_MS = 45

/**
 * Trim a partial markdown slice back to something that renders cleanly.
 *
 * Cutting mid-token leaves orphaned syntax — a dangling `**` renders as
 * literal asterisks and an unclosed `[` swallows the following text. Dropping
 * the incomplete tail costs a few characters that arrive on the next tick.
 */
function trimPartialMarkdown(text: string): string {
  let out = text

  // An odd number of ** runs means the last one is unclosed.
  const bold = out.match(/\*\*/g)?.length ?? 0
  if (bold % 2 === 1) out = out.slice(0, out.lastIndexOf('**'))

  const code = out.match(/`/g)?.length ?? 0
  if (code % 2 === 1) out = out.slice(0, out.lastIndexOf('`'))

  // A link that has opened but not closed.
  const open = out.lastIndexOf('[')
  if (open > out.lastIndexOf(')')) out = out.slice(0, open)

  return out
}

/**
 * Reveal already-received text progressively.
 *
 * The backend sends the finished report in one `done` event rather than token
 * by token, so there is nothing to stream in the literal sense. This paces the
 * reveal so a long report lands like a stream instead of a wall of text.
 *
 * The step size is derived from the text length against a fixed time budget,
 * so a 500-character summary and a 20,000-character report both finish in
 * about the same time — a fixed chars-per-tick made long reports crawl. Ticks
 * are timer-driven rather than per-frame because each one re-renders the whole
 * markdown tree.
 */
export function useTypewriter(text: string, enabled: boolean) {
  const reduced = useReducedMotion()
  const [revealed, setRevealed] = useState(enabled && !reduced ? '' : text)

  useEffect(() => {
    if (!enabled || reduced || !text) {
      setRevealed(text)
      return
    }

    const steps = Math.max(1, Math.round(BUDGET_MS / TICK_MS))
    const chunk = Math.max(1, Math.ceil(text.length / steps))
    let index = 0

    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + chunk)
      if (index >= text.length) {
        setRevealed(text)
        window.clearInterval(timer)
        return
      }
      // Land on a word boundary so words do not appear letter by letter.
      const boundary = text.indexOf(' ', index)
      const cut = boundary === -1 ? index : Math.min(boundary, index + 24)
      setRevealed(trimPartialMarkdown(text.slice(0, cut)))
    }, TICK_MS)

    setRevealed('')
    return () => window.clearInterval(timer)
  }, [text, enabled, reduced])

  return { revealed, isTyping: revealed.length < text.length }
}
