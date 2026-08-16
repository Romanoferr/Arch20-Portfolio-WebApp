#!/usr/bin/env node
/**
 * Gera arquivos HTML estáticos para cada rota da SPA.
 *
 * O GitHub Pages não executa JavaScript durante a indexação do Google.
 * Esta script cria pastas com index.html para cada rota, permitindo
 * que o Googlebot encontre e renderize as páginas corretamente.
 *
 * Além das rotas fixas, também pré-renderiza as páginas de detalhe de cada
 * projeto publicado (buscados no Supabase), para que o Google indexe
 * /projetos/{slug} sem depender de JavaScript.
 *
 * Nota: usa a REST API do Supabase via fetch (sem o cliente @supabase/supabase-js),
 * para não depender de WebSocket nativo (Node 22+) durante o build.
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const distDir = resolve(import.meta.dirname, '../dist')

const routes = ['/projetos', '/servicos', '/sobre', '/contato']

const sourceHtml = resolve(distDir, 'index.html')

if (!existsSync(sourceHtml)) {
  console.error('❌ dist/index.html not found. Run "npm run build" first.')
  process.exit(1)
}

async function fetchPublishedProjectSlugs() {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase env vars não definidas. Pulando pré-render de projetos.')
    return []
  }

  // Consulta a REST API do Supabase (PostgREST) diretamente via fetch.
  const url = new URL('/rest/v1/projects', SUPABASE_URL)
  url.searchParams.set('select', 'slug')
  url.searchParams.set('published', 'eq.true')

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!response.ok) {
    console.error(
      `❌ Falha ao buscar projetos para pré-render: HTTP ${response.status} ${response.statusText}`,
    )
    return []
  }

  const data = await response.json()
  return (Array.isArray(data) ? data : []).map((row) => row.slug).filter(Boolean)
}

function prerenderRoute(route) {
  const folderPath = resolve(distDir, route.slice(1))
  const targetPath = resolve(folderPath, 'index.html')

  mkdirSync(folderPath, { recursive: true })
  copyFileSync(sourceHtml, targetPath)

  console.log(`✅ Created ${targetPath}`)
}

async function main() {
  for (const route of routes) {
    prerenderRoute(route)
  }

  const projectSlugs = await fetchPublishedProjectSlugs()
  for (const slug of projectSlugs) {
    prerenderRoute(`/projetos/${slug}`)
  }

  console.log(`\n🎉 Prerendered ${routes.length + projectSlugs.length} routes for Google indexing.`)
}

main().catch((err) => {
  console.error('❌ Erro ao pré-renderizar rotas:', err)
  process.exit(1)
})