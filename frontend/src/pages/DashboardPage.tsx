import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, Clock, FileText, Gauge, Layers, Link2, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { ChartFrame } from '@/components/charts/ChartFrame'
import { CHART, axisProps, gridProps, tooltipStyle, valueFormatter } from '@/components/charts/theme'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { useResearchStore } from '@/store/researchStore'
import { estimateTokens, formatCompact, formatDuration, formatRelative } from '@/utils/format'
import { domainOf } from '@/utils/sources'
import { stagger, fadeUp } from '@/animations/variants'

/**
 * Metrics are computed from this browser's own research history — there is no
 * analytics endpoint on the backend. Each card names exactly what it counts so
 * nothing reads as more authoritative than it is.
 */
export default function DashboardPage() {
  const conversations = useResearchStore((s) => s.conversations)
  const agents = useResearchStore((s) => s.agents)

  const stats = useMemo(() => {
    const completed = conversations.filter((c) => c.status === 'complete')

    const totalRuntime = completed.reduce((sum, c) => sum + (c.elapsed ?? 0), 0)
    const totalSources = conversations.reduce((sum, c) => sum + c.sourceCount, 0)

    // An approximation over report text only — the backend reports no usage.
    const estimatedTokens = conversations.reduce(
      (sum, c) => sum + c.messages.reduce((inner, m) => inner + estimateTokens(m.content), 0),
      0,
    )

    const scored = completed.filter((c) => typeof c.score === 'number')
    const averageScore = scored.length
      ? scored.reduce((sum, c) => sum + (c.score as number), 0) / scored.length
      : 0

    return {
      completed: completed.length,
      total: conversations.length,
      totalRuntime,
      totalSources,
      estimatedTokens,
      averageScore,
      // Each completed run executes the full pipeline once.
      agentSteps: completed.length * Math.max(1, agents.length),
    }
  }, [conversations, agents.length])

  /** Runs per day over the last 14 days, including empty days. */
  const volume = useMemo(() => {
    const days: Array<{ day: string; runs: number }> = []
    const today = new Date().setHours(0, 0, 0, 0)

    for (let offset = 13; offset >= 0; offset -= 1) {
      const start = today - offset * 86_400_000
      const end = start + 86_400_000
      days.push({
        day: new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        runs: conversations.filter((c) => c.createdAt >= start && c.createdAt < end).length,
      })
    }
    return days
  }, [conversations])

  /** Score of each completed run, oldest first, so a trend is readable. */
  const scoreTrend = useMemo(
    () =>
      conversations
        .filter((c) => typeof c.score === 'number')
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-12)
        .map((c, index) => ({ run: `#${index + 1}`, score: c.score as number, title: c.title })),
    [conversations],
  )

  /** Most-cited domains across every run. */
  const topDomains = useMemo(() => {
    const counts = new Map<string, number>()
    for (const conversation of conversations) {
      for (const message of conversation.messages) {
        for (const source of message.report?.sources ?? []) {
          const domain = domainOf(source.url)
          counts.set(domain, (counts.get(domain) ?? 0) + 1)
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([domain, count]) => ({ domain, count }))
  }, [conversations])

  const recent = conversations.slice(0, 5)

  if (conversations.length === 0) {
    return (
      <div className="grid h-full place-items-center px-4">
        <EmptyState
          icon={Sparkles}
          title="No research yet"
          description="Run your first research topic and this dashboard will fill in with real numbers from your own runs."
          action={
            <Link to="/app">
              <Button variant="primary" size="sm" magnetic className="mt-2">
                Start researching
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Computed from the {conversations.length} research run{conversations.length === 1 ? '' : 's'} stored in
            this browser.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={0}
            label="Research completed"
            value={stats.completed}
            icon={FileText}
            hint={`${stats.total} started in total`}
            accent="blue"
          />
          <StatCard
            index={1}
            label="Total run time"
            value={stats.totalRuntime}
            icon={Clock}
            hint="Wall-clock time the agents spent working"
            format={(value) => formatDuration(value)}
            accent="purple"
          />
          <StatCard
            index={2}
            label="Sources gathered"
            value={stats.totalSources}
            icon={Link2}
            hint="Unique links collected across all runs"
            accent="cyan"
          />
          <StatCard
            index={3}
            label="Average score"
            value={stats.averageScore}
            icon={Gauge}
            decimals={1}
            suffix="/10"
            hint="As scored by the Critic agent"
            accent="emerald"
          />
          <StatCard
            index={4}
            label="Agent steps run"
            value={stats.agentSteps}
            icon={Layers}
            hint={`${agents.length} pipeline stages per completed run`}
            accent="blue"
          />
          <StatCard
            index={5}
            label="Tokens (estimated)"
            value={stats.estimatedTokens}
            icon={Sparkles}
            format={formatCompact}
            hint="Rough estimate from text length — the backend reports no usage"
            accent="purple"
          />
        </div>

        {/* Charts */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <ChartFrame
            title="Research volume"
            subtitle="Runs started per day, last 14 days"
            table={{ columns: ['Day', 'Runs'], rows: volume.map((row) => [row.day, row.runs]) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volume} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.series[0]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART.series[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" interval="preserveStartEnd" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <RTooltip {...tooltipStyle} formatter={valueFormatter('Runs')} />
                <Area
                  type="monotone"
                  dataKey="runs"
                  stroke={CHART.series[0]}
                  strokeWidth={2}
                  fill="url(#volume-fill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: CHART.surface }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame
            title="Report scores over time"
            subtitle="Critic score out of 10, oldest run first"
            table={{
              columns: ['Run', 'Score', 'Topic'],
              rows: scoreTrend.map((row) => [row.run, row.score, row.title]),
            }}
          >
            {scoreTrend.length === 0 ? (
              <p className="grid h-full place-items-center text-xs text-ink-faint">
                No scored reports yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 6, right: 10, bottom: 0, left: -24 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="run" {...axisProps} />
                  <YAxis domain={[0, 10]} ticks={[0, 5, 10]} {...axisProps} />
                  <RTooltip
                    {...tooltipStyle}
                    formatter={valueFormatter('Score', '/10')}
                    labelFormatter={(label) =>
                      scoreTrend.find((row) => row.run === label)?.title ?? label
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={CHART.series[0]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART.series[0], strokeWidth: 2, stroke: CHART.surface }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>

          {topDomains.length > 0 && (
            <ChartFrame
              title="Most-cited domains"
              subtitle="How often each site appeared across all reports"
              table={{ columns: ['Domain', 'Citations'], rows: topDomains.map((row) => [row.domain, row.count]) }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDomains} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="domain" width={120} {...axisProps} />
                  <RTooltip {...tooltipStyle} formatter={valueFormatter('Citations')} />
                  <Bar dataKey="count" fill={CHART.series[0]} radius={[0, 4, 4, 0]} barSize={13}>
                    <LabelList dataKey="count" position="right" fill={CHART.textSecondary} fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          )}

          {/* Recent projects */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Recent research</h3>
            <div className="space-y-1">
              {recent.map((conversation) => (
                <Link
                  key={conversation.id}
                  to="/app"
                  onClick={() => useResearchStore.getState().selectConversation(conversation.id)}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.05]"
                >
                  <span
                    className={cnStatus(conversation.status)}
                    aria-label={conversation.status}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px]">{conversation.title}</span>
                    <span className="block text-[10px] text-ink-faint">
                      {formatRelative(conversation.updatedAt)} · {conversation.sourceCount} sources
                      {conversation.score != null && <> · {conversation.score}/10</>}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

function cnStatus(status: string): string {
  const base = 'h-1.5 w-1.5 shrink-0 rounded-full '
  if (status === 'complete') return `${base}bg-accent-emerald`
  if (status === 'error') return `${base}bg-accent-rose`
  return `${base}bg-accent-blue`
}
