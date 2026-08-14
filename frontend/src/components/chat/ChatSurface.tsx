import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { Message } from './Message'
import { Composer } from './Composer'
import { WelcomeScreen } from './WelcomeScreen'
import { useResearchStore } from '@/store/researchStore'
import { useAutoScroll } from '@/hooks/useAutoScroll'

/** The centre column: transcript above, composer docked below. */
export function ChatSurface() {
  const conversation = useResearchStore((s) => s.activeConversation())
  const messages = conversation?.messages ?? []
  const status = useResearchStore((s) => s.status)

  // Re-pin on new messages and while the last one is still streaming.
  const scrollKey = `${messages.length}:${messages.at(-1)?.content.length ?? 0}`
  const { ref, showJump, scrollToBottom } = useAutoScroll<HTMLDivElement>(scrollKey)

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div ref={ref} className="min-h-0 flex-1 overflow-y-auto" aria-live="polite" aria-busy={status === 'running'}>
        {messages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center">
            <WelcomeScreen />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
            {messages.map((message) => (
              <Message key={message.id} message={message} title={conversation?.title ?? 'Research report'} />
            ))}
            {/* Breathing room so the last message clears the composer. */}
            <div className="h-4" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-[168px] left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-hairline bg-surface-raised/90 text-ink-muted shadow-float backdrop-blur-xl transition-colors hover:text-ink"
            aria-label="Jump to latest"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <Composer />
        </div>
      </div>
    </div>
  )
}
