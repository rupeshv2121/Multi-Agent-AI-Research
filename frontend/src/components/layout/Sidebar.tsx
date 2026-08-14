import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  ChevronsLeft,
  LayoutDashboard,
  Library,
  MessageSquarePlus,
  MoreHorizontal,
  Pin,
  PinOff,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/common/Logo'
import { Tooltip } from '@/components/common/Tooltip'
import { useUIStore } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { bucketByRecency, formatRelative } from '@/utils/format'
import type { Conversation } from '@/types'

const NAV_ITEMS = [
  { to: '/app', label: 'Research', icon: Sparkles, end: true },
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/library', label: 'Library', icon: Library },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  const conversations = useResearchStore((s) => s.conversations)
  const activeId = useResearchStore((s) => s.activeId)
  const status = useResearchStore((s) => s.status)
  const newConversation = useResearchStore((s) => s.newConversation)
  const selectConversation = useResearchStore((s) => s.selectConversation)

  const navigate = useNavigate()
  const reduced = useReducedMotion()

  const { pinned, grouped } = useMemo(() => {
    const pinnedList = conversations.filter((c) => c.pinned)
    const rest = conversations.filter((c) => !c.pinned)
    const groups = new Map<string, Conversation[]>()
    for (const conversation of rest) {
      const bucket = bucketByRecency(conversation.updatedAt)
      groups.set(bucket, [...(groups.get(bucket) ?? []), conversation])
    }
    return { pinned: pinnedList, grouped: [...groups.entries()] }
  }, [conversations])

  const handleNew = () => {
    newConversation()
    navigate('/app')
    onNavigate?.()
  }

  const handleSelect = (id: string) => {
    selectConversation(id)
    navigate('/app')
    onNavigate?.()
  }

  return (
    <motion.aside
      className="relative z-20 flex h-full flex-col border-r border-hairline bg-surface-sunken/80 backdrop-blur-2xl"
      animate={{ width: collapsed ? 76 : 288 }}
      initial={false}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
      aria-label="Primary navigation"
    >
      {/* Brand — links back to the landing page */}
      <div className="flex h-16 items-center gap-3 px-4">
        <Link to="/" aria-label="Back to home" className="shrink-0">
          <Logo />
        </Link>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="min-w-0 flex-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.16 }}
            >
              <Link to="/" className="block">
                <p className="truncate text-sm font-semibold leading-tight">Multi-Agent</p>
                <p className="truncate text-[11px] leading-tight text-ink-muted">AI Research</p>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        {!collapsed && (
          <Tooltip label="Collapse sidebar  ⌘B" side="right">
            <button
              onClick={toggleSidebar}
              className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Primary actions */}
      <div className="space-y-1.5 px-3">
        <button
          onClick={handleNew}
          className={cn(
            'gradient-border group relative flex w-full items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5',
            'text-sm font-medium transition-colors hover:bg-white/[0.08]',
            collapsed && 'justify-center px-0',
          )}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0 text-accent-blue transition-transform group-hover:scale-110" />
          {!collapsed && <span className="flex-1 text-left">New research</span>}
          {!collapsed && <kbd className="text-[10px] text-ink-faint">⌘⇧O</kbd>}
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted',
            'transition-colors hover:bg-white/[0.05] hover:text-ink',
            collapsed && 'justify-center px-0',
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Search</span>}
          {!collapsed && <kbd className="text-[10px] text-ink-faint">⌘/</kbd>}
        </button>
      </div>

      {/* Sections */}
      <nav className="mt-4 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* History */}
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-2 scrollbar-none">
        {collapsed ? null : conversations.length === 0 ? (
          <p className="px-2 py-4 text-[11px] leading-relaxed text-ink-faint">
            Your research history will appear here. Nothing is sent anywhere — it is stored in this
            browser only.
          </p>
        ) : (
          <>
            {pinned.length > 0 && (
              <HistoryGroup
                label="Pinned"
                conversations={pinned}
                activeId={activeId}
                busy={status === 'running'}
                onSelect={handleSelect}
              />
            )}
            {grouped.map(([label, items]) => (
              <HistoryGroup
                key={label}
                label={label}
                conversations={items}
                activeId={activeId}
                busy={status === 'running'}
                onSelect={handleSelect}
              />
            ))}
          </>
        )}
      </div>

      {/* Profile */}
      <div className="border-t border-hairline p-3">
        <button
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05]',
            collapsed && 'justify-center px-0',
          )}
          aria-label="Account"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-accent text-xs font-semibold">
            R
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-xs font-medium">Researcher</span>
              <span className="block truncate text-[10px] text-ink-faint">Local workspace</span>
            </span>
          )}
          {!collapsed && <MoreHorizontal className="h-4 w-4 shrink-0 text-ink-faint" />}
        </button>
      </div>

      {/* Expand affordance when collapsed */}
      {collapsed && (
        <Tooltip label="Expand sidebar  ⌘B" side="right">
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 grid h-6 w-6 place-items-center rounded-full border border-hairline bg-surface-raised text-ink-faint transition-colors hover:text-ink"
            aria-label="Expand sidebar"
          >
            <ChevronsLeft className="h-3 w-3 rotate-180" />
          </button>
        </Tooltip>
      )}
    </motion.aside>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
  onNavigate,
}: {
  to: string
  label: string
  icon: typeof Sparkles
  end?: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const content = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
          collapsed && 'justify-center px-0',
          isActive ? 'text-ink' : 'text-ink-muted hover:bg-white/[0.05] hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-xl border border-accent-blue/25 bg-accent-blue/[0.12] shadow-glow-blue"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon className={cn('relative h-4 w-4 shrink-0', isActive && 'text-accent-blue')} />
          {!collapsed && <span className="relative">{label}</span>}
        </>
      )}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip label={label} side="right">
      <span className="block w-full">{content}</span>
    </Tooltip>
  ) : (
    content
  )
}

function HistoryGroup({
  label,
  conversations,
  activeId,
  busy,
  onSelect,
}: {
  label: string
  conversations: Conversation[]
  activeId: string | null
  busy: boolean
  onSelect: (id: string) => void
}) {
  return (
    <div className="mb-3">
      <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {conversations.map((conversation) => (
            <HistoryRow
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              busy={busy}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function HistoryRow({
  conversation,
  active,
  busy,
  onSelect,
}: {
  conversation: Conversation
  active: boolean
  busy: boolean
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const togglePin = useResearchStore((s) => s.togglePin)
  const toggleBookmark = useResearchStore((s) => s.toggleBookmark)
  const deleteConversation = useResearchStore((s) => s.deleteConversation)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex items-center gap-1.5 rounded-lg pr-1 transition-colors',
        active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
      )}
    >
      {active && (
        <motion.span
          layoutId="history-active"
          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-blue"
        />
      )}
      <button
        onClick={() => onSelect(conversation.id)}
        // Switching away mid-run would orphan the live stream, so history is
        // read-only until the current run settles.
        disabled={busy && !active}
        className="min-w-0 flex-1 px-2.5 py-2 text-left disabled:cursor-not-allowed disabled:opacity-40"
        title={conversation.title}
      >
        <span className={cn('block truncate text-[13px]', active ? 'text-ink' : 'text-ink-muted')}>
          {conversation.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-faint">
          {formatRelative(conversation.updatedAt)}
          {conversation.sourceCount > 0 && <>· {conversation.sourceCount} sources</>}
          {conversation.status === 'error' && <span className="text-accent-rose">· failed</span>}
        </span>
      </button>

      <AnimatePresence>
        {(hovered || conversation.pinned || conversation.bookmarked) && (
          <motion.span
            className="flex shrink-0 items-center gap-0.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <RowAction
              label={conversation.pinned ? 'Unpin' : 'Pin'}
              onClick={() => togglePin(conversation.id)}
              active={conversation.pinned}
            >
              {conversation.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </RowAction>
            <RowAction
              label={conversation.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              onClick={() => toggleBookmark(conversation.id)}
              active={conversation.bookmarked}
            >
              <Bookmark className={cn('h-3 w-3', conversation.bookmarked && 'fill-current')} />
            </RowAction>
            <RowAction label="Delete" onClick={() => deleteConversation(conversation.id)} danger>
              <Trash2 className="h-3 w-3" />
            </RowAction>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function RowAction({
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
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-6 w-6 place-items-center rounded-md transition-colors',
        danger ? 'text-ink-faint hover:bg-accent-rose/15 hover:text-accent-rose' : 'text-ink-faint hover:bg-white/10 hover:text-ink',
        active && !danger && 'text-accent-blue',
      )}
    >
      {children}
    </button>
  )
}
