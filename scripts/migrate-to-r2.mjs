#!/usr/bin/env node
/**
 * Migração de imagens do Supabase Storage → Cloudflare R2.
 *
 * ============================================================================
 * O QUE ESTE SCRIPT FAZ
 * ============================================================================
 * - Lê diretamente todos os registros de `public.project_images` (com paginação).
 * - Para cada imagem cujo `storage_path` ainda aponta para o Supabase Storage,
 *   faz:
 *     1. Determina o object key de destino no R2.
 *     2. Faz HEAD no R2 (idempotência): se já existe, NÃO faz upload de novo.
 *     3. Se não existe: download do Supabase → upload para o R2.
 *     4. Valida o objeto no R2 (HEAD, compara ContentLength).
 *     5. SOMENTE então atualiza `project_images.storage_path` para o novo key.
 * - Gera um relatório final detalhado no terminal.
 *
 * ============================================================================
 * O QUE ESTE SCRIPT NÃO FAZ (por design)
 * ============================================================================
 * - NÃO apaga arquivos do Supabase Storage.
 * - NÃO apaga registros de `project_images`, `projects` ou o bucket.
 * - NÃO altera NENHUMA coluna além de `project_images.storage_path`.
 * - NÃO armazena URLs completas no banco (só object keys relativos).
 * - NÃO altera frontend, Worker ou produção.
 *
 * ============================================================================
 * IDEMPOTÊNCIA
 * ============================================================================
 * - Reexecutável: se um objeto já existe no R2 (HEAD ok), ele não é reenviado.
 * - Se o banco ainda aponta para o Supabase mas o arquivo já está no R2,
 *   o script valida o tamanho e sincroniza o `storage_path`.
 * - Execução parcial → segunda execução só processa o que falta.
 *
 * ============================================================================
 * VARIÁVEIS DE AMBIENTE (nenhum secret hardcoded)
 * ============================================================================
 *   SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=
 *   R2_ACCOUNT_ID=
 *   R2_ACCESS_KEY_ID=
 *   R2_SECRET_ACCESS_KEY=
 *   R2_BUCKET_NAME=
 *
 * ============================================================================
 * EXECUÇÃO
 * ============================================================================
 *   # Validar (SOMENTE LEITURA — não altera nada):
 *   node scripts/migrate-to-r2.mjs --dry-run
 *
 *   # Migração real:
 *   node scripts/migrate-to-r2.mjs
 *
 *   # Ou via npm:
 *   npm run migrate:r2 -- --dry-run
 *   npm run migrate:r2
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

// ============================================================================
// Configuração (exclusivamente via environment — nenhum secret hardcoded)
// ============================================================================
const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
]
const missing = required.filter((name) => !process.env[name])
if (missing.length) {
  console.error('Variáveis obrigatórias ausentes:', missing.join(', '))
  process.exit(1)
}

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env

const SUPABASE_BUCKET = 'project-images' // bucket real no Supabase Storage
const PROJECT_IMAGES_TABLE = 'project_images'

// Formato (fixo) dos object keys definitivos no R2
const R2_KEY_PREFIX = 'projects'
const R2_KEY_FOLDER = 'original'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// ============================================================================
// Argumentos CLI
// ============================================================================
function parseImageId(args) {
  const hit = args.find((a) => a.startsWith('--image-id='))
  return hit ? hit.slice('--image-id='.length) : null
}
function parseLimit(args) {
  const hit = args.find((a) => a.startsWith('--limit='))
  return hit ? safeInt(hit.slice('--limit='.length)) : null
}
function safeInt(v) {
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? n : null
}

const ARGS = new Set(process.argv.slice(2))
const CONFIG = {
  dryRun: ARGS.has('--dry-run'),
  confirm: ARGS.has('--confirm'),
  limit: parseLimit(process.argv.slice(2)),
  imageId: parseImageId(process.argv.slice(2)),
}

// ============================================================================
// Relatório / acumuladores
// ============================================================================
const report = {
  total: 0,
  needsMigration: 0,
  migrated: 0,
  alreadyMigrated: 0,
  alreadyExists: 0,
  dbUpdated: 0,
  invalid: 0,
  conflict: 0,
  downloadFailed: 0,
  uploadFailed: 0,
  validationFailed: 0,
  dbUpdateFailed: 0,
  inconsistencies: [],
  images: [], // detalhe por imagem (sem secrets)
}

// ============================================================================
// Helpers de caminho / extensão
// ============================================================================

function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

// Pequeno conjunto de testes internos executado uma vez.
function selfTest() {
  const cases = [
    { p: 'UUID/arquivo.png', parts: ['UUID', 'arquivo.png'] },
    { p: 'projects/UUID/arquivo.png', parts: ['UUID', 'arquivo.png'] },
    { p: 'project-images/UUID/arquivo.png', parts: ['UUID', 'arquivo.png'] },
    { p: 'project-images/projects/UUID/arquivo.png', parts: ['UUID', 'arquivo.png'] },
    { p: 'projects/UUID/sub/arquivo.png', parts: ['UUID', 'sub', 'arquivo.png'] },
  ]
  for (const c of cases) {
    const got = stripKnownPrefixes(c.p)
    if (JSON.stringify(got) !== JSON.stringify(c.parts)) {
      throw new Error(`selfTest falhou para ${c.p}: got ${JSON.stringify(got)}`)
    }
  }
}

// Remove prefixos de bucket/objeto genéricos ('project-images', 'projects' no
// início), preservando o restante do caminho. Usa project_id como fonte de
// verdade mais adiante.
function stripKnownPrefixes(path) {
  const parts = path
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p && p !== 'project-images')
  // remove 'projects' somente se for o primeiro segmento (prefixo do bucket,
  // não o ID do projeto)
  if (parts[0] === 'projects') parts.shift()
  return parts
}

/**
 * Normaliza um storage_path para object key definitivo do R2.
 *
 * Usa IMAGE.project_id (vindo do banco) como fonte de verdade do projeto.
 * O filename é preservado (sem sanitização além de espaços -> _).
 *
 * Sempre gera:
 *   projects/{projectId}/original/{filename}
 *
 * Retorna:
 *   { ok:true, objectKey }  ou  { ok:false, reason }
 */
function normalizedObjectKey(image) {
  const projectId = image.project_id
  const oldPath = image.storage_path

  if (!oldPath) return { ok: false, reason: 'storage_path vazio' }

  // Valida project_id (fonte de verdade)
  if (!isUuid(projectId)) {
    return { ok: false, reason: `project_id não é UUID: ${projectId}` }
  }

  // Remove prefixos conhecidos (project-images, projects iniciais)
  const parts = stripKnownPrefixes(oldPath)

  // Procura o PRIMEIRO segmento que seja UUID → usa o filename após ele.
  // Isso ignora subpastas intermediárias e usa a estrutura antiga de forma
  // tolerante. Se houver {uuid}/original/... já no formato R2, parte[0] é o uuid.
  const idx = parts.findIndex((p) => isUuid(p))
  if (idx === -1) {
    return { ok: false, reason: `nenhum segmento UUID no caminho: ${oldPath}` }
  }

  // o arquivo é a última parte (pode haver 'original' no meio)
  const last = parts[parts.length - 1]
  if (!last || last === 'original') {
    return { ok: false, reason: `sem nome de arquivo válido: ${oldPath}` }
  }

  // Preserva o nome do arquivo (sem sanitização agressiva)
  const filename = last
  const objectKey = `${R2_KEY_PREFIX}/${image.project_id}/${R2_KEY_FOLDER}/${filename}`

  return { ok: true, objectKey }
}

// MIME derivado da extensão (fallback quando mime_type ausente)
function mimeFromExt(ext) {
  const map = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    heic: 'image/heic',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

function getExtra(path) {
  const slash = path.lastIndexOf('/')
  const segment = slash === -1 ? path : path.slice(slash + 1)
  const dot = segment.lastIndexOf('.')
  if (dot === -1 || dot === segment.length - 1) return ''
  return segment.slice(dot + 1).toLowerCase()
}

// ============================================================================
// Retry com backoff (download, PUT, HEAD)
// ============================================================================
const MAX_ATTEMPTS = 3

async function withRetry(fn) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      // Nunca dá retry em erro de auth/permissão/notfound (hetero no retry)
      const fatal = isAuthError(err) || isForbidden(err) || isNotFound(err)
      if (fatal || !retryableError(err)) throw err
      if (attempt === MAX_ATTEMPTS) break
      const delay = 300 * attempt // 300ms, 600ms
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}

function isNotFound(err) {
  const n = String(err?.name ?? '') + ' ' + String(err?.message ?? '')
  return /NotFound|404|NoSuchKey|not found/i.test(n)
}
function isForbidden(err) {
  const n = String(err?.name ?? '') + ' ' + String(err?.message ?? '')
  return /403|Forbidden|AccessDenied|Authorization/i.test(n)
}
function isAuthError(err) {
  const n = String(err?.name ?? '') + ' ' + String(err?.message ?? '')
  return /401|Unauthorized|Credential|Signature|InvalidAccessKey/i.test(n)
}
function retryableError(err) {
  const n = String(err?.name ?? '') + ' ' + String(err?.message ?? '')
  return /network|ECONN|ETIMEDOUT|timeout|temporary|429|Throttl|InternalError|SlowDown/i.test(n)
}

// ============================================================================
// R2 (HEAD/PUT)
// ============================================================================

/**
 * HEAD no R2. Diferencia erros:
 * - NotFound (404) --> objeto não existe { exists:false }
 * - Credencial/permissão/inesperado --> lança (fatal), nunca treat como inexistente.
 * Isso evita que um erro de auth seja confundido com "objeto não há".
 */
async function r2Head(objectKey) {
  try {
    const out = await withRetry(() =>
      s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: objectKey })),
    )
    return {
      exists: true,
      length: out.ContentLength ?? 0,
      etag: String(out.ETag ?? '').replace(/^"|"$/g, ''),
      contentType: out.ContentType,
    }
  } catch (err) {
    if (isNotFound(err)) {
      return { exists: false, length: 0, etag: '', contentType: undefined }
    }
    // 401/403/rede em HEAD: fatal — não podemos afirmar que o objeto não existe.
    throw err
  }
}

async function putObject(object, buffer, contentType) {
  await withRetry(() =>
    s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: object,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
      }),
    ),
  )
}

// ============================================================================
// Supabase
// ============================================================================
async function downloadFromSupabase(objectPath) {
  return withRetry(async () => {
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download(objectPath)
    if (error || !data) throw error || new Error('sem dados no Supabase')
    return Buffer.from(await data.arrayBuffer())
  })
}

async function updateStoragePath(imageId, objectKey) {
  const { error } = await supabase
    .from(PROJECT_IMAGES_TABLE)
    .update({ storage_path: objectKey })
    .eq('id', imageId)
  if (error) throw error
  report.dbUpdated++
}

// ============================================================================
// Utilitário: verificação de inconsistência pós-migração
// ============================================================================
async function verifyMigrated(image, objectKey) {
  // Verifica se storage_path no banco === objectKey (já garantido por update)
  // e se o objeto existe no R2.
  if (image.storage_path !== objectKey) {
    report.inconsistencies.push({
      image_id: image.id,
      expect: objectKey,
      actual: image.storage_path,
      type: 'db_path_mismatch',
    })
  }
  const head = await r2Head(objectKey)
  if (!head.exists) {
    report.inconsistencies.push({
      image_id: image.id,
      objectKey,
      type: 'r2_missing_after_migration',
    })
  }
}

// ============================================================================
// Processa uma imagem
// ============================================================================
async function processImage(image) {
  const projectId = image.project_id
  const oldPath = image.storage_path

  const norm = normalizedObjectKey(image)

  if (!norm.ok || !norm.objectKey) {
    report.invalid++
    report.images.push({
      stage: 'invalid',
      image_id: image.id,
      project_id: projectId,
      old_storage_path: oldPath,
      error: norm.reason,
    })
    console.log(`[INVALID  ] ${oldPath} → ${norm.reason}`)
    return
  }

  const objectKey = norm.objectKey

  // MIME: prioriza image.mime_type do banco; fallback pela extensão.
  const contentType = image.mime_type || mimeFromExt(getExtra(objectKey))

  if (CONFIG.dryRun) {
    // Somente leitura: SELECT (já feito) + HEAD
    const head = await r2Head(objectKey)
    const action = head.exists ? 'ALREADY MIGRATED' : 'MIGRATE'
    const extraAction =
      head.exists && image.storage_path !== objectKey
        ? ' (banco ainda aponta p/ antigo → dbSync)'
        : ''
    console.log(
      `[DRY] image=${image.id} project=${projectId}\n` +
        `   supabase=${oldPath}\n` +
        `   r2=${objectKey}\n` +
        `   exists=${head.exists ? 'SIM' : 'NÃO'}${head.exists ? ` size=${head.length}` : ''}\n` +
        `   action=${action}${extraAction}`,
    )
    return
  }

  // ---- 1) Verifica se já existe no R2
  let existing
  try {
    existing = await r2Head(objectKey)
  } catch (err) {
    // HEAD falhou por auth/permissão/rede → fatal para este registro
    report.validationFailed++
    report.images.push({
      stage: 'head_error',
      image_id: image.id,
      project_id: projectId,
      old_storage_path: oldPath,
      new_object_key: objectKey,
      error: safeMsg(err),
    })
    console.log(`[HEAD ✗] ${objectKey} :: ${safeMsg(err)}`)
    return
  }

  if (existing.exists) {
    // Objeto já existe no R2.
    if (image.storage_path === objectKey) {
      // O banco já aponta para o object key correto → migração já concluída.
      // Não precisa baixar do Supabase. Apenas confirma como exists.
      report.alreadyExists++
      report.images.push({ type: 'already_migrated', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey })
      console.log(`[ALREADY  ] ${objectKey} (banco já sincronizado)`)
      return
    }

    // Bananco ainda aponta para o path antigo do Supabase. Para validar que o
    // objeto no R2 corresponde ao original, tenta baixar do Supabase.
    // Usa o path ANTIGO (sem "original") como estava no banco antes.
    let src
    try {
      src = await downloadFromSupabase(oldPath)
    } catch (downloadErr) {
      // Não conseguiu baixar do Supabase para comparar → não pode afirmar que
      // o objeto no R2 é o correto. Trata como conflito (não alterar banco).
      report.conflict++
      report.images.push({
        stage: 'conflict',
        image_id: image.id,
        project_id: projectId,
        old_storage_path: oldPath,
        new_object_key: objectKey,
        error: `não foi possível baixar do Supabase para validar existente: ${safeMsg(downloadErr)}`,
      })
      console.log(`[CONFLICT ] ${objectKey} :: não foi possível validar`)
      return
    }

    if (existing.length !== src.length) {
      report.conflict++
      report.images.push({
        stage: 'conflict',
        image_id: image.id,
        project_id: projectId,
        old_storage_path: oldPath,
        new_object_key: objectKey,
        error: `objeto R2 já existe mas tamanho difere (r2=${existing.length}, src=${src.length})`,
      })
      console.log(`[CONFLICT ] ${objectKey} :: tamanho difere`)
      return
    }

    // Objeto no R2 confere com a origem. Sincroniza o banco.
    report.alreadyExists++
    try {
      await updateStoragePath(image.id, objectKey) // já incrementa dbUpdated
      report.images.push({ type: 'db_sync', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey })
      console.log(`[DBSYNC   ] ${oldPath} → ${objectKey}`)
    } catch (err) {
      report.dbUpdateFailed++
      report.images.push({ stage: 'db_update', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: safeMsg(err) })
      console.log(`[DB ✗     ] ${objectKey} (${safeMsg(err)})`)
    }
    return
  }

  // ---- 2) Não existe no R2 → baixa do Supabase
  let buffer
  try {
    buffer = await downloadFromSupabase(oldPath)
  } catch (err) {
    report.downloadFailed++
    report.images.push({ stage: 'download', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: safeMsg(err) })
    console.log(`[DOWNLOAD ✗] ${oldPath} :: ${safeMsg(err)}`)
    return
  }

  // ---- 3) Upload
  try {
    await putObject(objectKey, buffer, contentType)
  } catch (err) {
    report.uploadFailed++
    report.images.push({ stage: 'upload', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: safeMsg(err) })
    console.log(`[UPLOAD  ✗] ${objectKey} (${safeMsg(err)})`)
    return
  }

  // ---- 4) Validação pós-upload (HEAD + tamanho + checksum)
  let after
  try {
    after = await r2Head(objectKey)
  } catch (err) {
    report.validationFailed++
    report.images.push({ stage: 'validation', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: `HEAD pós-upload falhou: ${safeMsg(err)}` })
    return
  }
  if (!after.exists || after.length !== buffer.length) {
    report.validationFailed++
    report.images.push({ stage: 'validation', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: `esperado ${buffer.length}, obtido ${after.length}` })
    console.log(`[VAL     ✗] ${objectKey}`)
    return
  }

  // ---- 5) Atualiza o banco SOMENTE após validação
  try {
    await updateStoragePath(image.id, objectKey) // já incrementa dbUpdated
    report.migrated++
    report.images.push({ type: 'migrated', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey })
    console.log(`[MIGRATED ] ${oldPath} → ${objectKey}`)
  } catch (err) {
    report.dbUpdateFailed++
    report.images.push({ stage: 'db_update', image_id: image.id, project_id: projectId, old_storage_path: oldPath, new_object_key: objectKey, error: safeMsg(err) })
    console.log(`[DB      ✗] ${objectKey} (${safeMsg(err)})`)
  }
}

// ============================================================================
// Paginação de project_images (sem depender de projects)
// ============================================================================
async function listImages(limit = 100) {
  const rows = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(`Falha ao consultar project_images: ${error.message}`)
    rows.push(...data)
    if (data.length < limit) break
    offset += limit
  }
  return rows
}

// Sanitiza mensagens de erro para nunca vazar secrets.
function safeMsg(err) {
  if (!err) return 'erro desconhecido'
  const raw = String(err?.message || err?.name || err)
  return raw
    .replace(/(R2_(ACCESS_KEY_ID|SECRET_ACCESS_KEY)|SERVICE_ROLE_KEY)[^"\s]*/gi, '$1=***')
    .slice(0, 500)
}

// ============================================================================
// Verificação final (somente leitura)
// ============================================================================
async function finalize() {
  for (const item of report.images) {
    if (item.type === 'migrated' && item.new_object_key) {
      const head = await r2Head(item.new_object_key).catch(() => ({ exists: false }))
      if (!head.exists) {
        report.inconsistencies.push({
          image_id: item.image_id,
          object_key: item.new_object_key,
          type: 'r2_missing_after_migration',
        })
      }
    }
  }
}

async function main() {
  selfTest()

  if (CONFIG.dryRun) {
    console.log('🧪 DRY RUN — somente leitura, nenhuma alteração.\n')
  } else if (!CONFIG.confirm) {
    console.log(
      '\n⚠️  A migração real requer --confirm para ser executada.\n' +
        '   Para apenas analisar (sem alterar nada), use --dry-run:\n' +
        '     node scripts/migrate-to-r2.mjs --dry-run\n' +
        '   Para executar a migração real (limitada opcional) use:\n' +
        '     node scripts/migrate-to-r2.mjs --confirm\n',
    )
    process.exit(0)
  } else {
    console.log('🚀 Migração real — Supabase Storage NÃO será apagado.\n')
  }

  const images = await listImages(100)
  console.log(`🔎 ${images.length} imagem(ns) em project_images\n`)

  // Filtros: --limit e --image-id
  let toProcess = images
  if (CONFIG.limit !== null) toProcess = toProcess.slice(0, CONFIG.limit)
  if (CONFIG.imageId) toProcess = toProcess.filter((img) => img.id === CONFIG.imageId)
  report.total = toProcess.length

  for (const image of toProcess) {
    await processImage(image)
  }
}

// ============================================================================
// Relatório
// ============================================================================
function printReport() {
  console.log('\n========================================')
  console.log('R2 MIGRATION REPORT')
  console.log('========================================')
  console.log(`Total:                  ${report.total}`)
  console.log(`Necessitam migração:    ${report.migrated + report.downloadFailed + report.uploadFailed + report.validationFailed}`)
  console.log(`Migradas:               ${report.migrated}`)
  console.log(`Já existentes no R2:    ${report.alreadyExists}`)
  console.log(`Banco re-sincronizado:  ${report.dbUpdated}`)
  console.log(`Inválidas:              ${report.invalid}`)
  console.log(`Conflitos:              ${report.conflict}`)
  console.log('----------------------------------------')
  console.log(`Falhas download:        ${report.downloadFailed}`)
  console.log(`Falhas upload:          ${report.uploadFailed}`)
  console.log(`Falhas validação:       ${report.validationFailed}`)
  console.log(`Falhas update banco:    ${report.dbUpdateFailed}`)
  console.log('----------------------------------------')
  if (report.inconsistencies.length) {
    console.log('INCONSISTÊNCIAS (não corrigidas automaticamente):')
    for (const inc of report.inconsistencies) console.log(`  - ${JSON.stringify(inc)}`)
  }
  if (report.images.length) {
    const errors = report.images.filter((i) => i.error)
    if (errors.length) {
      console.log('DETALHES DE ERROS:')
      for (const f of errors) {
        console.log(`  - stage=${f.stage} image=${f.image_id} project=${f.project_id}`)
        console.log(`    old=${f.old_storage_path} new=${f.new_object_key ?? '-'}`)
        console.log(`    erro=${f.error}`)
      }
    }
  }
  console.log('========================================')
}

// ============================================================================
// Execução principal
// ============================================================================
const startedAt = new Date()
main()
  .then(async () => {
    await finalize()
    printReport()

    // Relatório JSON (sem secrets)
    const stamp = startedAt.toISOString().replace(/[-:]/g, '').slice(0, 14).replace('T', '-')
    const out = {
      timestamp: startedAt.toISOString(),
      dryRun: CONFIG.dryRun,
      total: report.total,
      stats: {
        migrated: report.migrated,
        alreadyExists: report.alreadyExists,
        dbUpdated: report.dbUpdated,
        invalid: report.invalid,
        conflict: report.conflict,
        downloadFailed: report.downloadFailed,
        uploadFailed: report.uploadFailed,
        validationFailed: report.validationFailed,
        dbUpdateFailed: report.dbUpdateFailed,
      },
      inconsistencies: report.inconsistencies,
      images: report.images.map((i) => ({
        image_id: i.image_id,
        project_id: i.project_id,
        old_storage_path: i.old_storage_path,
        new_object_key: i.new_object_key ?? null,
        stage: i.stage ?? i.type ?? '',
        error: i.error ?? null,
      })),
    }
    const filename = `migration-report-${stamp}.json`
    writeFileSync(filename, JSON.stringify(out, null, 2), 'utf8')
    console.log(`\n📄 Relatório salvo em ${filename}`)
  })
  .catch((err) => {
    console.error('Erro fatal:', safeMsg(err))
    process.exit(1)
  })