#!/usr/bin/env node
/**
 * Gera arquivos HTML estáticos para cada rota da SPA.
 *
 * O GitHub Pages não executa JavaScript durante a indexação do Google.
 * Esta script cria pastas com index.html para cada rota, permitindo
 * que o Googlebot encontre e renderize as páginas corretamente.
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'

const distDir = resolve(import.meta.dirname, '../dist')

const routes = ['/projetos', '/servicos', '/sobre', '/contato']

const sourceHtml = resolve(distDir, 'index.html')

if (!existsSync(sourceHtml)) {
  console.error('❌ dist/index.html not found. Run "npm run build" first.')
  process.exit(1)
}

for (const route of routes) {
  const folderPath = resolve(distDir, route.slice(1))
  const targetPath = resolve(folderPath, 'index.html')

  mkdirSync(folderPath, { recursive: true })
  copyFileSync(sourceHtml, targetPath)

  console.log(`✅ Created ${targetPath}`)
}

console.log('\n🎉 Prerendered all routes for Google indexing.')