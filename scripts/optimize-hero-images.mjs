/**
 * Otimiza as imagens de hero para o bucket público `project-images`.
 *
 * O plano free do Supabase NÃO inclui Image Transformations, então os query
 * params (?width, ?quality) são ignorados e as imagens originais são servidas
 * em resolução cheia. Este script baixa cada imagem de hero, redimensiona para
 * as larguras usadas no site e converte para WebP (menor peso), reenviando ao
 * bucket com nomes versionados (ex.: `heroes/Cena_01_v.webp`).
 *
 * Como executar:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/optimize-hero-images.mjs
 *
 * Requisitos:
 *   - `sharp` instalado (npm i -D sharp)
 *   - `@supabase/supabase-js` (já é dependência)
 *   - Chave SERVICE_ROLE para upload (policy de storage exige autenticado)
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY como variáveis de ambiente.')
  process.exit(1)
}

const BUCKET = 'project-images'
const DEST_FOLDER = 'heroes'

// Mapeamento: caminho de origem no bucket -> larguras a gerar.
// As larguras correspondem aos breakpoints usados no srcset do Hero.
// TODO (por cliente): atualizar com os object keys reais dos heroes.
const HERO_IMAGES = {
  'heroes/hero-home.jpg': [800, 1200, 1600, 2000],
  'heroes/hero-sobre.jpg': [800, 1200, 1600, 2000],
  'heroes/hero-perfil.jpg': [400, 800, 1200],
  'heroes/hero-projetos.jpg': [800, 1200, 1600, 2000],
  'heroes/hero-servicos.jpg': [800, 1200, 1600, 2000],
  'heroes/hero-contato.jpg': [800, 1200, 1600, 2000],
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function download(sourcePath) {
  const { data, error } = await supabase.storage.from(BUCKET).download(sourcePath)
  if (error) throw error
  return Buffer.from(await data.arrayBuffer())
}

async function upload(destPath, buffer) {
  const { error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, {
    contentType: 'image/webp',
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
}

async function main() {
  console.log(`Bucket: ${BUCKET}/${DEST_FOLDER}`)
  for (const [sourcePath, widths] of Object.entries(HERO_IMAGES)) {
    try {
      console.log(`\n→ ${sourcePath}`)
      const original = await download(sourcePath)
      const baseName = sourcePath.split('/').pop().replace(/\.[^.]+$/, '')

      for (const width of widths) {
        const webp = await sharp(original)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer()

        const destPath = `${DEST_FOLDER}/${baseName}-${width}.webp`
        await upload(destPath, webp)
        console.log(`  ✓ ${destPath} (${(webp.length / 1024).toFixed(1)} KB)`)
      }
    } catch (err) {
      console.error(`  ✗ Falha em ${sourcePath}:`, err.message)
    }
  }
  console.log('\nConcluído.')
}

main()
