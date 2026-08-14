import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Pin, Search, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Conversation } from '@/types'

/**
 * Full-text search across stored conversations — titles, topics and report
 * bodies. Everything searched is local, so this needs no backend endpoint.
 */
export function GlobalSearch() {
  const open = useUIStore((s) => s.searchOpen)
  const setOpen = useUIStore((s) => s.setSearchOpen)
  const conversations = useResearchStore((s) => s.conversations)
  const selectConversation = useResearchStore((s) => s.selectConversation)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')

  const results = useMemo((): Array<{ conversation: Conversation; snippet?: string }> => {
    const needle = query.trim().toLowerCase()
    if (!needle) return conversations.slice(0, 8).map((conversation) => ({ conversation }))

    return conversations
      .map((conversation) => {
        const haystack = [
          conversation.title,
          conversation.topic,
          ...conversation.messages.map((m) => m.content),
        ]
          .join('\n')
          .toLowerCase()

        const index = haystack.indexOf(needle)
        if (index === -1) return null

        // A window of surrounding text, so the match is shown in context.
        const snippet = haystack.slice(Math.max(0, index - 60), index + 120).trim()
        return { conversation, snippet }
      })
      .filter((match): match is { conversation: Conversation; snippet: string } => match !== null)
      .slice(0, 12)
  }, [query, conversations])

  const openConversation = (id: string) => {
    selectConversation(id)
    navigate('/')
    setOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search research history"
            className="glass-strong fixed left-1/2 top-[15vh] z-[61] w-[min(92vw,640px)] -translate-x-1/2 overflow-hidden shadow-lift"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-2.5 border-b border-hairline px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, topics and report text…"
                aria-label="Search query"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="grid h-6 w-6 place-items-center rounded text-ink-faint hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2 scrollbar-none">
              {results.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-faint">
                  {conversations.length === 0
                    ? 'No research history yet.'
                    : `Nothing matches “${query}”.`}
                </p>
              ) : (
                results.map(({ conversation: item, snippet }) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => openConversation(item.id)}
                      className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-medium">{item.title}</span>
                          {item.pinned && <Pin className="h-2.5 w-2.5 shrink-0 text-accent-blue" />}
                        </span>
                        {snippet && (
                          <span className="mt-0.5 block line-clamp-2 text-[11px] leading-relaxed text-ink-faint">
                            …{snippet}…
                          </span>
                        )}
                        <span className={cn('mt-1 block text-[10px] text-ink-faint/70')}>
                          {formatRelative(item.updatedAt)} · {item.sourceCount} sources
                        </span>
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
