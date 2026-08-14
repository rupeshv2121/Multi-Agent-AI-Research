import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'

/**
 * True only for rich-text targets, where ⌘B/⌘J are the browser's own editing
 * commands. Plain inputs and textareas do not claim those keys — and since the
 * composer holds focus most of the time, treating them as "editing" would mean
 * the layout shortcuts almost never fired.
 */
function isRichTextEditing(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  return element?.isContentEditable ?? false
}

/**
 * Global shortcuts. Registered once from the layout.
 *
 *   ⌘/Ctrl+K   command palette
 *   ⌘/Ctrl+/   global search
 *   ⌘/Ctrl+B   toggle sidebar
 *   ⌘/Ctrl+J   toggle agent panel
 *   ⌘/Ctrl+⇧+O new research
 *   Esc        close overlays
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      const ui = useUIStore.getState()

      if (event.key === 'Escape') {
        if (ui.commandPaletteOpen) ui.setCommandPaletteOpen(false)
        if (ui.searchOpen) ui.setSearchOpen(false)
        if (ui.mobileSidebarOpen) ui.setMobileSidebarOpen(false)
        if (ui.mobileAgentDrawerOpen) ui.setMobileAgentDrawerOpen(false)
        return
      }

      if (!meta) return

      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          ui.setCommandPaletteOpen(!ui.commandPaletteOpen)
          break
        case '/':
          event.preventDefault()
          ui.setSearchOpen(true)
          break
        case 'b':
          if (isRichTextEditing(event.target)) return
          event.preventDefault()
          ui.toggleSidebar()
          break
        case 'j':
          if (isRichTextEditing(event.target)) return
          event.preventDefault()
          ui.toggleAgentPanel()
          break
        case 'o':
          if (!event.shiftKey) return
          event.preventDefault()
          useResearchStore.getState().newConversation()
          navigate('/app')
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}
