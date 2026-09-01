/**
 * Cloudflare Worker — Coleta de Analytics de sessão (privacy-first).
 *
 * Papel:
 *   - Recebe "batches" de atividade do frontend (pageviews + eventos de
 *     conversão) via POST em /api/collect.
 *   - Resolve geolocalização a partir dos headers `cf-*` (NUNCA armazena IP).
 *   - Normaliza device/browser/OS a partir do header `User-Agent` (NUNCA
 *     armazena o UA bruto).
 *   - Grava UMA linha por sessão na tabela `analytics_sessions` do Supabase,
 *     usando a chave `service_role` (nunca exposta ao frontend).
 *   - Roda um cron diário que limpa sessões mais antigas que RETENTION_DAYS
 *     e alimenta os agregados diários (permanentes).
 *
 * Endpoint:
 *   POST /api/collect  -> corpo: [{...}|{...}]  (array de sessões ou evento)
 *   Cron  cron         -> limpeza + rollup
 *
 * Privacidade/LGPD:
 *   - Não grava IP, User-Agent bruto, query strings, nem fingerprint.
 *   - `session_id` é um UUID efêmero emitido pelo front (sessionStorage).
 *   - PII não é coletada em nenhum campo.
 *
 * Secrets (no Dashboard/Wrangler):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (NUNCA no frontend)
 *   ALLOWED_ORIGINS  (var pública espelhada do wrangler.jsonc)
 *   SITE_DOMAIN      (domínio próprio do site, ex.: exemplo.com.br — também
 *                     aceito como var em wrangler.jsonc)
 *   RETENTION_DAYS   (var, padrão 180)
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const MAX_PATHS_PER_SESSION = 50
const MAX_EVENTS = 20
const MAX_BATCH = 50
const ALLOWED_EVENT_TYPES = new Set(['whatsapp', 'email', 'contact'])
const ALLOWED_REFERRER_CATEGORIES = new Set(['direct', 'search', 'social', 'other', 'internal'])

let serviceClient = null
function getSupabase(env) {
  if (!serviceClient) {
    serviceClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return serviceClient
}

// ---------------------------------------------------------------------------
// CORS — permite origins explícitas (ALLOWED_ORIGINS vírgula-separada) E
// também o domínio próprio do site + subdomínios (ex.: www.), para que o
// rastreio funcione independente de o visitante acessar por www ou apex.
// ---------------------------------------------------------------------------
function isOriginAllowed(env, origin) {
  if (!origin) return false

  // Origins explícitas (allowlist) — inclui localhost em dev.
  const raw = env.ALLOWED_ORIGINS || ''
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.includes(origin)) return true

  // Domínio próprio do site (sem www) e subdomínios dele.
  // `new URL` normaliza e permite comparar hostname de forma segura.
  let url
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  const host = url.hostname.toLowerCase()
  const apex = (env.SITE_DOMAIN || '').toLowerCase().replace(/^https?:\/\//, '')
  if (!apex) {
    return false
  }
  return host === apex || host.endsWith(`.${apex}`)
}

function buildCorsHeaders(env, origin) {
  const allowedOrigin = isOriginAllowed(env, origin) ? origin : ''
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
  if (allowedOrigin) headers['Access-Control-Allow-Origin'] = allowedOrigin
  return headers
}

function json(body, status = 200, env, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(env, origin) },
  })
}

// ---------------------------------------------------------------------------
// Normalização server-side de dimensões (sem reter dados brutos)
// ---------------------------------------------------------------------------

/** Converte o User-Agent em { device_type, browser, os } (enums curtas). */
function classifyUserAgent(ua) {
  const u = (ua || '').toLowerCase()
  const device_type =
    /tablet|ipad|sm-t|gt-p|tab/i.test(u) ? 'tablet'
    : /mobi|iphone|ipod|phone/i.test(u) ? 'mobile'
    : /android/i.test(u) ? 'tablet' // Android sem "mobile" tende a tablet
    : 'desktop'

  let browser = 'other'
  if (u.includes('edg/') || u.includes('edga/') || u.includes('edge/')) browser = 'edge'
  else if (u.includes('opr/') || u.includes('opera')) browser = 'opera'
  else if (u.includes('chrome') && !u.includes('chromium')) browser = 'chrome'
  else if (u.includes('firefox') && !u.includes('seamonkey')) browser = 'firefox'
  else if (u.includes('safari')) browser = 'safari'

  let os = 'other'
  if (u.includes('windows')) os = 'windows'
  else if (u.includes('android')) os = 'android'
  else if (u.includes('iphone') || u.includes('ipod') || u.includes('ipad')) os = 'ios'
  else if (u.includes('mac os')) os = 'macos'
  else if (u.includes('linux') && !u.includes('android')) os = 'linux'

  return { device_type, browser, os }
}

/** Classifica a origem a partir do Referer (sem armazenar query/PII). */
function classifyReferrer(ref, internalDomain = '') {
  if (!ref) return { category: 'direct', domain: null }
  let hostname
  try {
    hostname = new URL(ref).hostname
  } catch {
    hostname = null
  }
  if (!hostname) return { category: 'direct', domain: null }

  const h = hostname.toLowerCase()
  const apex = (internalDomain || '').toLowerCase().replace(/^https?:\/\//, '')
  if (apex && (h === apex || h.endsWith(`.${apex}`))) {
    return { category: 'internal', domain: hostname }
  }
  if (/(^|\.)(google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.)/.test(h)) {
    return { category: 'search', domain: hostname }
  }
  if (/(^|\.)(whatsapp\.|wa\.me|instagram\.|facebook\.|linkedin\.|twitter\.|x\.com|pinterest\.)/.test(h)) {
    return { category: 'social', domain: hostname }
  }
  return { category: 'other', domain: hostname }
}

// ---------------------------------------------------------------------------
// Sanitização de payload (evita tipo/largura inválidos no Supabase)
// ---------------------------------------------------------------------------

function sanitizePath(item) {
  if (!item || typeof item !== 'object') return null
  const p = typeof item.p === 'string' ? item.p.slice(0, 500) : null
  const t = typeof item.t === 'string' ? item.t.slice(0, 40) : null
  if (!p || !t) return null
  return { p, t }
}

/** Normaliza um array de paths, respeitando o limite de 50. */
function sanitizePaths(raw) {
  if (!Array.isArray(raw)) return []
  const out = []
  for (const it of raw) {
    if (out.length >= MAX_PATHS_PER_SESSION) break
    const s = sanitizePath(it)
    if (s) out.push(s)
  }
  return out
}

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return []
  const out = []
  for (const e of events) {
    if (out.length >= MAX_EVENTS) break
    if (e && typeof e === 'object' && ALLOWED_EVENT_TYPES.has(e.type)) {
      out.push({
        type: e.type,
        path: typeof e.path === 'string' ? e.path.slice(0, 500) : null,
        ts: typeof e.ts === 'string' ? e.ts.slice(0, 40) : null,
      })
    }
  }
  return out
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

// ---------------------------------------------------------------------------
// Persistência no Supabase (1 linha por sessão — upsert idempotente)
// ---------------------------------------------------------------------------
async function upsertSession(env, session) {
  const sb = getSupabase(env)
  const category = ALLOWED_REFERRER_CATEGORIES.has(session.referrer_category)
    ? session.referrer_category
    : 'direct'

  const row = {
    session_id: typeof session.session_id === 'string' && session.session_id
      ? session.session_id.slice(0, 36)
      : crypto.randomUUID(),
    started_at: session.started_at || new Date().toISOString(),
    ended_at: session.ended_at || null,
    duration_seconds: clampInt(session.duration_seconds, 0, 86400 * 7, 0),
    pageviews: clampInt(session.pageviews, 0, MAX_PATHS_PER_SESSION, 0),
    landing_path: typeof session.landing_path === 'string' ? session.landing_path.slice(0, 500) : '/',
    exit_path: typeof session.exit_path === 'string' ? session.exit_path.slice(0, 500) : null,
    paths: sanitizePaths(session.paths),
    referrer_category: category,
    referrer_domain: typeof session.referrer_domain === 'string'
      ? session.referrer_domain.slice(0, 255)
      : null,
    device_type: session.device_type || 'desktop',
    browser: session.browser || null,
    os: session.os || null,
    country: typeof session.country === 'string' ? session.country.slice(0, 2).toUpperCase() : null,
    region: typeof session.region === 'string' ? session.region.slice(0, 255) : null,
    city: typeof session.city === 'string' ? session.city.slice(0, 255) : null,
    events: sanitizeEvents(session.events),
  }

  // Upsert condicional via RPC: só aceita a escrita se ainda não havia sessão
  // finalizada ou se ela é mais recente que a já gravada (evita que um flush
  // antigo, chegando em ordem trocada, regrida os dados de uma sessão).
  // Mantém o modelo de 1 linha por sessão (UNIQUE em session_id).
  const { error } = await sb.rpc('analytics_upsert_session', {
    p_row: row,
  })
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Handlers de coleta
// ---------------------------------------------------------------------------
async function handleCollect(request, env) {
  const origin = request.headers.get('Origin')
  if (!isOriginAllowed(env, origin)) {
    return json({ error: 'Origin not allowed' }, 403, env, origin)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Bad JSON body' }, 400, env, origin)
  }

  const isBatch = Array.isArray(body)
  const sessions = isBatch ? body : [body]

  if (sessions.length > MAX_BATCH) {
    return json({ error: 'Batch too large' }, 400, env, origin)
  }

  const ua = request.headers.get('User-Agent') || ''
  const { device_type, browser, os } = classifyUserAgent(ua)

  // Geolocalização: o Cloudflare expõe country/region/city no objeto
  // `request.cf` (disponível em todos os planos). Os headers `cf-region` e
  // `cf-city` NÃO existem por padrão (só `cf-ipcountry`), por isso lemos do
  // objeto `cf` — que traz city, region, regionCode, country, timezone,
  // latitude e longitude.
  const cfInfo = request.cf || {}
  const cf = request.headers.get('cf-ipcountry') || request.headers.get('CF-IPCountry')
    || cfInfo.country || null
  const cfRegion = cfInfo.region || cfInfo.regionCode || null
  const cfCity = cfInfo.city || null
  const first = sessions[0] || {}
  const ref = classifyReferrer(first.referrer || request.headers.get('Referer'), env.SITE_DOMAIN)

  const enriched = sessions.map((s) => ({
    ...s,
    device_type: s.device_type || device_type,
    browser: s.browser || browser,
    os: s.os || os,
    country: s.country || cf || null,
    region: s.region || cfRegion || null,
    city: s.city || cfCity || null,
    referrer_category: s.referrer_category || ref.category,
    referrer_domain: s.referrer_domain || ref.domain,
  }))

  const upserts = enriched.map((s) => upsertSession(env, s))
  try {
    await Promise.all(upserts)
  } catch {
    return json({ error: 'Error persisting' }, 502, env, origin)
  }

  return json({ ok: true, total: sessions.length }, 200, env, origin)
}

// ---------------------------------------------------------------------------
// Rotina de limpeza (cron) — deleta sessões antigas + rollup diário
// ---------------------------------------------------------------------------
async function handleCleanup(env) {
  const sb = getSupabase(env)
  const retentionDays = clampInt(env.RETENTION_DAYS, 1, 1095, 180)
  const cutoff = new Date(Date.now() - retentionDays * 86400 * 1000).toISOString()
  const today = new Date().toISOString()

  // 1. Alimenta os agregados permanentes com as sessões que serão apagadas,
  //    para não perder métricas históricas (rollup idempotente por dia).
  const { error: rollupErr } = await sb.rpc('analytics_rollup', {
    p_from: cutoff.slice(0, 10),
    p_to: today.slice(0, 10),
  })
  if (rollupErr) throw rollupErr

  // 2. Deleta sessões mais antigas que a janela de retenção.
  const { error: delErr } = await sb
    .from('analytics_sessions')
    .delete()
    .lt('started_at', cutoff)
  if (delErr) throw delErr

  return { ok: true, deletedBefore: cutoff }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin')
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(env, origin) })
    }
    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/api/collect') {
      return handleCollect(request, env)
    }
    if (request.method === 'GET' && (url.pathname === '/__health' || url.pathname === '/health')) {
      return json({ ok: true }, 200, env, origin)
    }
    return json({ error: 'Not found' }, 404, env, origin)
  },
  async scheduled(event, env) {
    // Se handleCleanup lançar, o runtime do Cloudflare re-tenta o cron.
    await handleCleanup(env)
  },
}

// Exports para testes unitários (funções puras de classificação/sanitização).
export const _test = {
  classifyUserAgent,
  classifyReferrer,
  sanitizePaths,
  sanitizeEvents,
  clampInt,
  isOriginAllowed,
}