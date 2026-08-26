import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Loader2,
  MapPin,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  getAnalyticsSummary,
  getAnalyticsSeries,
  getTopPaths,
  getTopProjects,
  getConversions,
  getByDevice,
  getByBrowser,
  getByOs,
  getByCountry,
  getByReferrer,
  type AnalyticsRange,
  type AnalyticsSummary,
  type SeriesPoint,
  type PathStat,
  type ConversionStat,
  type DimensionStat,
} from '@/services/analyticsService'
import {
  PALETTE,
  TrendAreaChart,
  RankingBars,
  DonutChart,
  CompareBars,
  type RankingDatum,
  type SeriesDatum,
} from '@/lib/analytics/BigCharts'

type PeriodKey = '7d' | '30d' | '90d'

const PERIOD_LABEL: Record<PeriodKey, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
}

function periodRange(key: PeriodKey): AnalyticsRange {
  // O fuso de referência do produto é America/Sao_Paulo (UTC-3). Calculamos o
  // "agora" e a borda do dia nesse fuso para o intervalo terminar no fim do
  // dia local do visitante (e não às 21h da véspera em UTC).
  const nowLocal = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  )
  const days = key === '7d' ? 7 : key === '30d' ? 30 : 90
  const from = new Date(nowLocal.getTime() - days * 86400 * 1000)
  const to = new Date(nowLocal.getTime() + 86400 * 1000) // até amanhã (inclusivo do dia atual)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null
  return ((current - previous) / previous) * 100
}

function pathLabel(path: string): string {
  if (!path || path === '/') return 'Home'
  const clean = path.replace(/\/+$/, '')
  return clean.length > 26 ? `${clean.slice(0, 26)}…` : clean
}

function toRanking(data: DimensionStat[] | PathStat[]): RankingDatum[] {
  return (data as Array<{ name?: string; path?: string; views?: number; value?: number }>)
    .map((d) => {
      const raw = d.name ?? d.path ?? '—'
      const label = d.path !== undefined ? pathLabel(raw) : raw
      return { label, value: d.views ?? d.value ?? 0 }
    })
    .filter((d) => d.value >= 0)
}

function toSeries(data: SeriesPoint[]): SeriesDatum[] {
  return data.map((s) => ({
    day: s.day,
    sessions: s.sessions,
    pageviews: s.pageviews,
  }))
}

function toDonut(data: RankingDatum[]): { name: string; value: number }[] {
  return data.map((d) => ({ name: d.label, value: d.value }))
}

export function AdminAnalytics() {
  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [series, setSeries] = useState<SeriesPoint[]>([])
  const [topPaths, setTopPaths] = useState<PathStat[]>([])
  const [topProjects, setTopProjects] = useState<PathStat[]>([])
  const [conversions, setConversions] = useState<ConversionStat[]>([])
  const [device, setDevice] = useState<DimensionStat[]>([])
  const [browser, setBrowser] = useState<DimensionStat[]>([])
  const [os, setOs] = useState<DimensionStat[]>([])
  const [country, setCountry] = useState<DimensionStat[]>([])
  const [referrer, setReferrer] = useState<DimensionStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => periodRange(period), [period])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, se, topP, topPr, conv, dv, br, oa, co, rf] = await Promise.all([
        getAnalyticsSummary(range),
        getAnalyticsSeries(range),
        getTopPaths(range, 8),
        getTopProjects(range, 8),
        getConversions(range),
        getByDevice(range),
        getByBrowser(range),
        getByOs(range),
        getByCountry(range),
        getByReferrer(range),
      ])
      setSummary(s)
      setSeries(se)
      setTopPaths(topP)
      setTopProjects(topPr)
      setConversions(conv)
      setDevice(dv)
      setBrowser(br)
      setOs(oa)
      setCountry(co)
      setReferrer(rf)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível carregar os dados de analytics.',
      )
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    void load()
  }, [load])

  // Tendência derivada da própria série (metade recente vs. metade anterior)
  const trend = useMemo(() => {
    if (series.length < 2) return null
    const half = Math.max(1, Math.floor(series.length / 2))
    const recent = series.slice(half).reduce((a, s) => a + s.pageviews, 0)
    const previous = series.slice(0, half).reduce((a, s) => a + s.pageviews, 0)
    return percentChange(recent, previous)
  }, [series])

  const totalConversions = useMemo(
    () => conversions.reduce((acc, c) => acc + c.count, 0),
    [conversions],
  )

  const conversionMap = useMemo(() => {
    const m: Record<string, number> = { whatsapp: 0, email: 0, contact: 0 }
    for (const c of conversions) m[c.type] = c.count
    return m
  }, [conversions])

  const deviceData = useMemo(() => toDonut(toRanking(device)), [device])
  const browserRanking = useMemo(() => toRanking(browser), [browser])
  const osRanking = useMemo(() => toRanking(os), [os])
  const referrerDonut = useMemo(() => toDonut(toRanking(referrer)), [referrer])
  const countryRanking = useMemo(() => toRanking(country), [country])
  const pathRanking = useMemo(() => toRanking(topPaths), [topPaths])
  const projectRanking = useMemo(() => toRanking(topProjects), [topProjects])
  const seriesChart = useMemo(() => toSeries(series), [series])

  return (
    <div className="space-y-8">
      {/* ============================ Header ============================ */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#818cf8]">
            Analytics
          </p>
          <h2 className="mt-1.5 font-serif text-3xl text-slate-900">
            Desempenho do site
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Sessões anônimas (sem cookies e sem IP) para entender o interesse do
            público do escritório.
          </p>
        </div>

        {/* Segmented control de período */}
        <div className="inline-flex shrink-0 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(['7d', '30d', '90d'] as PeriodKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                period === k
                  ? 'bg-[#4f46e5] text-white shadow'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {PERIOD_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <>
          {/* ============================ KPIs ============================ */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Users size={18} />}
              accent={PALETTE.primary}
              label="Sessões"
              value={formatNumber(summary?.sessions ?? 0)}
              trend={trend}
            />
            <KpiCard
              icon={<Eye size={18} />}
              accent={PALETTE.teal}
              label="Pageviews"
              value={formatNumber(summary?.pageviews ?? 0)}
              trend={trend}
            />
            <KpiCard
              icon={<Clock size={18} />}
              accent={PALETTE.amber}
              label="Duração média"
              value={formatDuration(summary?.avg_duration ?? 0)}
            />
            <KpiCard
              icon={<Activity size={18} />}
              accent={PALETTE.violet}
              label="Páginas / sessão"
              value={String(summary?.pages_per_session ?? 0)}
            />
          </div>

          {/* ==================== Evolução temporal ==================== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 font-serif text-xl text-slate-900">
                <TrendingUp size={18} className="text-[#4f46e5]" />
                Pageviews e sessões por dia
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Fuso horário America/Sao_Paulo
              </p>
            </div>
            <TrendAreaChart data={seriesChart} />
          </section>

          {/* ==================== Rankings ==================== */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              title="Páginas mais acessadas"
              icon={<Eye size={16} />}
              subtitle="Por pageviews reais"
            >
              <RankingBars data={pathRanking} maxItems={8} />
            </Card>
            <Card
              title="Projetos mais visualizados"
              icon={<MousePointerClick size={16} />}
              subtitle="Visitas às páginas de projeto"
            >
              <RankingBars data={projectRanking} maxItems={8} />
            </Card>
          </div>

          {/* ==================== Origem + conversões ==================== */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Origem do visitante" icon={<Globe size={16} />}>
              <DonutChart
                data={referrerDonut}
                totalLabel="Acessos"
                formatValue={formatNumber}
              />
            </Card>

            <Card title="Conversões" icon={<CheckCircle2 size={16} />}>
              {totalConversions === 0 ? (
                <NoDataState text="Nenhuma conversão no período." />
              ) : (
                <ConversionFunnel map={conversionMap} total={totalConversions} />
              )}
            </Card>
          </div>

          {/* ==================== Tecnologia ==================== */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 font-serif text-xl text-slate-900">
              <Monitor size={18} className="text-[#4f46e5]" />
              Dispositivos e tecnologia
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card title="Dispositivos" icon={<Smartphone size={16} />}>
                <DonutChart data={deviceData} height={190} totalLabel="Sessões" />
              </Card>
              <Card title="Navegadores" icon={<Globe size={16} />}>
                <CompareBars data={browserRanking} maxItems={6} />
              </Card>
              <Card title="Sistemas operacionais" icon={<Monitor size={16} />}>
                <CompareBars data={osRanking} maxItems={6} />
              </Card>
            </div>
          </section>

          {/* ==================== Localização ==================== */}
          <Card title="Localização (país)" icon={<MapPin size={16} />}>
            {countryRanking.length === 0 ? (
              <NoDataState text="Sem dados de localização no período." />
            ) : (
              <RankingBars data={countryRanking} maxItems={8} />
            )}
          </Card>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componentes de apresentação
// ---------------------------------------------------------------------------

function KpiCard({
  icon,
  accent,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode
  accent: string
  label: string
  value: string
  trend?: number | null
}) {
  const up = (trend ?? 0) >= 0
  const showTrend = trend !== undefined && trend !== null
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ background: accent }}
        >
          {icon}
        </div>
        {showTrend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
              up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
            title="Tendência da segunda metade do período vs. primeira"
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 font-serif text-3xl tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

function Card({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string
  icon?: React.ReactNode
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-[#818cf8]">{icon}</span>}
        <div>
          <h3 className="font-serif text-lg leading-tight text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function ConversionFunnel({
  map,
  total,
}: {
  map: Record<string, number>
  total: number
}) {
  const rows: Array<{ key: string; label: string; count: number; color: string }> = [
    { key: 'whatsapp', label: 'WhatsApp', count: map.whatsapp, color: PALETTE.teal },
    { key: 'email', label: 'E-mail', count: map.email, color: PALETTE.primary },
    { key: 'contact', label: 'Formulário', count: map.contact, color: PALETTE.amber },
  ]
  const strongestCount = Math.max(...rows.map((r) => r.count))
  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
        const strongest = r.count > 0 && r.count === strongestCount
        return (
          <div key={r.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                {r.label}
                {strongest && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-600">
                    Top
                  </span>
                )}
              </span>
              <span className="tabular-nums font-semibold text-slate-900">{r.count}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: r.color }}
              />
            </div>
          </div>
        )
      })}
      <p className="pt-1 text-xs text-slate-400">
        Total de{' '}
        <span className="font-semibold text-slate-600 tabular-nums">{total}</span>{' '}
        conversões no período.
      </p>
    </div>
  )
}

function SkeletonState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
        <Loader2 size={18} className="animate-spin text-[#4f46e5]" />
        Calculando métricas…
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        <AlertTriangle size={22} />
      </div>
      <div>
        <p className="font-semibold text-rose-700">
          Não foi possível carregar os dados
        </p>
        <p className="mt-1 text-sm text-rose-500">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
      >
        <RefreshCw size={15} /> Tentar novamente
      </button>
    </div>
  )
}

function NoDataState({ text = 'Sem dados no período.' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-slate-400">
      <BarChart3 size={22} />
      <p className="text-sm">{text}</p>
    </div>
  )
}