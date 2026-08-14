import { create } from 'zustand'
import type {
  AgentRuntime,
  AgentStep,
  ChatMessage,
  Conversation,
  JobStatus,
  LogEntry,
  ResearchDepth,
  ResearchEvent,
  SearchMode,
  Source,
} from '@/types'
import { loadConversations, saveConversations } from '@/services/storage'
import { startResearch } from '@/services/research'
import { subscribeToResearch } from '@/services/stream'
import { toMessage } from '@/services/client'

/** Fallback agent roster, replaced by whatever /api/health or `start` reports. */
export const FALLBACK_STEPS: AgentStep[] = [
  { id: 'search', name: 'Scout', role: 'Searches the web for reliable, recent sources' },
  { id: 'read', name: 'Reader', role: 'Opens the best links and extracts the substance' },
  { id: 'write', name: 'Writer', role: 'Synthesises everything into a structured report' },
  { id: 'critique', name: 'Critic', role: 'Scores the report and flags what to improve' },
]

let idSeed = 0
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(idSeed++).toString(36)}`

interface ResearchStore {
  /* ---- roster & run state ---- */
  agents: AgentRuntime[]
  logs: LogEntry[]
  sources: Source[]
  jobId: string | null
  status: JobStatus | 'idle'
  error: string | null
  startedAt: number | null
  finishedAt: number | null

  /* ---- conversation state ---- */
  conversations: Conversation[]
  activeId: string | null

  /* ---- composer settings (client-side; see note in submit) ---- */
  depth: ResearchDepth
  searchMode: SearchMode
  enabledAgents: string[]

  /* ---- actions ---- */
  setRoster: (steps: AgentStep[]) => void
  setDepth: (depth: ResearchDepth) => void
  setSearchMode: (mode: SearchMode) => void
  toggleAgent: (id: string) => void

  submit: (topic: string) => Promise<void>
  cancel: () => void
  regenerate: () => Promise<void>

  selectConversation: (id: string) => void
  newConversation: () => void
  deleteConversation: (id: string) => void
  togglePin: (id: string) => void
  toggleBookmark: (id: string) => void
  renameConversation: (id: string, title: string) => void
  reactToMessage: (messageId: string, reaction: 'like' | 'dislike' | null) => void

  activeConversation: () => Conversation | undefined
  /** 0-100 across the whole run. */
  progress: () => number
  currentPhase: () => string
}

/** Live SSE disposer for the in-flight run, if any. */
let unsubscribe: (() => void) | null = null

const idleAgents = (steps: AgentStep[]): AgentRuntime[] =>
  steps.map((step) => ({ ...step, status: 'idle' as const }))

/**
 * Derive a conversation title from the topic.
 *
 * The backend has no title-generation endpoint, so this is a local cleanup of
 * the query rather than an AI-written title: trim, strip filler openers, cap.
 */
function deriveTitle(topic: string): string {
  const cleaned = topic
    .trim()
    .replace(/^(please\s+)?(can you\s+)?(tell me about|research|find out about|what is|explain)\s+/i, '')
    .replace(/\s+/g, ' ')
  const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return title.length > 60 ? `${title.slice(0, 57)}…` : title || 'Untitled research'
}

export const useResearchStore = create<ResearchStore>((set, get) => ({
  agents: idleAgents(FALLBACK_STEPS),
  logs: [],
  sources: [],
  jobId: null,
  status: 'idle',
  error: null,
  startedAt: null,
  finishedAt: null,

  conversations: loadConversations(),
  activeId: null,

  depth: 'standard',
  searchMode: 'hybrid',
  enabledAgents: FALLBACK_STEPS.map((s) => s.id),

  setRoster: (steps) => {
    if (!steps?.length) return
    set((state) => ({
      // Keep live status if the roster arrives mid-run.
      agents: steps.map((step) => {
        const existing = state.agents.find((a) => a.id === step.id)
        return existing ? { ...existing, ...step } : { ...step, status: 'idle' as const }
      }),
      enabledAgents: steps.map((s) => s.id),
    }))
  },

  setDepth: (depth) => set({ depth }),
  setSearchMode: (searchMode) => set({ searchMode }),
  toggleAgent: (id) =>
    set((state) => ({
      enabledAgents: state.enabledAgents.includes(id)
        ? state.enabledAgents.filter((a) => a !== id)
        : [...state.enabledAgents, id],
    })),

  submit: async (topic) => {
    const trimmed = topic.trim()
    if (!trimmed || get().status === 'running') return

    unsubscribe?.()
    unsubscribe = null

    const now = Date.now()
    const conversationId = get().activeId ?? uid('conv')
    const userMessage: ChatMessage = {
      id: uid('msg'),
      role: 'user',
      content: trimmed,
      createdAt: now,
    }

    // Seed (or extend) the conversation before the request, so the user's own
    // message is on screen immediately even if the POST fails.
    set((state) => {
      const existing = state.conversations.find((c) => c.id === conversationId)
      const conversation: Conversation = existing
        ? {
            ...existing,
            updatedAt: now,
            status: 'running',
            messages: [...existing.messages, userMessage],
          }
        : {
            id: conversationId,
            title: deriveTitle(trimmed),
            topic: trimmed,
            createdAt: now,
            updatedAt: now,
            pinned: false,
            bookmarked: false,
            messages: [userMessage],
            status: 'running',
            sourceCount: 0,
            score: null,
          }

      return {
        activeId: conversationId,
        conversations: [conversation, ...state.conversations.filter((c) => c.id !== conversationId)],
        agents: idleAgents(state.agents),
        logs: [],
        sources: [],
        error: null,
        status: 'running',
        startedAt: now,
        finishedAt: null,
        jobId: null,
      }
    })

    let jobId: string
    try {
      // Note: depth / searchMode / enabledAgents are client-side preferences.
      // POST /api/research accepts only `{topic}`, so they are not sent — they
      // shape the UI (which agents render, how the composer reads) until the
      // backend grows fields for them.
      const response = await startResearch(trimmed)
      jobId = response.job_id
    } catch (error) {
      const message = toMessage(error)
      set((state) => ({
        status: 'error',
        error: message,
        finishedAt: Date.now(),
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                status: 'error' as JobStatus,
                messages: [
                  ...c.messages,
                  { id: uid('msg'), role: 'system', content: message, createdAt: Date.now() },
                ],
              }
            : c,
        ),
      }))
      return
    }

    // Placeholder assistant message that the stream fills in.
    const assistantId = uid('msg')
    set((state) => ({
      jobId,
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              jobId,
              messages: [
                ...c.messages,
                {
                  id: assistantId,
                  role: 'assistant',
                  content: '',
                  createdAt: Date.now(),
                  jobId,
                  streaming: true,
                  reaction: null,
                },
              ],
            }
          : c,
      ),
    }))

    const patchAssistant = (patch: Partial<ChatMessage>) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
              }
            : c,
        ),
      }))

    const patchConversation = (patch: Partial<Conversation>) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, ...patch, updatedAt: Date.now() } : c,
        ),
      }))

    const handleEvent = (event: ResearchEvent) => {
      switch (event.type) {
        case 'start':
          get().setRoster(event.steps)
          break

        case 'step':
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === event.step
                ? {
                    ...agent,
                    status: event.status,
                    duration: event.duration ?? agent.duration,
                    // A `note` only accompanies a retry; clear it once settled.
                    note: event.status === 'running' ? event.note : undefined,
                    error: event.error,
                    startedAt: event.status === 'running' ? (agent.startedAt ?? Date.now()) : agent.startedAt,
                    finishedAt: event.status === 'running' ? undefined : Date.now(),
                  }
                : agent,
            ),
          }))
          break

        case 'log':
          set((state) => ({
            logs: [
              ...state.logs,
              {
                id: uid('log'),
                message: event.message,
                at: Date.now(),
                agentId: state.agents.find((a) => a.status === 'running')?.id,
              },
            ],
          }))
          break

        case 'sources':
          // The pipeline emits this twice; the second is a superset.
          set({ sources: event.sources })
          patchConversation({ sourceCount: event.sources.length })
          break

        case 'done': {
          const { report = '', feedback = '', sources = [], score = null } = event.state
          patchAssistant({
            content: report,
            streaming: false,
            // Snapshot the roster: `agents` is reset when the next run starts.
            report: { sources, feedback, score, agents: get().agents },
          })
          const started = get().startedAt ?? Date.now()
          patchConversation({
            status: 'complete',
            score,
            sourceCount: sources.length,
            elapsed: (Date.now() - started) / 1000,
          })
          set({ status: 'complete', finishedAt: Date.now(), sources })
          break
        }

        case 'error':
          set((state) => ({
            status: 'error',
            error: event.message,
            finishedAt: Date.now(),
            // Mark whatever was mid-flight as failed rather than leaving it spinning.
            agents: state.agents.map((a) =>
              a.status === 'running' ? { ...a, status: 'error' as const, error: event.message } : a,
            ),
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    status: 'error' as JobStatus,
                    updatedAt: Date.now(),
                    // Drop the empty assistant placeholder — an empty report
                    // card with action buttons says nothing. Replace it with
                    // the reason, which describe_error() has already made
                    // actionable ("set GROQ_MODEL in .env to…").
                    messages: [
                      ...c.messages.filter((m) => m.id !== assistantId),
                      {
                        id: uid('msg'),
                        role: 'system' as const,
                        content: event.message,
                        createdAt: Date.now(),
                      },
                    ],
                  }
                : c,
            ),
          }))
          break

        case 'eof':
          break
      }
    }

    unsubscribe = subscribeToResearch(jobId, {
      onEvent: handleEvent,
      onError: (message) => {
        if (get().status !== 'running') return
        set({ status: 'error', error: message, finishedAt: Date.now() })
        handleEvent({ type: 'error', message })
      },
      onClose: () => {
        // The run may already have settled via `done`/`error`; only clean up.
        if (get().status !== 'running') return
        // Settling without a `done` event means the stream ended early, so
        // there is no report to show — say so rather than leaving a blank card.
        handleEvent({
          type: 'error',
          message: 'The research stream ended before a report was produced.',
        })
      },
    })
  },

  cancel: () => {
    // server.py has no cancel endpoint — the worker thread runs to completion
    // server-side. This detaches the UI from the stream and stops the run from
    // occupying the composer; the job's result is still fetchable by id.
    unsubscribe?.()
    unsubscribe = null
    const { activeId } = get()
    set((state) => ({
      status: 'complete',
      finishedAt: Date.now(),
      agents: state.agents.map((a) => (a.status === 'running' ? { ...a, status: 'warn' as const, note: 'Detached' } : a)),
      conversations: state.conversations.map((c) =>
        c.id === activeId
          ? { ...c, messages: c.messages.map((m) => (m.streaming ? { ...m, streaming: false } : m)) }
          : c,
      ),
    }))
  },

  regenerate: async () => {
    const conversation = get().activeConversation()
    const topic = conversation?.topic
    if (!topic) return
    // Drop the previous assistant turn so the rerun replaces rather than stacks.
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversation.id
          ? { ...c, messages: c.messages.filter((m) => m.role === 'user').slice(0, -1) }
          : c,
      ),
    }))
    await get().submit(topic)
  },

  selectConversation: (id) => {
    if (get().status === 'running') return
    const conversation = get().conversations.find((c) => c.id === id)
    set({
      activeId: id,
      sources: conversation?.messages.find((m) => m.report)?.report?.sources ?? [],
      logs: [],
      status: 'idle',
      error: null,
      jobId: conversation?.jobId ?? null,
      startedAt: null,
      finishedAt: null,
      agents: idleAgents(get().agents),
    })
  },

  newConversation: () => {
    unsubscribe?.()
    unsubscribe = null
    set((state) => ({
      activeId: null,
      jobId: null,
      status: 'idle',
      error: null,
      logs: [],
      sources: [],
      startedAt: null,
      finishedAt: null,
      agents: idleAgents(state.agents),
    }))
  },

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeId: state.activeId === id ? null : state.activeId,
    })),

  togglePin: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    })),

  toggleBookmark: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, bookmarked: !c.bookmarked } : c,
      ),
    })),

  renameConversation: (id, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    })),

  reactToMessage: (messageId, reaction) =>
    set((state) => ({
      conversations: state.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, reaction } : m)),
      })),
    })),

  activeConversation: () => {
    const { conversations, activeId } = get()
    return conversations.find((c) => c.id === activeId)
  },

  progress: () => {
    const { agents, status } = get()
    if (status === 'idle') return 0
    if (status === 'complete') return 100
    const settled = agents.filter((a) => a.status === 'done' || a.status === 'warn').length
    const running = agents.some((a) => a.status === 'running') ? 0.5 : 0
    return Math.min(99, Math.round(((settled + running) / Math.max(1, agents.length)) * 100))
  },

  currentPhase: () => {
    const { agents, status } = get()
    if (status === 'idle') return 'Ready'
    if (status === 'error') return 'Failed'
    if (status === 'complete') return 'Complete'
    const running = agents.find((a) => a.status === 'running')
    return running ? `${running.name} — ${running.role}` : 'Starting up'
  },
}))

// Persist history on every change. Cheap enough at this size, and it means a
// refresh mid-run still leaves the conversation on record.
useResearchStore.subscribe((state, previous) => {
  if (state.conversations !== previous.conversations) {
    saveConversations(state.conversations)
  }
})
