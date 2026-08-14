import { create } from 'zustand'
import { DEFAULT_PREFS, loadPrefs, savePrefs, type Prefs } from '@/services/storage'

export type AccentPreset = Prefs['accent']

interface UIStore extends Prefs {
  commandPaletteOpen: boolean
  searchOpen: boolean
  mobileSidebarOpen: boolean
  mobileAgentDrawerOpen: boolean
  /** Width of the agent panel in px, adjustable by dragging its edge. */
  agentPanelWidth: number

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleAgentPanel: () => void
  setAgentPanelWidth: (width: number) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setMobileAgentDrawerOpen: (open: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  setAccent: (accent: AccentPreset) => void
}

const stored = loadPrefs()

export const useUIStore = create<UIStore>((set) => ({
  ...DEFAULT_PREFS,
  ...stored,

  commandPaletteOpen: false,
  searchOpen: false,
  mobileSidebarOpen: false,
  mobileAgentDrawerOpen: false,
  agentPanelWidth: 380,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleAgentPanel: () => set((s) => ({ agentPanelOpen: !s.agentPanelOpen })),
  setAgentPanelWidth: (width) => set({ agentPanelWidth: Math.min(560, Math.max(300, width)) }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  setMobileAgentDrawerOpen: (mobileAgentDrawerOpen) => set({ mobileAgentDrawerOpen }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setAccent: (accent) => set({ accent }),
}))

// Mirror the persistable slice back to localStorage.
useUIStore.subscribe((state) => {
  savePrefs({
    sidebarCollapsed: state.sidebarCollapsed,
    agentPanelOpen: state.agentPanelOpen,
    reducedMotion: state.reducedMotion,
    accent: state.accent,
  })
})
