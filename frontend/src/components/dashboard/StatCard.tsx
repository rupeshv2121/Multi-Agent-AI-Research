import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/common/Card'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  /** One line saying what the number actually counts. */
  hint: string
  suffix?: string
  decimals?: number
  format?: (value: number) => string
  index?: number
  accent?: 'blue' | 'purple' | 'cyan' | 'emerald'
}

const ACCENTS = {
  blue: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
  purple: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20',
  cyan: 'text-accent-tertiary bg-accent-tertiary/10 border-accent-tertiary/20',
  emerald: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20',
}

/**
 * A hero number, not a chart — the right form when there is one value to read.
 * The hint line is required: an unexplained metric invites the wrong reading.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  suffix,
  decimals = 0,
  format,
  index = 0,
  accent = 'blue',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
    >
      <Card interactive spotlight className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
          <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg border', ACCENTS[accent])}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>

        <p className="mt-3 text-3xl font-semibold tracking-tight">
          <AnimatedCounter value={value} decimals={decimals} suffix={suffix} format={format} />
        </p>

        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">{hint}</p>
      </Card>
    </motion.div>
  )
}
