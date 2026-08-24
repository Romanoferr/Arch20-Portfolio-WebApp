#!/usr/bin/env node
/**
 * Move as imagens de hero de Projetos e Serviços para a pasta `heroes` do R2
 * e gera as versões WebP otimizadas (para `optimizedHeroSrc`).
 *
 * As imagens de hero atualmente apontam para dentro de `projects/{id}/original/{uuid}.png`,
 * mas como são usadas como heroes das páginas, faz sentido agrupar em `heroes/`.
 *
 * Observação: NÃO removemos a cópia original em `projects/{id}/original/`, pois
 * elas também são imagens dos projetos (galeria/detalhe). Aqui apenas COPIAMOS
 * para um object key canônico em `heroes/`.
 *
 * Object keys gerados:
 *   heroes/{uuid}.png                        (original, cópia)
 *   heroes/{uuid}-{width}.webp               (versões otimizadas)
 *
 * Variáveis de ambiente:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 *
 * Execução:
 *   node scripts/move-heroes-to-r2.mjs
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import sharp from 'sharp'

const required = [
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

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// Imagens-fonte (originais no R2) -> base name no diretório heroes/
const HERO_SOURCES = [
  {
    src: 'projects/86deef54-8cb6-4d19-8f93-33cc74cc5a06/original/d2315cb1-68a0-4760-bf97-4249af291c99.png',
    base: 'd2315cb1-68a0-4760-bf97-4249af291c99', // hero da página Projetos
  },
  {
    src: 'projects/91a19049-bb49-4d14-85c9-c697be946350/original/1ac7d3b7-0637-4e34-8d0e-e8f9ec032aad.png',
    base: '1ac7d3b7-0637-4e34-8d0e-e8f9ec032aad', // hero da página Serviços
  },
]

// Mesmas larguras usadas no srcset full-width do Hero.
const WIDTHS = [800, 1200, 1600, 2000]

async function r2Head(key) {
  try {
    const out = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))
    return { exists: true, length: out.ContentLength ?? 0 }
  } catch (err) {
    if (/NotFound|404|NoSuchKey|not found/i.test(String(err?.name ?? '') + ' ' + String(err?.message ?? ''))) {
      return { exists: false, length: 0 }
    }
    throw err
  }
}

async function main() {
  for (const { src, base } of HERO_SOURCES) {
    console.log(`\n→ Origem: ${src}`)

    // 1) Baixa a imagem original do R2 (acesso assinado via SDK S3)
    console.log('   Baixando via SDK S3...')
    const get = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: src }))
    const buffer = Buffer.from(await get.Body.transformToByteArray())

    // 2) Copia o original para heroes/{base}.png (se ainda não existir)
    const origKey = `heroes/${base}.png`
    const origHead = await r2Head(origKey)
    if (!origHead.exists) {
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: origKey,
          Body: buffer,
          ContentType: 'image/png',
        }),
      )
      console.log(`   ✓ ${origKey} (${(buffer.length / 1024).toFixed(1)} KB)`)
    } else {
      console.log(`   = ${origKey} já existe (${(origHead.length / 1024).toFixed(1)} KB)`)
    }

    // 3) Gera e envia as versões WebP otimizadas
    for (const width of WIDTHS) {
      const webpKey = `heroes/${base}-${width}.webp`
      const exists = await r2Head(webpKey)
      if (exists.exists) {
        console.log(`   = ${webpKey} já existe`)
        continue
      }
      const webp = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: webpKey,
          Body: webp,
          ContentType: 'image/webp',
        }),
      )
      console.log(`   ✓ ${webpKey} (${(webp.length / 1024).toFixed(1)} KB)`)
    }
  }

  console.log('\nConcluído.')
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('Falha:', err)
    process.exit(1)
  },
)