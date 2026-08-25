/**
 * Cloudflare Worker — Entrega otimizada de imagens (Image Delivery).
 *
 * Serve imagens do bucket R2 (custom domain `images.brunacamara-arq.com.br`)
 * aplicando Cloudflare Image Transformations em cache na edge.
 *
 * O arquivo original NUNCA é modificado: as transformações são aplicadas sob
 * demanda, via `fetch()` com as opções `cf.image`, e a variante resultante é
 * cacheada automaticamente pela Cloudflare.
 *
 * Rota pública (Custom Domain):
 *   https://img.brunacamara-arq.com.br/<objectKey>?preset=<preset>
 *
 * Exemplos:
 *   /projects/{projectId}/original/{uuid}.jpg?preset=gallery
 *   /heroes/Cena_01_v.png?preset=hero&format=auto
 *
 * Segurança:
 *   - Requer um `preset` válido (whitelist fechada) — nunca aceita width/height
 *     arbitrários vindos do cliente.
 *   - Valida o objectKey (structure conhecida), evitando acesso a URLs externas
 *     ou a qualquer caminho fora dos objetos de imagem do bucket R2.
 *   - Nunca expõe credenciais R2. A origem é construída a partir da constante
 *     ORIGIN_BASE_URL (env var do Worker) + o objectKey validado.
 *
 * Custo:
 *   Cada combinação (objectKey + preset) conta como uma "unique transformation"
 *   por mês na Cloudflare. Repetições da mesma combinação não são cobradas
 *   (sirviu pelo cache). Presets finitos mantêm custo previsível.
 */

// Presets fechados (whitelist). A chave é o único parâmetro aceito no query.
const PRESETS = {
  thumbnail: { width: 500, quality: 78 },
  mobile: { width: 800, quality: 80 },
  tablet: { width: 1200, quality: 82 },
  gallery: { width: 1600, quality: 82 },
  hero: { width: 1920, quality: 84 },
  full: { width: 2560, quality: 88 },
  social: { width: 1200, quality: 85 },
}

// Estrutura de objectKey permitida — somente prefixos fixos do bucket R2.
//   projects/{projectId}/original/{uuid}.{ext}
//   heroes/{nome}.{ext}
const OBJECT_KEY_RE =
  /^(projects\/[a-z0-9-]+\/original\/[a-z0-9_-]+\.[a-z0-9]+|heroes\/[a-z0-9_-]+\.[a-z0-9]+)$/i

// Cache na edge: originais usam UUIDs/nomes estáticos, então longa duração é
// seguro. Cloudflare já cacheia as variantes transformadas por padrão.
const MAX_AGE = 60 * 60 * 24 * 365 // 1 ano
const CACHE_CONTROL = `public, max-age=${MAX_AGE}, immutable`

function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Monta a configuração final para `cf.image` a partir de um preset.
 * `fit: 'scale-down'` impede ampliação de imagens menores que o preset.
 * `format: 'auto'` negocia AVIF/WebP com fallback (conta como uma transformação).
 */
function resolvePreset(presetName) {
  const preset = PRESETS[presetName]
  if (!preset) {
    return null
  }
  return {
    ...preset,
    fit: 'scale-down',
    format: 'auto',
  }
}

/**
 * Valida um objectKey para impedir:
 *  - URLs externas;
 *  - accessos fora dos prefixos `projects/` e `heroes/`;
 *  - caracteres/estruturas inesperadas.
 */
function isAllowedObjectKey(objectKey) {
  if (!objectKey || typeof objectKey !== 'string') {
    return false
  }
  const key = objectKey.replace(/^\/+/, '')
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return false
  }
  if (key.includes('..') || key.includes('\\')) {
    return false
  }
  return OBJECT_KEY_RE.test(key)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Somente GET (e HEAD). Bloqueia POST/DELETE/PUT.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError('Method not allowed', 405)
    }

    const objectKey = decodeURIComponent(url.pathname.replace(/^\/+/, ''))

    // Valida o objectKey ANTES de qualquer fetch.
    if (!isAllowedObjectKey(objectKey)) {
      return jsonError('Invalid object key', 400)
    }

    // Preset é obrigatório e precisa estar na whitelist (fechada).
    const presetName = url.searchParams.get('preset')
    const config = presetName ? resolvePreset(presetName) : null
    if (!config) {
      return jsonError('Invalid or missing preset', 400)
    }

    // Monta a origem REAL (R2) a partir do objectKey validado.
    const originBase = (
      env.ORIGIN_BASE_URL || 'https://images.brunacamara-arq.com.br'
    ).replace(/\/+$/, '')
    const originUrl = `${originBase}/${objectKey}`

    // Deixa a engine de transformação negociar o formato (auto), evitando
    // conflito com o Accept do navegador.
    const headers = new Headers(request.headers)
    headers.delete('Accept')

    const upstream = new Request(originUrl, {
      method: request.method,
      headers,
      redirect: 'follow',
    })

    try {
      const response = await fetch(upstream, {
        cf: { image: config },
      })

      if (!response.ok) {
        const status = response.status === 404 ? 404 : 502
        return jsonError(
          response.status === 404 ? 'Image not found' : 'Transformation failed',
          status,
        )
      }

      const res = new Response(response.body, response)
      // Cache determinístico e de longa duração (objectKey + preset fixos).
      res.headers.set('Cache-Control', CACHE_CONTROL)
      // Remove headers de origem que não fazem sentido na resposta.
      res.headers.delete('set-cookie')
      return res
    } catch {
      return jsonError('Image delivery failed', 502)
    }
  },
}