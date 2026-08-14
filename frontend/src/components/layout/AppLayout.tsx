import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Drawer } from './Drawer'
import { AgentPanel } from '@/components/agents/AgentPanel'
import { CommandPalette } from '@/components/common/CommandPalette'
import { GlobalSearch } from '@/components/common/GlobalSearch'
import { AuroraBackground } from '@/components/common/AuroraBackground'
import { CursorGlow } from '@/components/common/CursorGlow'
import { useUIStore } from '@/store/uiStore'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { pageTransition } from '@/animations/variants'

export function AppLayout() {
  const location = useLocation()
  const isDesktop = useIsDesktop()
  const reduced = useReducedMotion()

  const agentPanelOpen = useUIStore((s) => s.agentPanelOpen)
  const agentPanelWidth = useUIStore((s) => s.agentPanelWidth)
  const setAgentPanelWidth = useUIStore((s) => s.setAgentPanelWidth)
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const mobileAgentDrawerOpen = useUIStore((s) => s.mobileAgentDrawerOpen)
  const setMobileAgentDrawerOpen = useUIStore((s) => s.setMobileAgentDrawerOpen)

  useKeyboardShortcuts()

  // The agent panel is only meaningful on the research view.
  const showAgentPanel = location.pathname === '/app'

  const dragging = useRef(false)

  const startResize = useCallback(() => {
    dragging.current = true
    // Suppress text selection and pointer flicker for the duration of the drag.
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return
      setAgentPanelWidth(window.innerWidth - event.clientX)
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [setAgentPanelWidth])

  // The shell owns the viewport for as long as it is mounted; the landing page
  // needs the document to scroll normally, so this is scoped rather than global.
  useEffect(() => {
    document.body.classList.add('app-shell')
    return () => document.body.classList.remove('app-shell')
  }, [])

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AuroraBackground />
      <CursorGlow />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface-raised focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      {/* Sidebar: resident on desktop, drawer below lg */}
      {isDesktop ? (
        <Sidebar />
      ) : (
        <Drawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} label="Navigation">
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </Drawer>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar />

        <div className="flex min-h-0 flex-1">
          <main id="main" className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={reduced ? undefined : pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Agent panel: resident on desktop, drawer below lg */}
          {isDesktop && showAgentPanel && (
            <AnimatePresence initial={false}>
              {agentPanelOpen && (
                <motion.div
                  className="relative shrink-0 border-l border-hairline"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: agentPanelWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32 }}
                >
                  {/* Resize handle */}
                  <div
                    onPointerDown={startResize}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize agent panel"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') setAgentPanelWidth(agentPanelWidth + 24)
                      if (event.key === 'ArrowRight') setAgentPanelWidth(agentPanelWidth - 24)
                    }}
                    className="absolute -left-1 top-0 z-20 h-full w-2 cursor-col-resize transition-colors hover:bg-accent-primary/30"
                  />
                  <AgentPanel className="h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {!isDesktop && showAgentPanel && (
        <Drawer
          open={mobileAgentDrawerOpen}
          onClose={() => setMobileAgentDrawerOpen(false)}
          side="right"
          label="Agent activity"
        >
          <AgentPanel className="h-full" />
        </Drawer>
      )}

      <CommandPalette />
      <GlobalSearch />
    </div>
  )
}
