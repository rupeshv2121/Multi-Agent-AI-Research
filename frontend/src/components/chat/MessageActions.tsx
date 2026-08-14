import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Tooltip } from '@/components/common/Tooltip'
import { useCopy } from '@/hooks/useCopy'
import { useResearchStore } from '@/store/researchStore'
import { exportMarkdown, exportPdf, exportWord, toMarkdown } from '@/utils/export'
import type { ChatMessage } from '@/types'

interface MessageActionsProps {
  message: ChatMessage
  title: string
  className?: string
}

export function MessageActions({ message, title, className }: MessageActionsProps) {
  const { copied, copy } = useCopy()
  const reactToMessage = useResearchStore((s) => s.reactToMessage)
  const regenerate = useResearchStore((s) => s.regenerate)
  const running = useResearchStore((s) => s.status === 'running')

  const payload = {
    title,
    report: message.content,
    feedback: message.report?.feedback,
    score: message.report?.score,
    sources: message.report?.sources,
    createdAt: message.createdAt,
  }

  const share = async () => {
    const text = toMarkdown(payload)
    // Web Share is the better experience where it exists (mobile, Safari), but
    // it is unavailable in most desktop browsers — fall back to the clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
        return
      } catch {
        return // user dismissed the sheet
      }
    }
    await copy(text, 'Report copied — ready to paste')
  }

  const react = (value: 'like' | 'dislike') => {
    const next = message.reaction === value ? null : value
    reactToMessage(message.id, next)
    if (next) toast.success(next === 'like' ? 'Thanks for the feedback' : 'Noted — marked as unhelpful')
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <ActionButton
        label={copied ? 'Copied' : 'Copy report'}
        icon={copied ? Check : Copy}
        onClick={() => copy(message.content)}
        highlight={copied}
      />

      <ActionButton
        label={running ? 'Wait for the current run to finish' : 'Run this research again'}
        icon={RefreshCw}
        onClick={() => regenerate()}
        disabled={running}
      />

      <ActionButton
        label="Helpful"
        icon={ThumbsUp}
        onClick={() => react('like')}
        highlight={message.reaction === 'like'}
      />
      <ActionButton
        label="Not helpful"
        icon={ThumbsDown}
        onClick={() => react('dislike')}
        highlight={message.reaction === 'dislike'}
      />

      <ActionButton label="Share" icon={Share2} onClick={share} />

      <span className="mx-1 h-4 w-px bg-hairline" aria-hidden />

      <ActionButton label="Export as PDF" icon={FileText} onClick={() => exportPdf(payload)} />
      <ActionButton label="Export as Markdown" icon={Download} onClick={() => exportMarkdown(payload)} />
      <ActionButton
        label="Export as Word"
        icon={FileText}
        onClick={() => {
          exportWord(payload)
          toast.success('Word document downloaded')
        }}
      />
    </div>
  )
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  highlight,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  highlight?: boolean
}) {
  return (
    <Tooltip label={label} side="top">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'grid h-7 w-7 place-items-center rounded-lg transition-colors',
          'text-ink-faint hover:bg-white/[0.08] hover:text-ink',
          'disabled:pointer-events-none disabled:opacity-30',
          highlight && 'bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={String(highlight)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Icon className="h-3.5 w-3.5" />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  )
}
