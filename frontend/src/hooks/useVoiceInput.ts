import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Dictation via the Web Speech API.
 *
 * This is a browser capability, not a backend one — it works in Chrome and
 * Safari and is simply unavailable elsewhere, which the composer reflects by
 * disabling the button rather than hiding it.
 */

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type RecognitionConstructor = new () => SpeechRecognitionLike

function getRecognition(): RecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recognition = useRef<SpeechRecognitionLike | null>(null)
  // Keep the latest callback without re-creating the recogniser each render.
  const callback = useRef(onTranscript)
  callback.current = onTranscript

  const supported = typeof window !== 'undefined' && !!getRecognition()

  useEffect(() => {
    const Recognition = getRecognition()
    if (!Recognition) return

    const instance = new Recognition()
    instance.lang = navigator.language || 'en-US'
    instance.continuous = false
    instance.interimResults = false

    instance.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript)
        .join(' ')
        .trim()
      if (transcript) callback.current(transcript)
    }

    instance.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') toast.error('Microphone access was denied.')
      else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error('Dictation failed. Try again.')
      }
    }

    instance.onend = () => setListening(false)
    recognition.current = instance

    return () => {
      instance.onresult = null
      instance.onerror = null
      instance.onend = null
      try {
        instance.stop()
      } catch {
        // Already stopped.
      }
    }
  }, [])

  const toggle = useCallback(() => {
    const instance = recognition.current
    if (!instance) return

    if (listening) {
      instance.stop()
      setListening(false)
      return
    }

    try {
      instance.start()
      setListening(true)
    } catch {
      // start() throws if called while already running; treat as a no-op.
    }
  }, [listening])

  return { listening, supported, toggle }
}
