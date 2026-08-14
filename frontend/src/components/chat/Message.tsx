import { motion } from 'framer-motion'
import { AlertCircle, Sparkles, User } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'
import { ReportSkeleton } from '@/components/common/Skeleton'
import { TypingDots } from '@/components/common/TypingDots'
import { CriticReview } from '@/components/research/CriticReview'
import { RunInsights } from '@/components/research/RunInsights'
import { SourcesList } from '@/components/research/SourcesList'
import { useTypewriter } from '@/hooks/useTypewriter'
import { formatTime } from '@/utils/format'
import { useResearchStore } from '@/store/researchStore'
import type { ChatMessage } from '@/types'

interface MessageProps {
  message: ChatMessage
  title: string
}

export function Message({ message, title }: MessageProps) {
  if (message.role === 'user') return <UserMessage message={message} />
  if (message.role === 'system') return <SystemMessage message={message} />
  return <AssistantMessage message={message} title={title} />
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex justify-end gap-3"
    >
      <div className="max-w-[min(80%,640px)]">
        <div className="gradient-border rounded-2xl rounded-br-md bg-white/[0.06] px-4 py-3 backdrop-blur-xl">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        </div>
        <p className="mt-1.5 pr-1 text-right text-[10px] text-ink-faint">{formatTime(message.createdAt)}</p>
      </div>

      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-white/[0.05]">
        <User className="h-3.5 w-3.5 text-ink-muted" />
      </span>
    </motion.div>
  )
}

function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-accent-rose/25 bg-accent-rose/[0.07] p-4"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-rose" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-accent-rose">The run could not complete</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{message.content}</p>
      </div>
    </motion.div>
  )
}

function AssistantMessage({ message, title }: MessageProps) {
  const liveAgents = useResearchStore((s) => s.agents)
  const phase = useResearchStore((s) => s.currentPhase())
  // Prefer the roster snapshot saved with the report, so a run reopened from
  // history keeps its timings instead of showing the idle live roster.
  const agents = message.report?.agents ?? liveAgents
  const streaming = !!message.streaming

  // Paces the reveal of the finished report; see the hook for why this is not
  // a token stream.
  const { revealed, isTyping } = useTypewriter(message.content, true)

  const sources = message.report?.sources ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex gap-3"
    >
      <Logo className="mt-0.5 h-8 w-8 shrink-0" animated={streaming} />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[13px] font-semibold">Research report</span>
          <span className="text-[10px] text-ink-faint">{formatTime(message.createdAt)}</span>
        </div>

        {streaming && !message.content ? (
          <div className="glass p-5">
            <div className="mb-4 flex items-center gap-2 text-[13px] text-accent-blue">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{phase}</span>
              <TypingDots className="ml-1" />
            </div>
            <ReportSkeleton />
          </div>
        ) : (
          <>
            <article className="glass relative overflow-hidden p-5 sm:p-7">
              {/* Document header rail */}
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" aria-hidden />

              <Markdown content={revealed} />

              {isTyping && (
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-caret-blink bg-accent-blue align-middle" aria-hidden />
              )}
            </article>

            {!isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {message.report && (
                  <>
                    <RunInsights agents={agents} sources={sources} />

                    {sources.length > 0 && (
                      <section className="mt-6">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                          References
                          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] tabular-nums text-ink-muted">
                            {sources.length}
                          </span>
                        </h3>
                        <SourcesList sources={sources} />
                      </section>
                    )}

                    <CriticReview feedback={message.report.feedback} score={message.report.score} />
                  </>
                )}

                <MessageActions message={message} title={title} className="mt-4" />
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
