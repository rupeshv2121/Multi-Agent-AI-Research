import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, Download, Library, Pin, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useResearchStore } from '@/store/researchStore'
import { exportMarkdown } from '@/utils/export'
import { formatDuration, formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import { stagger, fadeUp } from '@/animations/variants'
import { toast } from 'sonner'

type Filter = 'all' | 'bookmarked' | 'pinned' | 'complete'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'bookmarked', label: 'Bookmarked' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'complete', label: 'Completed' },
]

/** Saved research: everything this browser has recorded, filterable. */
export default function LibraryPage() {
  const conversations = useResearchStore((s) => s.conversations)
  const selectConversation = useResearchStore((s) => s.selectConversation)
  const deleteConversation = useResearchStore((s) => s.deleteConversation)
  const toggleBookmark = useResearchStore((s) => s.toggleBookmark)
  const togglePin = useResearchStore((s) => s.togglePin)
  const navigate = useNavigate()

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return conversations
      .filter((conversation) => {
        if (filter === 'bookmarked' && !conversation.bookmarked) return false
        if (filter === 'pinned' && !conversation.pinned) return false
        if (filter === 'complete' && conversation.status !== 'complete') return false
        if (needle && !`${conversation.title} ${conversation.topic}`.toLowerCase().includes(needle)) return false
        return true
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
  }, [conversations, filter, query])

  const open = (id: string) => {
    selectConversation(id)
    navigate('/')
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Saved research, stored in this browser. Nothing here is uploaded anywhere.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface/60 px-3 backdrop-blur-xl">
            <Search className="h-3.5 w-3.5 text-ink-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by title or topic"
              aria-label="Filter research"
              className="h-9 w-52 bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="flex gap-1 rounded-xl border border-hairline bg-surface/60 p-1 backdrop-blur-xl">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === option.id ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                {filter === option.id && (
                  <motion.span
                    layoutId="library-filter"
                    className="absolute inset-0 rounded-lg bg-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Library}
            title={conversations.length === 0 ? 'Nothing saved yet' : 'No matches'}
            description={
              conversations.length === 0
                ? 'Completed research runs are saved here automatically.'
                : 'Try a different filter or search term.'
            }
            action={
              conversations.length === 0 ? (
                <Link to="/">
                  <Button variant="primary" size="sm" magnetic className="mt-2">
                    Start researching
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <motion.div variants={stagger(0.04)} className="grid gap-3 sm:grid-cols-2">
            {visible.map((conversation) => {
              const report = conversation.messages.find((m) => m.report)
              return (
                <motion.div key={conversation.id} variants={fadeUp}>
                  <Card interactive spotlight className="flex h-full flex-col p-4">
                    <button onClick={() => open(conversation.id)} className="flex-1 text-left">
                      <div className="flex items-start gap-2">
                        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug">{conversation.title}</h3>
                        {conversation.pinned && <Pin className="mt-0.5 h-3 w-3 shrink-0 text-accent-blue" />}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                        {conversation.topic}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-faint">
                        <span>{formatRelative(conversation.updatedAt)}</span>
                        <span>{conversation.sourceCount} sources</span>
                        {conversation.elapsed != null && <span>{formatDuration(conversation.elapsed)}</span>}
                        {conversation.score != null && (
                          <span className="text-accent-emerald">{conversation.score}/10</span>
                        )}
                        {conversation.status === 'error' && <span className="text-accent-rose">failed</span>}
                      </div>
                    </button>

                    <div className="mt-3 flex items-center gap-1 border-t border-hairline pt-3">
                      <IconAction
                        label={conversation.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                        onClick={() => toggleBookmark(conversation.id)}
                        active={conversation.bookmarked}
                      >
                        <Bookmark className={cn('h-3.5 w-3.5', conversation.bookmarked && 'fill-current')} />
                      </IconAction>
                      <IconAction
                        label={conversation.pinned ? 'Unpin' : 'Pin'}
                        onClick={() => togglePin(conversation.id)}
                        active={conversation.pinned}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </IconAction>
                      {report && (
                        <IconAction
                          label="Export as Markdown"
                          onClick={() => {
                            exportMarkdown({
                              title: conversation.title,
                              report: report.content,
                              feedback: report.report?.feedback,
                              score: report.report?.score,
                              sources: report.report?.sources,
                              createdAt: conversation.createdAt,
                            })
                            toast.success('Markdown downloaded')
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </IconAction>
                      )}
                      <span className="flex-1" />
                      <IconAction
                        label="Delete"
                        danger
                        onClick={() => {
                          deleteConversation(conversation.id)
                          toast.success('Removed from library')
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconAction>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function IconAction({
  label,
  onClick,
  children,
  active,
  danger,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-7 w-7 place-items-center rounded-lg transition-colors',
        danger
          ? 'text-ink-faint hover:bg-accent-rose/15 hover:text-accent-rose'
          : 'text-ink-faint hover:bg-white/[0.08] hover:text-ink',
        active && !danger && 'text-accent-blue',
      )}
    >
      {children}
    </button>
  )
}
