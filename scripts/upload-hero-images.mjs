/**
 * Script de migração das imagens de hero para o bucket público `project-images`.
 *
 * As imagens de hero (Home, Sobre, Projetos, Contato) estavam em um bucket
 * privado (`Arch20-Portfolio-Storage`) acessado via URLs assinadas com token
 * expirante embutidas no código. Este script baixa essas imagens das URLs
 * atuais e as reenvia para o bucket público `project-images/heroes/`, gerando
 * URLs públicas estáveis.
 *
 * Como executar:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/upload-hero-images.mjs
 *
 * Requisitos:
 *   - `@supabase/supabase-js` instalado (já é dependência do projeto)
 *   - A chave SERVICE_ROLE (ou uma sessão autenticada) para upload, pois a
 *     policy de storage exige usuário autenticado.
 *   - As URLs de origem ainda válidas (não expiradas).
 */

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY como variáveis de ambiente.',
  )
  process.exit(1)
}

const BUCKET = 'project-images'
const DEST_FOLDER = 'heroes'

// Mapeamento: caminho de destino no bucket público -> URL assinada de origem.
const HERO_IMAGES = {
  'heroes/Cena_01_v.png':
    'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Inicio/Cena_01_v.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIEluaWNpby9DZW5hXzAxX3YucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTk2ODY0OSwiZXhwIjoyMTAxMzI4NjQ5fQ.yFlB8tglyPZVGie0ugNov5CkzqKRgYYtFRdk5AFb0us',
  'heroes/Cena_02.png':
    'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Sobre/Cena_02.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFNvYnJlL0NlbmFfMDIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDQwMzAzNSwiZXhwIjoyMDk5NzYzMDM1fQ.w5FTbZIWq9cgCD31VxZRfbp0BH4GaIuEBLUm90RU9n8',
  'heroes/sala_01.png':
    'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Projeto/sala_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFByb2pldG8vc2FsYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NDAzMTYxLCJleHAiOjIwOTk3NjMxNjF9.n4_9xpK7ywHJn0CxjQkdGhp2wtEjpGWJtW8zbdlkNv4',
  'heroes/Cena_13.png':
    'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Contato/Cena_13.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIENvbnRhdG8vQ2VuYV8xMy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NDAyODg5LCJleHAiOjIwOTk3NjI4ODl9.0-o5SbupMIOqLV4wlMf0wR1jpoC046GySXX4TCV2lck',
  'heroes/sobre.jpg':
    'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Sobre/sobre.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFNvYnJlL3NvYnJlLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg4OTgsImV4cCI6MjEwMTMyODg5OH0.x-B-FCqI4JJVvEnjeFkgguA8YhHlUNGMZh46JnbqWhQ',
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Falha ao baixar ${url}: ${res.status} ${res.statusText}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function upload(destPath, buffer) {
  const ext = destPath.split('.').pop()?.toLowerCase()
  const contentType =
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destPath, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    })
  if (error) throw error
}

async function main() {
  console.log(`Bucket: ${BUCKET}/${DEST_FOLDER}`)
  for (const [destPath, sourceUrl] of Object.entries(HERO_IMAGES)) {
    try {
      console.log(`\n→ ${destPath}`)
      const buffer = await download(sourceUrl)
      console.log(`  Baixado (${(buffer.length / 1024).toFixed(0)} KB)`)
      await upload(destPath, buffer)
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath)
      console.log(`  Upload OK → ${data.publicUrl}`)
    } catch (err) {
      console.error(`  ERRO em ${destPath}:`, err.message)
    }
  }
  console.log('\nConcluído.')
}

main()