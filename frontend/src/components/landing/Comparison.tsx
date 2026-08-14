import { Check, Minus, X } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { COMPARISON } from '@/content/product'
import { cn } from '@/utils/cn'

const COLUMNS = [
  { key: 'search' as const, label: 'Web search', note: 'Google, Bing' },
  { key: 'chatbot' as const, label: 'Generic AI chat', note: 'Single model, one pass' },
  { key: 'platform' as const, label: 'This platform', note: 'Four-agent pipeline', highlight: true },
]

export function Comparison() {
  return (
    <Section id="compare">
      <SectionHeading
        eyebrow="Why this approach"
        title="A chain of specialists beats a single pass"
        description="One model answering in one shot has no way to check itself. Splitting the work lets a later stage catch what an earlier one missed."
      />

      <Reveal>
        <div className="overflow-x-auto rounded-card border border-hairline bg-surface/40 backdrop-blur-xl">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <caption className="sr-only">
              Capability comparison between web search, generic AI chat, and this platform
            </caption>

            <thead>
              <tr>
                <th scope="col" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Capability
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'px-4 py-4 text-center',
                      column.highlight && 'relative bg-accent-primary/[0.06]',
                    )}
                  >
                    {column.highlight && (
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-accent" aria-hidden />
                    )}
                    <span
                      className={cn(
                        'block font-display text-[13px] font-semibold tracking-tight',
                        column.highlight ? 'text-gradient' : 'text-ink',
                      )}
                    >
                      {column.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-normal text-ink-faint">{column.note}</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.capability} className="border-t border-hairline transition-colors hover:bg-white/[0.02]">
                  <th scope="row" className="px-5 py-3.5 text-left text-[13px] font-normal text-ink-muted">
                    {row.capability}
                  </th>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={cn('px-4 py-3.5 text-center', column.highlight && 'bg-accent-primary/[0.05]')}
                    >
                      <Mark value={row[column.key]} strong={column.highlight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  )
}

/**
 * Cells carry an icon *and* a text label for screen readers — the state is
 * never conveyed by the glyph's colour alone.
 */
function Mark({ value, strong }: { value: boolean | string; strong?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center">
        <span
          className={cn(
            'grid h-6 w-6 place-items-center rounded-full',
            strong ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-white/[0.06] text-ink-muted',
          )}
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="sr-only">Yes</span>
      </span>
    )
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.03] text-ink-faint/60">
          <X className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="sr-only">No</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint">
      <Minus className="h-3 w-3" aria-hidden />
      {value}
    </span>
  )
}
