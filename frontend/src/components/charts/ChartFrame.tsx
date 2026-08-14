import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Table2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tooltip } from '@/components/common/Tooltip'

interface ChartFrameProps {
  title: string
  /** One line naming the measure and its units. */
  subtitle?: string
  children: ReactNode
  /** Rows behind the chart, so the data is reachable without reading colour. */
  table?: { columns: string[]; rows: Array<Array<string | number>> }
  className?: string
  height?: number
}

/**
 * Wrapper every chart sits in.
 *
 * Its job beyond layout is the accessibility contract: a table view of the same
 * numbers is one click away, so nothing is conveyed by the picture alone.
 */
export function ChartFrame({ title, subtitle, children, table, className, height = 220 }: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <div className={cn('glass flex flex-col p-4', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 truncate text-[11px] text-ink-muted">{subtitle}</p>}
        </div>

        {table && (
          <Tooltip label={showTable ? 'Show chart' : 'Show data table'} side="left">
            <button
              onClick={() => setShowTable((value) => !value)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
              aria-label={showTable ? 'Show chart' : 'Show data table'}
              aria-pressed={showTable}
            >
              {showTable ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
            </button>
          </Tooltip>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showTable && table ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-auto"
            style={{ height }}
          >
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      className="sticky top-0 border-b border-hairline bg-surface px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-muted"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-white/[0.02]">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn(
                          'border-b border-hairline/50 px-2 py-2',
                          cellIndex > 0 && 'tabular-nums text-ink-muted',
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
