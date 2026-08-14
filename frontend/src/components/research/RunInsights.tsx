import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartFrame } from '@/components/charts/ChartFrame'
import { CHART, axisProps, labelFormatter, tooltipStyle, valueFormatter } from '@/components/charts/theme'
import { credibilityLabel, enrichSources } from '@/utils/sources'
import type { AgentRuntime, Source } from '@/types'

interface RunInsightsProps {
  agents: AgentRuntime[]
  sources: Source[]
}

/** Credibility tiers, ordered low -> high to match the sequential ramp. */
const TIERS = ['Low', 'Moderate', 'Good', 'High'] as const

/**
 * Two charts over the run's own data — how long each agent took, and how the
 * sources it found distribute across credibility tiers. Both are single-series,
 * so identity never rides on colour and no legend is needed.
 */
export function RunInsights({ agents, sources }: RunInsightsProps) {
  const timings = useMemo(
    () =>
      agents
        .filter((agent) => agent.duration != null)
        .map((agent) => ({ name: agent.name, seconds: Number((agent.duration ?? 0).toFixed(1)) })),
    [agents],
  )

  const tiers = useMemo(() => {
    const counts = new Map<string, number>(TIERS.map((tier) => [tier, 0]))
    for (const source of enrichSources(sources)) {
      const tier = credibilityLabel(source.credibility)
      counts.set(tier, (counts.get(tier) ?? 0) + 1)
    }
    return TIERS.map((tier, index) => ({ tier, count: counts.get(tier) ?? 0, fill: CHART.ordinal[index] }))
  }, [sources])

  if (timings.length === 0 && sources.length === 0) return null

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {timings.length > 0 && (
        <ChartFrame
          title="Time per agent"
          subtitle="Seconds spent in each pipeline stage"
          height={180}
          table={{
            columns: ['Agent', 'Seconds'],
            rows: timings.map((row) => [row.name, row.seconds]),
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timings} layout="vertical" margin={{ top: 4, right: 34, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={62} {...axisProps} />
              <RTooltip {...tooltipStyle} formatter={valueFormatter('Duration', 's')} />
              <Bar
                dataKey="seconds"
                fill={CHART.series[0]}
                radius={[0, 4, 4, 0]}
                barSize={14}
                isAnimationActive
                animationDuration={700}
              >
                {/* Direct labels: the value is readable without hovering. */}
                <LabelList
                  dataKey="seconds"
                  position="right"
                  fill={CHART.textSecondary}
                  fontSize={11}
                  formatter={labelFormatter('s')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      )}

      {sources.length > 0 && (
        <ChartFrame
          title="Source quality mix"
          subtitle="Sources per credibility tier (domain heuristic)"
          height={180}
          table={{
            columns: ['Tier', 'Sources'],
            rows: tiers.map((row) => [row.tier, row.count]),
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tiers} margin={{ top: 20, right: 4, bottom: 0, left: -22 }}>
              <XAxis dataKey="tier" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <RTooltip {...tooltipStyle} formatter={valueFormatter('Sources')} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                barSize={30}
                isAnimationActive
                animationDuration={700}
              >
                {tiers.map((row) => (
                  <Cell key={row.tier} fill={row.fill} />
                ))}
                <LabelList dataKey="count" position="top" fill={CHART.textSecondary} fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      )}
    </div>
  )
}
