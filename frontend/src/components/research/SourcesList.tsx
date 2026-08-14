import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownWideNarrow, LinkIcon } from 'lucide-react'
import { SourceCard } from './SourceCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SourceSkeleton } from '@/components/common/Skeleton'
import { enrichSources } from '@/utils/sources'
import { cn } from '@/utils/cn'
import type { Source } from '@/types'

type SortKey = 'order' | 'credibility'

interface SourcesListProps {
  sources: Source[]
  loading?: boolean
  compact?: boolean
  className?: string
}

export function SourcesList({ sources, loading = false, compact = false, className }: SourcesListProps) {
  const [sort, setSort] = useState<SortKey>('order')

  const enriched = useMemo(() => {
    const list = enrichSources(sources)
    // 'order' is the order the pipeline found them, which carries the search
    // engine's own ranking — worth keeping as the default.
    return sort === 'credibility' ? [...list].sort((a, b) => b.credibility - a.credibility) : list
  }, [sources, sort])

  if (loading && sources.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        {[0, 1, 2].map((index) => (
          <SourceSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (enriched.length === 0) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="No sources yet"
        description="Links the Scout agent finds will be collected here as the run progresses."
      />
    )
  }

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-2 flex items-center justify-between px-0.5">
          <p className="text-[11px] text-ink-faint">
            {enriched.length} source{enriched.length === 1 ? '' : 's'}
          </p>
          <button
            onClick={() => setSort((current) => (current === 'order' ? 'credibility' : 'order'))}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            <ArrowDownWideNarrow className="h-3 w-3" />
            {sort === 'order' ? 'Found order' : 'By score'}
          </button>
        </div>
      )}

      <motion.div layout className="space-y-2">
        <AnimatePresence initial={false}>
          {enriched.map((source, index) => (
            <SourceCard key={source.url} source={source} index={index} compact={compact} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
