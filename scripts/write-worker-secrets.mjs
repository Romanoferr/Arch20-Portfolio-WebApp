#!/usr/bin/env node
/**
 * Escreve um arquivo de secrets no formato .env para o `wrangler deploy
 * --secrets-file`, a partir de variáveis de ambiente injetadas pelo CI.
 *
 * Uso (no GitHub Actions):
 *   WRANGLER_SECRETS="SUPABASE_SERVICE_ROLE_KEY R2_ACCOUNT_ID R2_BUCKET_NAME" \
 *   node scripts/write-worker-secrets.mjs worker/secrets.env
 *
 * Segurança:
 *  - As variáveis são lidas de `process.env` e escritas no disco; nada é
 *    impresso no stdout/stderr.
 *  - O arquivo é temporário (apenas para o passo de deploy) e NUNCA versionado
 *    (ver .gitignore).
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const outPath = resolve(process.argv[2] || 'secrets.env')
const keys = (process.env.WRANGLER_SECRETS || '')
  .split(/\s+/)
  .map((s) => s.trim())
  .filter(Boolean)

if (keys.length === 0) {
  console.log('::notice::Nenhum secret definido (WRANGLER_SECRETS vazio).')
  process.exit(0)
}

const lines = keys.map((key) => {
  const value = process.env[key]
  // Substitui quebras de linha — formato .env não suporta multi-linha.
  const safe = (value ?? '').replace(/\r?\n/g, '\\n')
  return `${key}=${safe}`
})

writeFileSync(resolve(outPath), `${lines.join('\n')}\n`, 'utf-8')
console.log(`::notice::Arquivo de secrets criado (${keys.length} chaves).`)