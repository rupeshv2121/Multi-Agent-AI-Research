import { motion } from 'framer-motion'
import { AlertTriangle, Check, Keyboard, Palette, Server, Trash2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useUIStore, type AccentPreset } from '@/store/uiStore'
import { useResearchStore } from '@/store/researchStore'
import { useHealth } from '@/hooks/useHealth'
import { cn } from '@/utils/cn'
import { stagger, fadeUp } from '@/animations/variants'

const ACCENTS: Array<{ id: AccentPreset; label: string; swatch: string }> = [
  { id: 'blue', label: 'Signal', swatch: 'bg-accent-blue' },
  { id: 'purple', label: 'Nebula', swatch: 'bg-accent-purple' },
  { id: 'cyan', label: 'Lagoon', swatch: 'bg-accent-cyan' },
  { id: 'emerald', label: 'Verdant', swatch: 'bg-accent-emerald' },
]

const SHORTCUTS = [
  ['⌘K', 'Command palette'],
  ['⌘/', 'Search research history'],
  ['⌘B', 'Toggle sidebar'],
  ['⌘J', 'Toggle agent panel'],
  ['⌘⇧O', 'New research'],
  ['Enter', 'Submit topic'],
  ['Shift+Enter', 'New line in composer'],
  ['Esc', 'Close overlays'],
]

export default function SettingsPage() {
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const setReducedMotion = useUIStore((s) => s.setReducedMotion)
  const accent = useUIStore((s) => s.accent)
  const setAccent = useUIStore((s) => s.setAccent)

  const conversations = useResearchStore((s) => s.conversations)
  const { data, online, missingKeys } = useHealth()

  const clearHistory = () => {
    for (const conversation of [...conversations]) {
      useResearchStore.getState().deleteConversation(conversation.id)
    }
    toast.success('Research history cleared')
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-ink-muted">Preferences are stored in this browser.</p>
        </motion.div>

        {/* Backend */}
        <motion.div variants={fadeUp}>
          <Card className="mb-3 p-5">
            <SectionHeader icon={Server} title="Backend" subtitle="The Python pipeline this interface drives" />

            <dl className="mt-4 space-y-2.5 text-[13px]">
              <Row label="Connection">
                <span className={cn('font-medium', online ? 'text-accent-emerald' : 'text-accent-rose')}>
                  {online ? 'Connected' : 'Unreachable'}
                </span>
              </Row>
              <Row label="Tavily API key">
                <KeyState present={data?.keys.tavily} />
              </Row>
              <Row label="Groq API key">
                <KeyState present={data?.keys.groq} />
              </Row>
              <Row label="Pipeline stages">
                <span className="text-ink-muted">
                  {data?.steps.map((step) => step.name).join(' → ') ?? '—'}
                </span>
              </Row>
            </dl>

            {(!online || missingKeys.length > 0) && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.07] p-3">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-amber" />
                <p className="text-[12px] leading-relaxed text-ink-muted">
                  {!online ? (
                    <>
                      Start the backend with <code className="rounded bg-white/10 px-1">python server.py</code> from
                      the project root — it listens on port 8000.
                    </>
                  ) : (
                    <>
                      Add the missing key{missingKeys.length > 1 ? 's' : ''} (
                      {missingKeys.map((key) => `${key.toUpperCase()}_API_KEY`).join(', ')}) to your{' '}
                      <code className="rounded bg-white/10 px-1">.env</code> file and restart the server.
                    </>
                  )}
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={fadeUp}>
          <Card className="mb-3 p-5">
            <SectionHeader icon={Palette} title="Appearance" subtitle="This interface is dark-only by design" />

            <p className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-ink-faint">Accent</p>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setAccent(option.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                    accent === option.id
                      ? 'border-white/20 bg-white/[0.08] text-ink'
                      : 'border-hairline text-ink-muted hover:border-white/15 hover:text-ink',
                  )}
                  aria-pressed={accent === option.id}
                >
                  <span className={cn('h-3 w-3 rounded-full', option.swatch)} />
                  {option.label}
                  {accent === option.id && <Check className="h-3 w-3 text-accent-blue" />}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Motion */}
        <motion.div variants={fadeUp}>
          <Card className="mb-3 p-5">
            <SectionHeader
              icon={Wand2}
              title="Motion"
              subtitle="Your operating system's reduced-motion setting is always respected"
            />

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-[13px] font-medium">Reduce motion</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-muted">
                  Turns off the ambient background, particle field, cursor glow and streaming reveal.
                </span>
              </span>
              <Toggle checked={reducedMotion} onChange={setReducedMotion} label="Reduce motion" />
            </label>
          </Card>
        </motion.div>

        {/* Shortcuts */}
        <motion.div variants={fadeUp}>
          <Card className="mb-3 p-5">
            <SectionHeader icon={Keyboard} title="Keyboard shortcuts" subtitle="⌘ is Ctrl on Windows and Linux" />

            <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {SHORTCUTS.map(([keys, description]) => (
                <div key={keys} className="flex items-center justify-between gap-3 rounded-lg px-1 py-1.5">
                  <span className="text-[12px] text-ink-muted">{description}</span>
                  <kbd className="shrink-0 rounded border border-hairline bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-ink-faint">
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <SectionHeader icon={Trash2} title="Local data" subtitle="History never leaves this browser" />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {conversations.length} research run{conversations.length === 1 ? '' : 's'} stored. Clearing is
                permanent — the backend keeps no copy once its process restarts.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={clearHistory}
                disabled={conversations.length === 0}
                className="shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Server
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.04]">
        <Icon className="h-3.5 w-3.5 text-ink-muted" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-muted">{subtitle}</span>
      </span>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-right">{children}</dd>
    </div>
  )
}

function KeyState({ present }: { present?: boolean }) {
  if (present === undefined) return <span className="text-ink-faint">—</span>
  return (
    <span className={cn('font-medium', present ? 'text-accent-emerald' : 'text-accent-amber')}>
      {present ? 'Present' : 'Missing'}
    </span>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
        checked ? 'border-accent-blue/40 bg-accent-blue/30' : 'border-hairline bg-white/[0.06]',
      )}
    >
      <motion.span
        className={cn('absolute top-1/2 h-4 w-4 rounded-full', checked ? 'bg-accent-blue' : 'bg-white/40')}
        animate={{ left: checked ? 24 : 4, y: '-50%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}
