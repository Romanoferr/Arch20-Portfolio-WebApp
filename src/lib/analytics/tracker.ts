/**
 * Tracker de analytics (privacy-first, mínima pegada).
 *
 * Coleta atividade de UMA sessão de navegação em memória + sessionStorage e
 * envia para o Worker de coleta apenas no fim (pagehide) ou em lote (a cada
 * ~5 pageviews), usando `navigator.sendBeacon` (não bloqueia a navegação).
 *
 * Privacidade:
 *   - `session_id` = `crypto.randomUUID()` efêmero, guardado SOMENTE em
 *     sessionStorage (some ao fechar a aba). Não é cookie, não é persistente
 *     e não rastreia entre visitas.
 *   - Só o `pathname` é coletado (sem query/hash/UTM).
 *   - Não envia IP nem User-Agent; geo/device/OS são resolvidos no edge.
 *   - O referrer é enviado apenas para o Worker extrair categoria+domínio.
 */

export const ANALYTICS_STORAGE_KEY = 'arch20_analytics_session'
const MAX_PATHS = 50

export type AnalyticsEventType = 'whatsapp' | 'email' | 'contact'

export interface AnalyticsPath {
  p: string
  t: string
}

export interface AnalyticsEvent {
  type: AnalyticsEventType
  path: string
  ts: string
}

export interface SessionState {
  session_id: string
  started_at: string
  ended_at: string
  paths: AnalyticsPath[]
  events: AnalyticsEvent[]
  referrer: string
}

const ANALYTICS_ENDPOINT = (import.meta.env.VITE_ANALYTICS_ENDPOINT as string) || ''

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function nowIso(): string {
  return new Date().toISOString()
}

function getPath(): string {
  // Apenas pathname — nunca coletamos query string (evita UTM/PII).
  return window.location.pathname
}

function readStoredSession(): SessionState | null {
  try {
    const raw = window.sessionStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionState
    if (!parsed?.session_id || !Array.isArray(parsed.paths)) return null
    return parsed
  } catch {
    return null
  }
}

function saveSession(s: SessionState): void {
  try {
    window.sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* sessão cheia/privada — segue só em memória */
  }
}

function createNewSession(): SessionState {
  const now = nowIso()
  return {
    session_id: window.crypto.randomUUID(),
    started_at: now,
    ended_at: now,
    paths: [{ p: getPath(), t: now }],
    events: [],
    referrer: document.referrer || '',
  }
}

// estado singleton da sessão atual (efêmera)
let session: SessionState = readStoredSession() ?? createNewSession()

// ---------------------------------------------------------------------------
// flush — envia o estado para o Worker e, opcionalmente, recomeça sessão
// ---------------------------------------------------------------------------
function scheduleIdle(cb: () => void): void {
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void) => void
  }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb)
  } else {
    setTimeout(cb, 0)
  }
}

export function flush(clear = false): void {
  if (!session || session.paths.length === 0) return
  if (!ANALYTICS_ENDPOINT) return

  const s = session
  const payload = {
    session_id: s.session_id,
    started_at: s.started_at,
    ended_at: s.ended_at,
    duration_seconds: Math.max(
      0,
      Math.round((Date.parse(s.ended_at) - Date.parse(s.started_at)) / 1000),
    ),
    pageviews: s.paths.length,
    landing_path: s.paths[0]?.p ?? '/',
    exit_path: s.paths[s.paths.length - 1]?.p ?? null,
    paths: s.paths,
    events: s.events,
    referrer: s.referrer || '',
  }

  scheduleIdle(() => {
    // fetch(keepalive) em vez de sendBeacon: o sendBeacon bloqueia localmente
    // (blocked(other)) payloads cross-origin com Content-Type `application/json`
    // (não é CORS-safelisted) — a requisição nunca chegava ao Worker.
    // keepalive permite enviar no pagehide/unload e a requisição é concluída
    // em segundo plano mesmo se a página fechar.
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([payload]),
      keepalive: true,
    }).catch(() => {})
    if (clear) session = createNewSession()
  })
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------
export function trackPageView(): void {
  const now = nowIso()
  if (session.paths.length >= MAX_PATHS) {
    // Limite de 50 pageviews/sessão — não cresce mais o JSON.
    session.ended_at = now
    save(session)
    return
  }
  session.paths.push({ p: getPath(), t: now })
  session.ended_at = now
  save(session)

  // Lote: flush a cada 5 views reduz a frequência de escrita no Worker.
  if (session.paths.length % 5 === 0) flush(false)
}

export function trackEvent(type: AnalyticsEventType): void {
  session.events.push({ type, path: getPath(), ts: nowIso() })
  session.ended_at = nowIso()
  save(session)
  flush(false) // conversão: envio imediato (alto valor)
}

// ---------------------------------------------------------------------------
// init — registra listeners de navegação (SPA) e descarga no unload
// ---------------------------------------------------------------------------
let initialized = false

export function initAnalytics(): void {
  if (initialized) return
  initialized = true

  // Registra a primeira view (a página que abriu).
  trackPageView()

  // Navegação SPA: reage a back/forward (popstate). Como o React Router
  // troca a URL via history API, capturamos também no init para o caso de
  // páginas internas navegarem com pushState sem popstate.
  const onRouteChange = () => {
    const current = getPath()
    const last = session.paths[session.paths.length - 1]?.p
    if (last && last !== current) trackPageView()
  }

  window.addEventListener('popstate', onRouteChange)
  window.addEventListener('pagehide', () => flush(false))
}

function save(s: SessionState): void {
  session = s
  saveSession(s)
}