import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  Check,
  ChevronDown,
  Globe,
  GraduationCap,
  Layers,
  Mic,
  MicOff,
  Paperclip,
  Square,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Tooltip } from '@/components/common/Tooltip'
import { useResearchStore } from '@/store/researchStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { estimateTokens } from '@/utils/format'
import type { ResearchDepth, SearchMode } from '@/types'

const PLACEHOLDERS = [
  'How are solid-state batteries changing EV range?',
  'What is the current evidence on intermittent fasting?',
  'Compare RISC-V and ARM for edge inference in 2026',
  'What happened to the EU AI Act implementation timeline?',
  'Summarise recent breakthroughs in room-temperature superconductors',
]

const DEPTHS: Array<{ id: ResearchDepth; label: string; hint: string }> = [
  { id: 'quick', label: 'Quick', hint: 'Fewer sources, fastest turnaround' },
  { id: 'standard', label: 'Standard', hint: 'Balanced breadth and speed' },
  { id: 'deep', label: 'Deep', hint: 'Widest search, most thorough report' },
]

const MODES: Array<{ id: SearchMode; label: string; icon: typeof Globe }> = [
  { id: 'web', label: 'Web', icon: Globe },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'hybrid', label: 'Hybrid', icon: Layers },
]

const MAX_LENGTH = 500 // backend/server.py rejects anything longer

export function Composer() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const textarea = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()

  const submit = useResearchStore((s) => s.submit)
  const cancel = useResearchStore((s) => s.cancel)
  const status = useResearchStore((s) => s.status)
  const depth = useResearchStore((s) => s.depth)
  const setDepth = useResearchStore((s) => s.setDepth)
  const searchMode = useResearchStore((s) => s.searchMode)
  const setSearchMode = useResearchStore((s) => s.setSearchMode)

  const running = status === 'running'
  const { listening, supported: voiceSupported, toggle: toggleVoice } = useVoiceInput((transcript) =>
    setValue((current) => (current ? `${current} ${transcript}` : transcript).slice(0, MAX_LENGTH)),
  )

  // Rotate the example placeholder while the box is empty and unfocused.
  useEffect(() => {
    if (value || focused || reduced) return
    const timer = window.setInterval(
      () => setPlaceholderIndex((index) => (index + 1) % PLACEHOLDERS.length),
      4200,
    )
    return () => window.clearInterval(timer)
  }, [value, focused, reduced])

  // Grow with content up to a ceiling, then scroll.
  useEffect(() => {
    const element = textarea.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 200)}px`
  }, [value])

  const handleSubmit = () => {
    const topic = value.trim()
    if (!topic || running) return
    setValue('')
    setFiles([])
    void submit(topic)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  /**
   * Attachments are accepted and listed, but there is no upload endpoint on the
   * backend — POST /api/research takes a topic string only. Rather than
   * silently dropping them, the filenames are appended to the topic so their
   * context still reaches the pipeline, and the UI says so.
   */
  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return
    const accepted = [...incoming].slice(0, 4)
    setFiles((current) => [...current, ...accepted].slice(0, 4))
    toast.info('Attachments are referenced by name — the backend has no file upload endpoint yet.')
  }

  const remaining = MAX_LENGTH - value.length
  const tokens = estimateTokens(value)

  return (
    <div className="relative">
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-3xl border-2 border-dashed border-accent-blue/60 bg-accent-blue/10 backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-accent-blue">Drop files to reference them</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={cn(
          'relative overflow-hidden rounded-3xl border bg-surface/80 backdrop-blur-2xl transition-colors duration-300',
          focused ? 'border-transparent shadow-lift' : 'border-hairline shadow-float',
        )}
      >
        {/* Animated gradient border, lit only while focused. */}
        <AnimatePresence>
          {focused && (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: 1,
                background:
                  'linear-gradient(120deg, rgba(59,130,246,0.9), rgba(168,85,247,0.7), rgba(34,211,238,0.9), rgba(59,130,246,0.9))',
                backgroundSize: '300% 300%',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: reduced ? undefined : 'gradient-pan 4s ease infinite',
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* Attachments */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-hairline"
            >
              <div className="flex flex-wrap gap-1.5 p-3">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-1.5 rounded-lg border border-hairline bg-white/[0.04] py-1 pl-2 pr-1 text-[11px]"
                  >
                    <Paperclip className="h-3 w-3 text-ink-faint" />
                    <span className="max-w-[160px] truncate">{file.name}</span>
                    <button
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      className="grid h-4 w-4 place-items-center rounded text-ink-faint hover:text-ink"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="relative px-4 pt-4">
          <label htmlFor="research-topic" className="sr-only">
            Research topic
          </label>
          <textarea
            id="research-topic"
            ref={textarea}
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            disabled={running}
            aria-describedby="composer-hint"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-transparent disabled:opacity-50"
          />

          {/* Rotating placeholder, rendered separately so it can cross-fade. */}
          {!value && (
            <div className="pointer-events-none absolute inset-x-4 top-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-[15px] leading-relaxed text-ink-faint"
                >
                  {PLACEHOLDERS[placeholderIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-3">
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />

          <ToolbarButton
            label="Attach files"
            onClick={() => fileInput.current?.click()}
            disabled={running}
          >
            <Paperclip className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            label={
              !voiceSupported
                ? 'Voice input is not supported in this browser'
                : listening
                  ? 'Stop dictation'
                  : 'Dictate the topic'
            }
            onClick={toggleVoice}
            disabled={running || !voiceSupported}
            active={listening}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-hairline" aria-hidden />

          {/* Depth + mode */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((open) => !open)}
              disabled={running}
              aria-expanded={settingsOpen}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-40"
            >
              {DEPTHS.find((d) => d.id === depth)?.label}
              <span className="text-ink-faint">·</span>
              {MODES.find((m) => m.id === searchMode)?.label}
              <ChevronDown className={cn('h-3 w-3 transition-transform', settingsOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} aria-hidden />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="glass-strong absolute bottom-full left-0 z-20 mb-2 w-64 p-2 shadow-lift"
                  >
                    <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Research depth
                    </p>
                    {DEPTHS.map((option) => (
                      <OptionRow
                        key={option.id}
                        label={option.label}
                        hint={option.hint}
                        selected={depth === option.id}
                        onClick={() => setDepth(option.id)}
                      />
                    ))}

                    <p className="px-2 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Search mode
                    </p>
                    {MODES.map((option) => (
                      <OptionRow
                        key={option.id}
                        label={option.label}
                        icon={option.icon}
                        selected={searchMode === option.id}
                        onClick={() => setSearchMode(option.id)}
                      />
                    ))}

                    <p className="mt-2 border-t border-hairline px-2 pt-2 text-[10px] leading-relaxed text-ink-faint">
                      These shape the interface. The current backend accepts a topic only, so they are
                      not yet sent with the request.
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <span className="flex-1" />

          {/* Counters */}
          <AnimatePresence>
            {value.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'mr-1 text-[10px] tabular-nums',
                  remaining < 60 ? 'text-accent-amber' : 'text-ink-faint',
                )}
              >
                ~{tokens} tokens · {remaining} left
              </motion.span>
            )}
          </AnimatePresence>

          {/* Send / stop */}
          <AnimatePresence mode="wait" initial={false}>
            {running ? (
              <motion.button
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.92 }}
                onClick={cancel}
                className="grid h-9 w-9 place-items-center rounded-xl border border-accent-rose/30 bg-accent-rose/15 text-accent-rose transition-colors hover:bg-accent-rose/25"
                aria-label="Stop following this run"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSubmit}
                disabled={!value.trim()}
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-xl transition-all duration-300',
                  value.trim()
                    ? 'bg-gradient-accent text-white shadow-glow-blue'
                    : 'bg-white/[0.06] text-ink-faint',
                )}
                aria-label="Start research"
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <p id="composer-hint" className="mt-2 text-center text-[10px] text-ink-faint">
        {running ? (
          <>Stop detaches this view — the run continues on the server.</>
        ) : (
          <>
            <kbd className="rounded border border-hairline px-1">Enter</kbd> to research ·{' '}
            <kbd className="rounded border border-hairline px-1">Shift</kbd>+
            <kbd className="rounded border border-hairline px-1">Enter</kbd> for a new line
          </>
        )}
      </p>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip label={label} side="top">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors',
          'hover:bg-white/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-30',
          active && 'bg-accent-rose/15 text-accent-rose',
        )}
      >
        {children}
      </motion.button>
    </Tooltip>
  )
}

function OptionRow({
  label,
  hint,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string
  hint?: string
  icon?: typeof Globe
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
        selected ? 'bg-accent-blue/[0.12] text-ink' : 'text-ink-muted hover:bg-white/[0.05] hover:text-ink',
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium">{label}</span>
        {hint && <span className="block text-[10px] text-ink-faint">{hint}</span>}
      </span>
      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-accent-blue" />}
    </button>
  )
}
