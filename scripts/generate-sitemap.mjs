#!/usr/bin/env node
/**
 * Gera o sitemap.xml dinamicamente, incluindo as páginas de detalhe de cada
 * projeto publicado (buscados no Supabase).
 *
 * O sitemap estático em public/sitemap.xml só contém as rotas fixas. Este
 * script consulta a tabela `projects` (published = true) e adiciona as URLs
 * /projetos/{slug}, garantindo que o Google indexe todas as páginas de projeto.
 *
 * Como executar (durante o build/deploy):
 *   VITE_SUPABASE_URL=<url> VITE_SUPABASE_ANON_KEY=<anon> node scripts/generate-sitemap.mjs
 *
 * Se as variáveis do Supabase não estiverem definidas, o script mantém o
 * sitemap estático existente (apenas rotas fixas) e não falha.
 *
 * Nota: usa a REST API do Supabase via fetch (sem o cliente @supabase/supabase-js),
 * para não depender de WebSocket nativo (Node 22+) durante o build.
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://brunacamara-arq.com.br'
const PUBLIC_DIR = resolve(__dirname, '../public')
const SITEMAP_PATH = resolve(PUBLIC_DIR, 'sitemap.xml')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

/** Rotas fixas do site (mesmas do sitemap estático). */
// URLs usam trailing slash porque o GitHub Pages serve diretórios físicos
// (dist/sobre/index.html) e redireciona /sobre -> /sobre/ (301).
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/projetos/', changefreq: 'weekly', priority: '0.9' },
  { path: '/servicos/', changefreq: 'monthly', priority: '0.8' },
  { path: '/sobre/', changefreq: 'monthly', priority: '0.7' },
  { path: '/contato/', changefreq: 'monthly', priority: '0.7' },
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(projectSlugs) {
  const urls = STATIC_ROUTES.map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.path === '/' ? '/' : route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )

  for (const slug of projectSlugs) {
    urls.push(`  <url>
    <loc>${SITE_URL}/projetos/${escapeXml(slug)}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

async function fetchPublishedProjectSlugs() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      '⚠️  VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não definidas. Mantendo sitemap estático.',
    )
    return []
  }

  // Consulta a REST API do Supabase (PostgREST) diretamente via fetch.
  // Filtra published=true e ordena por "order". Retorna apenas o campo slug.
  const url = new URL('/rest/v1/projects', SUPABASE_URL)
  url.searchParams.set('select', 'slug')
  url.searchParams.set('published', 'eq.true')
  url.searchParams.set('order', 'order.asc')

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!response.ok) {
    console.error(
      `❌ Falha ao buscar projetos para o sitemap: HTTP ${response.status} ${response.statusText}`,
    )
    return []
  }

  const data = await response.json()
  return (Array.isArray(data) ? data : []).map((row) => row.slug).filter(Boolean)
}

async function main() {
  const slugs = await fetchPublishedProjectSlugs()
  const sitemap = buildSitemap(slugs)
  writeFileSync(SITEMAP_PATH, sitemap, 'utf-8')
  console.log(`✅ sitemap.xml gerado com ${STATIC_ROUTES.length + slugs.length} URLs (${slugs.length} projetos).`)
}

main().catch((err) => {
  console.error('❌ Erro ao gerar sitemap:', err)
  process.exit(1)
})