import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/animations/variants'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div className="relative mb-1">
        <div className="absolute inset-0 rounded-2xl bg-accent-primary/15 blur-xl" aria-hidden />
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-hairline bg-white/[0.04]">
          <Icon className="h-5 w-5 text-ink-muted" aria-hidden />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="max-w-xs text-xs leading-relaxed text-ink-muted">{description}</p>
      {action}
    </motion.div>
  )
}
