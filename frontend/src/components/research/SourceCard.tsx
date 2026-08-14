import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Globe } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tooltip } from '@/components/common/Tooltip'
import { CHART } from '@/components/charts/theme'
import { siteNameOf } from '@/utils/sources'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { EnrichedSource } from '@/types'

/**
 * Credibility is ordered magnitude, not category, so the bar uses the single
 * hue ordinal ramp from the chart palette (light -> dark = low -> high) rather
 * than a red/amber/green status scale. Same encoding as the "Source quality
 * mix" chart, so the two read as one system.
 */
const BAR_COLOR = (score: number) =>
  score >= 85 ? CHART.ordinal[3] : score >= 70 ? CHART.ordinal[2] : score >= 55 ? CHART.ordinal[1] : CHART.ordinal[0]

interface SourceCardProps {
  source: EnrichedSource
  index: number
  compact?: boolean
}

export function SourceCard({ source, index, compact = false }: SourceCardProps) {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const reduced = useReducedMotion()

  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : Math.min(index * 0.04, 0.4), type: 'spring', stiffness: 260, damping: 26 }}
      whileHover={reduced ? undefined : { y: -3 }}
      className={cn(
        'group relative flex gap-3 overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-3',
        'backdrop-blur-xl transition-colors hover:border-white/[0.16] hover:bg-surface-raised/70',
      )}
    >
      {/* Index chip doubles as the citation number used in the report. */}
      <span className="absolute right-2.5 top-2.5 text-[10px] font-medium tabular-nums text-ink-faint/60">
        {index + 1}
      </span>

      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-hairline bg-white/[0.04]">
        {faviconFailed ? (
          <Globe className="h-4 w-4 text-ink-faint" />
        ) : (
          <img
            src={source.faviconUrl}
            alt=""
            className="h-4 w-4"
            loading="lazy"
            onError={() => setFaviconFailed(true)}
          />
        )}
      </span>

      <span className="min-w-0 flex-1 pr-4">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[11px] font-medium text-ink-muted">{siteNameOf(source.domain)}</span>
          <span className="truncate text-[10px] text-ink-faint">{source.domain}</span>
        </span>

        <span className="mt-0.5 block line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-white">
          {source.title}
        </span>

        {!compact && (
          <span className="mt-2 flex items-center gap-2">
            <Tooltip
              label={`${source.credibilityLabel} · heuristic score from the domain, not a fact-check`}
              side="top"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: BAR_COLOR(source.credibility) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.credibility}%` }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className="text-[10px] tabular-nums text-ink-faint">{source.credibility}</span>
              </span>
            </Tooltip>

            <ExternalLink className="ml-auto h-3 w-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        )}
      </span>
    </motion.a>
  )
}
