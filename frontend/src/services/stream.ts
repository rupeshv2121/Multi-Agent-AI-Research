import type { ResearchEvent } from '@/types'
import { streamUrl } from './research'

interface StreamHandlers {
  onEvent: (event: ResearchEvent) => void
  /** Called once the server sends `eof` or the connection is given up on. */
  onClose?: (reason: 'eof' | 'error' | 'aborted') => void
  onError?: (message: string) => void
}

/**
 * Follow a run's SSE feed.
 *
 * The backend replays every event it has already emitted on connect, so a late
 * or reconnecting client never misses a step — which means we can reconnect
 * freely without deduping, as long as consumers apply events idempotently
 * (the store keys agents by id and replaces state rather than appending).
 *
 * Returns a disposer; call it to stop following.
 */
export function subscribeToResearch(jobId: string, handlers: StreamHandlers): () => void {
  let source: EventSource | null = null
  let closed = false
  let retries = 0

  const connect = () => {
    if (closed) return
    source = new EventSource(streamUrl(jobId))

    source.onmessage = (message) => {
      let parsed: ResearchEvent
      try {
        parsed = JSON.parse(message.data) as ResearchEvent
      } catch {
        return // keep-alive comments never reach onmessage, but be safe
      }

      if (parsed.type === 'eof') {
        closed = true
        source?.close()
        handlers.onClose?.('eof')
        return
      }

      retries = 0
      handlers.onEvent(parsed)
    }

    source.onerror = () => {
      source?.close()
      if (closed) return

      // EventSource fires onerror on normal server close too, so treat the
      // first few as transient and let the replay-on-connect rebuild state.
      if (retries < 3) {
        retries += 1
        setTimeout(connect, 500 * retries)
        return
      }

      closed = true
      handlers.onError?.('Lost connection to the research stream.')
      handlers.onClose?.('error')
    }
  }

  connect()

  return () => {
    if (closed) return
    closed = true
    source?.close()
    handlers.onClose?.('aborted')
  }
}
