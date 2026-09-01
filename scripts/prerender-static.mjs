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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const distDir = resolve(import.meta.dirname, '../dist')
// Configurável por VITE_SITE_URL (URL pública, sem barra final).
const SITE_URL = (process.env.VITE_SITE_URL || 'https://seu-dominio.com.br').replace(/\/+$/, '')
const SITE_NAME = process.env.VITE_SITE_NAME || 'Escritório de Arquitetura'

/**
 * SEO por rota. As URLs usam trailing slash porque o GitHub Pages serve
 * diretórios físicos (dist/sobre/index.html) e redireciona /sobre -> /sobre/.
 * O canonical deve apontar para a versão com slash para evitar o 301.
 */
const routes = [
  {
    path: '/projetos',
    title: `Portfólio de Arquitetura | ${SITE_NAME}`,
    description:
      'Conheça o portfólio de projetos residenciais e comerciais do escritório.',
    canonical: `${SITE_URL}/projetos/`,
  },
  {
    path: '/servicos',
    title: `Serviços de Arquitetura | ${SITE_NAME}`,
    description:
      'Serviços de arquitetura residencial, comercial, design de interiores e consultoria.',
    canonical: `${SITE_URL}/servicos/`,
  },
  {
    path: '/sobre',
    title: `Sobre | ${SITE_NAME} — Arquitetura`,
    description:
      'Conheça a trajetória do escritório e sua filosofia de trabalho.',
    canonical: `${SITE_URL}/sobre/`,
  },
  {
    path: '/contato',
    title: `Contato | ${SITE_NAME}`,
    description:
      'Entre em contato para solicitar um orçamento ou tirar dúvidas sobre projetos.',
    canonical: `${SITE_URL}/contato/`,
  },
]

const sourceHtml = resolve(distDir, 'index.html')

if (!existsSync(sourceHtml)) {
  console.error('❌ dist/index.html not found. Run "npm run build" first.')
  process.exit(1)
}

/** Substitui as tags de SEO no HTML pré-renderizado para refletir a rota. */
function injectSeo(html, { title, description, canonical }) {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${description}"`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${canonical}"`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${canonical}"`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${title}"`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${title}"`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${description}"`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${description}"`,
    )
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

function prerenderRoute(route, seo) {
  const folderPath = resolve(distDir, route.slice(1))
  const targetPath = resolve(folderPath, 'index.html')

  mkdirSync(folderPath, { recursive: true })

  const html = readFileSync(sourceHtml, 'utf-8')
  const finalHtml = seo ? injectSeo(html, seo) : html
  writeFileSync(targetPath, finalHtml, 'utf-8')

  console.log(`✅ Created ${targetPath}`)
}

async function main() {
  for (const route of routes) {
    prerenderRoute(route.path, route)
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