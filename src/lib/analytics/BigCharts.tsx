/**
 * Gráficos profissionais do dashboard de Analytics.
 *
 * Conjunto de visualizações construídas com Recharts para dar clareza e
 * hierarquia visual à análise de desempenho do site. São componentes de
 * apresentação puros: recebem dados já formatados e NÃO tocam em RPCs/nas
 * fontes de dados.
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RcBarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

// ---------------------------------------------------------------------------
// Paleta própria — visualização de dados (não atrelada ao tema do site)
// ---------------------------------------------------------------------------
export const PALETTE = {
  primary: '#6366f1', // indigo 500
  primaryDeep: '#4f46e5',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#94a3b8',
  ink: '#0f172a',
  muted: '#64748b',
  grid: '#eef2f7',
  surface: '#f8fafc',
} as const

// Paleta categórica (consistente em todos os gráficos de distribuição).
const CATEGORICAL = [
  PALETTE.primary,
  PALETTE.teal,
  PALETTE.amber,
  PALETTE.rose,
  PALETTE.violet,
  PALETTE.slate,
]

export interface SeriesDatum {
  day: string
  sessions: number
  pageviews: number
}

const formatK = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

// ---------------------------------------------------------------------------
// Tooltip compartilhado (estilo consistente)
// ---------------------------------------------------------------------------
function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
  formatter?: (value: number, name: string) => string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label && <p className="mb-1.5 font-semibold text-slate-800">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="capitalize text-slate-500">{entry.name}:</span>
            <span className="font-medium text-slate-800 tabular-nums">
              {formatter ? formatter(entry.value ?? 0, entry.name ?? '') : formatK(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function axisProps() {
  return {
    stroke: PALETTE.muted,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  } as const
}

// ---------------------------------------------------------------------------
// Evolução temporal — área de pageviews + linha de sessões
// ---------------------------------------------------------------------------
export function TrendAreaChart({
  data,
  height = 280,
}: {
  data: SeriesDatum[]
  height?: number
}) {
  if (data.length === 0) {
    return <NoData />
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.primary} stopOpacity={0.32} />
              <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={PALETTE.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(d: string) => d.slice(5)}
            {...axisProps()}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis {...axisProps()} tickFormatter={formatK} width={44} allowDecimals={false} />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(v) => formatK(v)}
              />
            }
            cursor={{ stroke: PALETTE.slate, strokeDasharray: '3 3' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: PALETTE.muted }}
          />
          <Area
            type="monotone"
            dataKey="pageviews"
            name="Pageviews"
            stroke={PALETTE.primaryDeep}
            strokeWidth={2.5}
            fill="url(#gradPv)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: PALETTE.primaryDeep }}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            name="Sessões"
            stroke={PALETTE.teal}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: PALETTE.teal }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ranking — barras horizontais
// ---------------------------------------------------------------------------
export interface RankingDatum {
  label: string
  value: number
}

export function RankingBars({
  data,
  maxItems = 8,
  height,
}: {
  data: RankingDatum[]
  maxItems?: number
  height?: number
}) {
  const items = data.slice(0, maxItems)
  if (items.length === 0) return <NoData text="Sem dados no período." />
  const chartHeight = height ?? Math.max(160, items.length * 40 + 16)

  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <RcBarChart
          data={items}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={PALETTE.grid} horizontal={false} strokeDasharray="2 3" />
          <XAxis
            type="number"
            hide
            domain={[0, (dataMax: number) => Math.max(dataMax * 1.12, 1)]}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            tickLine={false}
            axisLine={false}
            tick={{ fill: PALETTE.muted, fontSize: 12 }}
          />
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatK(v)} />}
            cursor={{ fill: PALETTE.surface }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18} name="Acessos">
            {items.map((d, i) => (
              <Cell key={d.label} fill={categorical(i)} />
            ))}
          </Bar>
        </RcBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Donut — distribuição (origens, dispositivos, etc.)
// ---------------------------------------------------------------------------
export interface DonutDatum {
  name: string
  value: number
}

export function DonutChart({
  data,
  maxItems = 6,
  height = 220,
  totalLabel = 'Total',
  formatValue = formatK,
}: {
  data: DonutDatum[]
  maxItems?: number
  height?: number
  totalLabel?: string
  formatValue?: (n: number) => string
}) {
  const clean = data.filter((d) => d.value > 0).slice(0, maxItems)
  const total = clean.reduce((acc, d) => acc + d.value, 0)
  if (clean.length === 0) return <NoData text="Sem dados no período." />

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row">
      <div style={{ height, width: height }} className="relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTooltip formatter={(v) => formatValue(v)} />
              }
            />
            <Pie
              data={clean}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {clean.map((d, i) => (
                <Cell key={d.name} fill={categorical(i)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900">
            {formatValue(total)}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legenda interativa */}
      <ul className="w-full min-w-0 flex-1 space-y-1.5">
        {clean.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0
          return (
            <li key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: categorical(i) }}
              />
              <span className="min-w-0 flex-1 truncate capitalize text-slate-600">
                {d.name}
              </span>
              <span className="tabular-nums font-medium text-slate-900">{formatValue(d.value)}</span>
              <span className="w-10 text-right tabular-nums text-slate-400">
                {pct.toFixed(1)}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Faixa de barras comparativas (browsers / OS) com rótulos HTML
// ---------------------------------------------------------------------------
export function CompareBars({
  data,
  maxItems = 6,
}: {
  data: RankingDatum[]
  maxItems?: number
}) {
  const items = data.slice(0, maxItems)
  if (items.length === 0) return <NoData text="Sem dados no período." />
  const max = Math.max(1, ...items.map((d) => d.value))
  const total = items.reduce((a, d) => a + d.value, 0)

  return (
    <div className="space-y-3">
      {items.map((d, i) => {
        const pct = (d.value / max) * 100
        const share = total > 0 ? (d.value / total) * 100 : 0
        return (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-600">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: categorical(i) }}
                />
                <span className="truncate capitalize">{d.label}</span>
              </span>
              <span className="tabular-nums text-xs text-slate-400">{share.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: categorical(i) }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Cores categóricas ciclando a paleta.
function categorical(i: number): string {
  return CATEGORICAL[i % CATEGORICAL.length]
}

function NoData({ text = 'Sem dados no período.' }: { text?: string }) {
  return (
    <div className="flex h-32 w-full items-center justify-center text-sm text-slate-400">
      {text}
    </div>
  )
}