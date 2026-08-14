/**
 * Chart palette and shared Recharts styling.
 *
 * These values are not picked by eye — they were run through the data-viz
 * validator against this app's chart surface (#111114) in dark mode:
 *
 *   categorical (max 3 slots, all-pairs):  PASS  worst CVD ΔE 9.4, normal 20.9
 *   ordinal blue ramp (4 steps):           PASS  monotone L, light end 2.33:1
 *
 * Rules that follow from that and must hold wherever these are used:
 *   - Categorical slots are assigned in fixed order and never cycled. A 4th
 *     series is not a new hue — fold it into "Other" or facet the chart.
 *   - Ordinal tiers use the single-hue ramp, light -> dark, never the
 *     categorical hues.
 *   - Every chart here is single-series, so no legend box is needed: the title
 *     names the measure and values are direct-labelled.
 */

export const CHART = {
  /** Categorical identity. Fixed order — blue, orange, aqua. */
  series: ['#3987e5', '#d95926', '#199e70'] as const,

  /** Ordinal magnitude, light -> dark. Used for credibility tiers. */
  ordinal: ['#86b6ef', '#3987e5', '#256abf', '#184f95'] as const,

  surface: '#111114',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.10)',

  /** Text always wears ink tokens, never a series colour. */
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
} as const

/** Recessive axis styling shared by every chart. */
export const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.textMuted, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: '3 3',
  vertical: false,
} as const

/**
 * Recharts types tooltip values as `ValueType | undefined`, so formatters take
 * `unknown` and narrow here rather than each chart casting at the call site.
 */
export const valueFormatter =
  (name: string, suffix = '') =>
  (value: unknown): [string, string] => [`${value}${suffix}`, name]

/** Bar/point label formatter (`label` prop), same reason. */
export const labelFormatter =
  (suffix = '') =>
  (value: unknown): string => `${value}${suffix}`

/** Shared tooltip chrome so every chart's hover layer looks identical. */
export const tooltipStyle = {
  contentStyle: {
    background: 'rgba(22,22,26,0.96)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 12,
    fontSize: 12,
    padding: '8px 10px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px -8px rgba(0,0,0,0.7)',
  },
  labelStyle: { color: CHART.textSecondary, marginBottom: 4, fontSize: 11 },
  itemStyle: { color: CHART.textPrimary },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
} as const
