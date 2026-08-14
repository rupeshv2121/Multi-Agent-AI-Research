/**
 * Shapes mirrored from the Python backend.
 *
 * `pipeline.py` emits the events, `server.py` relays them over SSE. Keep the
 * discriminants here in sync with `emit(type=...)` calls in the pipeline.
 */

export type AgentStatus = 'idle' | 'running' | 'done' | 'warn' | 'error'

/** One entry of `STEPS` in pipeline.py. */
export interface AgentStep {
  id: string
  name: string
  role: string
}

/** An agent's live state for the duration of a single run. */
export interface AgentRuntime extends AgentStep {
  status: AgentStatus
  /** Seconds, as reported by the backend when the step settles. */
  duration?: number
  /** Transient message shown while retrying. */
  note?: string
  error?: string
  startedAt?: number
  finishedAt?: number
}

export interface Source {
  url: string
  title: string
}

/** A source enriched client-side with presentation metadata. */
export interface EnrichedSource extends Source {
  domain: string
  faviconUrl: string
  /** Heuristic 0-100 score; see utils/sources.ts for how it is derived. */
  credibility: number
  credibilityLabel: string
}

export interface ResearchState {
  search_result?: string
  search_raw?: string
  scraped_content?: string
  sources?: Source[]
  report?: string
  feedback?: string
  /** Critic's score out of 10, or null when it could not be parsed. */
  score?: number | null
}

export type JobStatus = 'running' | 'complete' | 'error'

export interface Job {
  id: string
  topic: string
  status: JobStatus
  created_at: string
  finished_at?: string
  state: ResearchState | null
  error: string | null
}

export interface HealthResponse {
  ok: boolean
  keys: { tavily: boolean; groq: boolean }
  steps: AgentStep[]
}

export interface StartResearchResponse {
  job_id: string
  topic: string
}

/* ------------------------------ SSE events ------------------------------ */

export interface StartEvent {
  type: 'start'
  topic: string
  steps: AgentStep[]
}

export interface LogEvent {
  type: 'log'
  message: string
}

export interface StepEvent {
  type: 'step'
  step: string
  status: 'running' | 'done' | 'warn' | 'error'
  duration?: number
  note?: string
  error?: string
}

export interface SourcesEvent {
  type: 'sources'
  sources: Source[]
}

export interface DoneEvent {
  type: 'done'
  state: ResearchState
}

export interface ErrorEvent {
  type: 'error'
  message: string
}

export interface EofEvent {
  type: 'eof'
}

export type ResearchEvent =
  | StartEvent
  | LogEvent
  | StepEvent
  | SourcesEvent
  | DoneEvent
  | ErrorEvent
  | EofEvent

/* ------------------------------ Chat / UI ------------------------------- */

export type MessageRole = 'user' | 'assistant' | 'system'


export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  /** Links an assistant message back to the run that produced it. */
  jobId?: string
  /** Assistant messages stream in; `true` until the run settles. */
  streaming?: boolean
  reaction?: 'like' | 'dislike' | null
  /** Present on the final report message. */
  report?: {
    sources: Source[]
    feedback: string
    score: number | null
    /**
     * The agent roster as it stood when the run finished. Persisted with the
     * conversation so reopening it from history still shows the per-agent
     * timings — the live `agents` slice is reset for the next run.
     */
    agents?: AgentRuntime[]
  }
}

export interface Conversation {
  id: string
  title: string
  topic: string
  createdAt: number
  updatedAt: number
  pinned: boolean
  bookmarked: boolean
  messages: ChatMessage[]
  jobId?: string
  status: JobStatus
  /** Wall-clock seconds the run took, for dashboard stats. */
  elapsed?: number
  score?: number | null
  sourceCount: number
}

export interface LogEntry {
  id: string
  message: string
  at: number
  /** Agent the log line was attributed to, when one was active. */
  agentId?: string
}

export type ResearchDepth = 'quick' | 'standard' | 'deep'
export type SearchMode = 'web' | 'academic' | 'hybrid'
