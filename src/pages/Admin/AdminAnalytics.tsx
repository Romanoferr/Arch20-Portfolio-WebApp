import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Loader2,
  AlertCircle,
  BarChart3,
  MousePointerClick,
  Eye,
  Clock,
  Tags,
  Smartphone,
  Monitor,
  Globe,
  MapPin,
  CheckCircle2,
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
import { LineChart, BarChart } from '@/lib/analytics/charts'

type PeriodKey = '7d' | '30d' | '90d'

const PERIOD_LABEL: Record<PeriodKey, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
}

function periodRange(key: PeriodKey): AnalyticsRange {
  const now = new Date()
  const days = key === '7d' ? 7 : key === '30d' ? 30 : 90
  const from = new Date(now.getTime() - days * 86400 * 1000)
  const to = new Date(now.getTime() + 86400 * 1000) // até amanhã (inclusivo do dia atual)
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

function toBar(data: DimensionStat[] | PathStat[]): { label: string; value: number }[] {
  return (data as Array<{ name?: string; path?: string; views?: number; value?: number }>).map((d) => ({
    label: d.name ?? d.path ?? '—',
    value: d.views ?? d.value ?? 0,
  }))
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

  const totalConversions = useMemo(
    () => conversions.reduce((acc, c) => acc + c.count, 0),
    [conversions],
  )

  const conversionMap = useMemo(() => {
    const m: Record<string, number> = { whatsapp: 0, email: 0, contact: 0 }
    for (const c of conversions) m[c.type] = c.count
    return m
  }, [conversions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm md:flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
            Analytics
          </p>
          <h2 className="mt-2 font-serif text-3xl">Comportamento dos visitantes</h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
            Sessões anônimas (sem cookies, sem IP), pensadas para entender o
            interesse do público do escritório.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['7d', '30d', '90d'] as PeriodKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition-colors ${
                period === k
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)]'
              }`}
            >
              <Calendar size={14} />
              {PERIOD_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-[28px] border border-[var(--color-border)] bg-white p-16 text-sm text-[var(--color-muted)]">
          <Loader2 size={18} className="mr-2 animate-spin" />
          Carregando analytics...
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Não foi possível carregar os dados</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Eye size={18} />} label="Sessões" value={formatNumber(summary?.sessions ?? 0)} />
            <StatCard icon={<BarChart3 size={18} />} label="Pageviews" value={formatNumber(summary?.pageviews ?? 0)} />
            <StatCard icon={<Clock size={18} />} label="Duração média" value={formatDuration(summary?.avg_duration ?? 0)} />
            <StatCard icon={<Tags size={18} />} label="Páginas / sessão" value={String(summary?.pages_per_session ?? 0)} />
          </div>

          {/* Evolução temporal */}
          <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-serif text-xl">Pageviews por dia</h3>
            <LineChart
              labels={series.map((s) => s.day)}
              values={series.map((s) => s.pageviews)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Projetos mais visualizados */}
            <Card title="Projetos mais visualizados" icon={<MousePointerClick size={16} />}>
              {topProjects.length === 0 ? (
                <EmptyState />
              ) : (
                <BarChart data={toBar(topProjects)} maxItems={8} />
              )}
            </Card>

            {/* Páginas mais acessadas */}
            <Card title="Páginas mais acessadas" icon={<Eye size={16} />}>
              {topPaths.length === 0 ? (
                <EmptyState />
              ) : (
                <BarChart data={toBar(topPaths)} maxItems={8} />
              )}
            </Card>

            {/* Origens */}
            <Card title="Origem do visitante" icon={<Globe size={16} />}>
              {referrer.length === 0 ? (
                <EmptyState />
              ) : (
                <BarChart data={toBar(referrer)} maxItems={6} />
              )}
            </Card>

            {/* Conversões */}
            <Card title="Conversões" icon={<CheckCircle2 size={16} />}>
              {totalConversions === 0 ? (
                <EmptyState text="Nenhuma conversão no período." />
              ) : (
                <ConversionList map={conversionMap} total={totalConversions} />
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Dispositivos" icon={<Smartphone size={16} />}>
              <BarChart data={toBar(device)} maxItems={5} height={200} />
            </Card>
            <Card title="Navegadores" icon={<Globe size={16} />}>
              <BarChart data={toBar(browser)} maxItems={6} height={200} />
            </Card>
            <Card title="Sistemas operacionais" icon={<Monitor size={16} />}>
              <BarChart data={toBar(os)} maxItems={6} height={200} />
            </Card>
          </div>

          {/* País */}
          <Card title="Localização (país)" icon={<MapPin size={16} />}>
            {country.length === 0 ? (
              <EmptyState text="Sem dados de localização no período." />
            ) : (
              <BarChart data={toBar(country)} maxItems={8} />
            )}
          </Card>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes de apresentação
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[var(--color-accent)]/10 p-2 text-[var(--color-accent)]">
          {icon}
        </div>
        <div>
          <p className="text-sm text-[var(--color-muted)]">{label}</p>
          <p className="truncate font-serif text-2xl">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-[var(--color-accent)]">{icon}</span>}
        <h3 className="font-serif text-lg">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text = 'Sem dados no período.' }: { text?: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-[var(--color-muted)]">
      {text}
    </div>
  )
}

function ConversionList({
  map,
  total,
}: {
  map: Record<string, number>
  total: number
}) {
  const rows: Array<{ key: string; label: string; count: number }> = [
    { key: 'whatsapp', label: 'Cliques em WhatsApp', count: map.whatsapp },
    { key: 'email', label: 'Cliques em E-mail', count: map.email },
    { key: 'contact', label: 'Envios de contato', count: map.contact },
  ]
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
        return (
          <div key={r.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-[var(--color-muted)]">{r.label}</span>
              <span className="font-medium">{r.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
      <p className="pt-2 text-xs text-[var(--color-muted)]">
        Total de {total} conversões no período.
      </p>
    </div>
  )
}