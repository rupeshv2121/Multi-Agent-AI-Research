import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bookmark,
  Download,
  LayoutDashboard,
  Library,
  MessageSquarePlus,
  PanelLeft,
  PanelRight,
  Search,
  Settings,
  Sparkles,
  Square,
  Zap,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'
import { exportMarkdown } from '@/utils/export'
import { toast } from 'sonner'

/**
 * ⌘K palette. Actions are filtered to what is actually available right now —
 * "Stop run" only appears mid-run, "Export" only with a finished report — so
 * the list never offers something that would no-op.
 */
export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleAgentPanel = useUIStore((s) => s.toggleAgentPanel)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  const newConversation = useResearchStore((s) => s.newConversation)
  const cancel = useResearchStore((s) => s.cancel)
  const regenerate = useResearchStore((s) => s.regenerate)
  const status = useResearchStore((s) => s.status)
  const conversation = useResearchStore((s) => s.activeConversation())
  const toggleBookmark = useResearchStore((s) => s.toggleBookmark)

  const navigate = useNavigate()
  const running = status === 'running'
  const report = conversation?.messages.find((m) => m.report)

  const run = (action: () => void) => {
    setOpen(false)
    // Defer so the exit animation is not competing with a route change.
    window.setTimeout(action, 60)
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
            className="fixed left-1/2 top-[18vh] z-[61] w-[min(92vw,600px)] -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <Command
              label="Command palette"
              className="glass-strong overflow-hidden shadow-lift"
              loop
            >
              <div className="flex items-center gap-2.5 border-b border-hairline px-4">
                <Search className="h-4 w-4 shrink-0 text-ink-faint" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command…"
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
                />
                <kbd className="rounded border border-hairline px-1.5 py-0.5 text-[10px] text-ink-faint">Esc</kbd>
              </div>

              <Command.List className="max-h-[min(60vh,400px)] overflow-y-auto p-2 scrollbar-none">
                <Command.Empty className="py-8 text-center text-sm text-ink-faint">
                  No matching commands.
                </Command.Empty>

                <Group heading="Research">
                  <Item
                    icon={MessageSquarePlus}
                    label="New research"
                    shortcut="⌘⇧O"
                    onSelect={() =>
                      run(() => {
                        newConversation()
                        navigate('/')
                      })
                    }
                  />
                  {running && (
                    <Item
                      icon={Square}
                      label="Stop following this run"
                      onSelect={() => run(cancel)}
                    />
                  )}
                  {conversation && !running && (
                    <Item icon={Zap} label="Run this research again" onSelect={() => run(() => void regenerate())} />
                  )}
                  {report && (
                    <Item
                      icon={Download}
                      label="Export report as Markdown"
                      onSelect={() =>
                        run(() => {
                          exportMarkdown({
                            title: conversation?.title ?? 'Research report',
                            report: report.content,
                            feedback: report.report?.feedback,
                            score: report.report?.score,
                            sources: report.report?.sources,
                            createdAt: report.createdAt,
                          })
                          toast.success('Markdown downloaded')
                        })
                      }
                    />
                  )}
                  {conversation && (
                    <Item
                      icon={Bookmark}
                      label={conversation.bookmarked ? 'Remove bookmark' : 'Bookmark this research'}
                      onSelect={() => run(() => toggleBookmark(conversation.id))}
                    />
                  )}
                </Group>

                <Group heading="Navigate">
                  <Item icon={Sparkles} label="Go to Research" onSelect={() => run(() => navigate('/'))} />
                  <Item icon={LayoutDashboard} label="Go to Dashboard" onSelect={() => run(() => navigate('/dashboard'))} />
                  <Item icon={Library} label="Go to Library" onSelect={() => run(() => navigate('/library'))} />
                  <Item icon={Settings} label="Go to Settings" onSelect={() => run(() => navigate('/settings'))} />
                  <Item icon={Search} label="Search history" shortcut="⌘/" onSelect={() => run(() => setSearchOpen(true))} />
                </Group>

                <Group heading="View">
                  <Item icon={PanelLeft} label="Toggle sidebar" shortcut="⌘B" onSelect={() => run(toggleSidebar)} />
                  <Item icon={PanelRight} label="Toggle agent panel" shortcut="⌘J" onSelect={() => run(toggleAgentPanel)} />
                </Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint"
    >
      {children}
    </Command.Group>
  )
}

function Item({
  icon: Icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: typeof Search
  label: string
  shortcut?: string
  onSelect: () => void
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted transition-colors data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-ink"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {shortcut && <kbd className="text-[10px] text-ink-faint">{shortcut}</kbd>}
    </Command.Item>
  )
}
