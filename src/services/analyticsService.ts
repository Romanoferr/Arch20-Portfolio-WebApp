import { supabase } from '@/lib/supabase/client'

/**
 * Camada de dados para o dashboard de analytics.
 *
 * Todas as funções chamam RPCs (security definer) cuja permissão é limitada
 * a `authenticated` e que NUNCA expõem identificadores individuais. Os dados
 * coletados são sessões anônimas (session_id efêmero em sessionStorage).
 */

export interface AnalyticsRange {
  from: string // ISO
  to: string // ISO (exclusivo)
}

export interface AnalyticsSummary {
  sessions: number
  pageviews: number
  avg_duration: number
  pages_per_session: number
  unique_sessions: number
}

export interface SeriesPoint {
  day: string
  sessions: number
  pageviews: number
  avg_duration: number
}

export interface PathStat {
  path: string
  views: number
}

export interface ConversionStat {
  type: 'whatsapp' | 'email' | 'contact'
  count: number
}

function asNumber(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0
}

export async function getAnalyticsSummary(range: AnalyticsRange): Promise<AnalyticsSummary> {
  const { data, error } = await supabase.rpc('analytics_summary', {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw error
  return {
    sessions: asNumber(data.sessions),
    pageviews: asNumber(data.pageviews),
    avg_duration: asNumber(data.avg_duration),
    pages_per_session: asNumber(data.pages_per_session),
    unique_sessions: asNumber(data.unique_sessions),
  }
}

export async function getAnalyticsSeries(range: AnalyticsRange): Promise<SeriesPoint[]> {
  const { data, error } = await supabase.rpc('analytics_series', {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    day: String(r.day),
    sessions: asNumber(r.sessions),
    pageviews: asNumber(r.pageviews),
    avg_duration: asNumber(r.avg_duration),
  }))
}

export async function getTopPaths(range: AnalyticsRange, limit = 10): Promise<PathStat[]> {
  const { data, error } = await supabase.rpc('analytics_top_paths', {
    p_from: range.from,
    p_to: range.to,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    path: String(r.path),
    views: asNumber(r.views),
  }))
}

export async function getTopProjects(range: AnalyticsRange, limit = 10): Promise<PathStat[]> {
  const { data, error } = await supabase.rpc('analytics_top_projects', {
    p_from: range.from,
    p_to: range.to,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    path: String(r.path),
    views: asNumber(r.views),
  }))
}

export async function getConversions(range: AnalyticsRange): Promise<ConversionStat[]> {
  const { data, error } = await supabase.rpc('analytics_conversions', {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    type: r.type as ConversionStat['type'],
    count: asNumber(r.count),
  }))
}

// Distribuições por dimensão (device, browser, OS, país, origem).
export interface DimensionStat {
  name: string
  value: number
}

async function getDimension(
  rpcName: string,
  range: AnalyticsRange,
  fallback = 'unknown',
): Promise<DimensionStat[]> {
  const { data, error } = await supabase.rpc(rpcName, {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    name: String(r.name || fallback),
    value: asNumber(r.count),
  }))
}

export async function getByDevice(range: AnalyticsRange): Promise<DimensionStat[]> {
  return getDimension('analytics_by_device', range, 'desktop')
}

export async function getByBrowser(range: AnalyticsRange): Promise<DimensionStat[]> {
  return getDimension('analytics_by_browser', range, 'other')
}

export async function getByOs(range: AnalyticsRange): Promise<DimensionStat[]> {
  return getDimension('analytics_by_os', range, 'other')
}

export async function getByCountry(range: AnalyticsRange): Promise<DimensionStat[]> {
  return getDimension('analytics_by_country', range, 'XX')
}

export async function getByReferrer(range: AnalyticsRange): Promise<DimensionStat[]> {
  return getDimension('analytics_by_referrer', range, 'direct')
}