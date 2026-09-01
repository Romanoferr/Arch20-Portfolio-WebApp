/**
 * Cloudflare Worker — Capa segura para Cloudflare R2.
 *
 * Este Worker é o ÚNICO lugar onde vivem as credenciais R2
 * (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). O frontend React NUNCA
 * deve ter acesso a elas.
 *
 * Endpoints:
 *   POST /api/upload   → valida sessão Supabase, gera presigned PUT URL R2
 *   DELETE /api/delete → valida sessão Supabase, elimina objeto R2
 *
 * Seguridad:
 *   - Valida o JWT de Supabase (sessão Admin) em cada operação, usando o
 *     JWKS público do Supabase (ES256).
 *   - Nunca expone credenciais R2 ao cliente.
 *   - CORS restringido ao domínio do site.
 *
 * Como desplegar:
 *   wrangler deploy  (ou colar este código no editor do Worker no Dashboard)
 *
 * Variables de entorno (secrets no Worker):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
 *   ALLOWED_ORIGIN
 *
 * Nota: a validação de sessão NÃO usa SUPABASE_JWT_SECRET. Os tokens ES256
 * são validados com o JWKS público do Supabase.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// ---------------------------------------------------------------------------
// Supabase Auth — JWKS pública (validação JWT ES256)
// O issuer/URL são constantes (não são secrets). As chaves são buscadas
// remotamente e cacheadas pelo createRemoteJWKSet.
// ---------------------------------------------------------------------------
const SUPABASE_ISSUER = 'https://etmykncryrcjbgiuoea.supabase.co/auth/v1'
const SUPABASE_JWKS_URL =
  'https://etmykncryrcjbgiuoea.supabase.co/auth/v1/.well-known/jwks.json'

// Conjunto de chaves públicas remoto (JWKS) com cache interno.
const supabaseJWKS = createRemoteJWKSet(new URL(SUPABASE_JWKS_URL))

// ---------------------------------------------------------------------------
// CORS — espelha dinamicamente o Origin da request, SE ele estiver na lista
// de origens permitidas (ALLOWED_ORIGINS, separada por vírgula). Isso permite
// desenvolvimento em localhost E produção sem fixar um único valor.
// ---------------------------------------------------------------------------
function isOriginAllowed(env, origin) {
  if (!origin) {
    return false
  }
  const raw = env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || ''
  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return allowed.includes(origin)
}

function buildCorsHeaders(env, origin) {
  // Só ecoa o Origin se ele for permitido. Se não houver Origin (ex.: curl),
  // não define Access-Control-Allow-Origin.
  const allowedOrigin = isOriginAllowed(env, origin) ? origin : ''
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
  }
  return headers
}

function json(body, status = 200, env, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(env, origin) },
  })
}

// ---------------------------------------------------------------------------
// Verificación de la sesión de Supabase (JWT ES256 via JWKS)
// ---------------------------------------------------------------------------
async function verifySupabaseSession(authorization) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }

  const token = authorization.slice(7)

  try {
    const { payload } = await jwtVerify(token, supabaseJWKS, {
      issuer: SUPABASE_ISSUER,
      algorithms: ['ES256'],
    })

    // Exige claims relevantes para o fluxo administrativo.
    if (!payload.sub || !payload.role) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Presigned URLs para R2 (via @aws-sdk/s3-request-presigner)
// ---------------------------------------------------------------------------
function createR2Client(env) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
}

async function buildPresignedUrl(method, objectKey, env, expiresIn = 3600) {
  const s3Client = createR2Client(env)

  if (method === 'PUT') {
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
    })
    return getSignedUrl(s3Client, command, { expiresIn })
  }

  if (method === 'DELETE') {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
    })
    return getSignedUrl(s3Client, command, { expiresIn })
  }

  throw new Error(`Método não suportado para presigning: ${method}`)
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
async function handleUpload(request, env) {
  const origin = request.headers.get('Origin')
  const session = await verifySupabaseSession(request.headers.get('Authorization'))
  if (!session) {
    return json({ error: 'No autorizado' }, 401, env, origin)
  }

  const body = await request.json()
  const { projectId, filename, contentType } = body

  if (!projectId || !filename || !contentType) {
    return json({ error: 'Faltan campos: projectId, filename, contentType' }, 400, env, origin)
  }

  // Genera un object key único y organizado
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const objectKey = `projects/${projectId}/original/${crypto.randomUUID()}.${ext}`

  const uploadUrl = await buildPresignedUrl('PUT', objectKey, env)

  return json({ objectKey, uploadUrl }, 200, env, origin)
}

async function handleDelete(request, env) {
  const origin = request.headers.get('Origin')
  const session = await verifySupabaseSession(request.headers.get('Authorization'))
  if (!session) {
    return json({ error: 'No autorizado' }, 401, env, origin)
  }

  const body = await request.json()
  const { objectKey } = body

  if (!objectKey) {
    return json({ error: 'Falta objectKey' }, 400, env, origin)
  }

  // Elimina el objeto de R2 (firma DELETE)
  const deleteUrl = await buildPresignedUrl('DELETE', objectKey, env)
  const res = await fetch(deleteUrl, { method: 'DELETE' })

  if (!res.ok) {
    return json({ error: `Falha ao eliminar objeto: ${res.status}` }, 500, env, origin)
  }

  return json({ ok: true }, 200, env, origin)
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(env, origin),
      })
    }

    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/api/upload') {
      return handleUpload(request, env)
    }

    if (request.method === 'DELETE' && url.pathname === '/api/delete') {
      return handleDelete(request, env)
    }

    return json({ error: 'Not found' }, 404, env, origin)
  },
}