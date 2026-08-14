import type { Conversation } from '@/types'

/**
 * Conversation history lives in the browser.
 *
 * server.py keeps jobs in an in-process dict with no history endpoint and no
 * persistence across restarts, so there is nothing to fetch. Everything the
 * sidebar and dashboard show is rebuilt from what this client recorded. Swap
 * this module for HTTP calls if a `/api/history` endpoint is ever added.
 */

const KEY = 'mars.conversations.v1'
const PREFS_KEY = 'mars.prefs.v1'

export interface Prefs {
  sidebarCollapsed: boolean
  agentPanelOpen: boolean
  reducedMotion: boolean
  accent: 'blue' | 'purple' | 'cyan' | 'emerald'
}

export const DEFAULT_PREFS: Prefs = {
  sidebarCollapsed: false,
  agentPanelOpen: true,
  reducedMotion: false,
  accent: 'blue',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or private mode — history is a convenience, never block on it.
  }
}

export function loadConversations(): Conversation[] {
  return read<Conversation[]>(KEY, [])
}

export function saveConversations(conversations: Conversation[]) {
  // Cap the log so a long-lived tab cannot fill the origin's quota.
  write(KEY, conversations.slice(0, 200))
}

export function loadPrefs(): Prefs {
  return { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(PREFS_KEY, {}) }
}

export function savePrefs(prefs: Prefs) {
  write(PREFS_KEY, prefs)
}
