/**
 * Helpers para otimização de imagens.
 *
 * As imagens são servidas pelo Cloudflare R2 (via getImageUrl). As
 * transformações são delegadas ao CDN/R2 ou aplicadas como query params
 * quando o provedor suporta (ex.: Cloudflare Image Resizing).
 */

import { getImageUrl } from '@/lib/r2'

export interface ImageTransform {
  width?: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Anexa parâmetros de transformação a uma URL de imagem.
 * Se a URL não apontar para o R2 (ex.: Unsplash), retorna a URL original.
 */
export function withTransform(url: string, transform: ImageTransform): string {
  if (!url) {
    return url
  }

  // Se for objectKey relativa, converte para URL pública primeiro.
  const base = url.startsWith('http') ? url : getImageUrl(url)

  const params = new URLSearchParams()
  if (transform.width) params.set('width', String(transform.width))
  if (transform.height) params.set('height', String(transform.height))
  if (transform.quality) params.set('quality', String(transform.quality))

  const query = params.toString()
  if (!query) return base

  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}${query}`
}

/**
 * Gera uma string `srcset` a partir de uma URL, com as larguras dadas.
 * Ex.: "url?width=400 400w, url?width=800 800w, url?width=1200 1200w"
 */
export function buildSrcSet(url: string, widths: number[]): string {
  if (!url) return ''
  return widths.map((w) => `${withTransform(url, { width: w })} ${w}w`).join(', ')
}

/**
 * Gera um `src` otimizado (largura padrão) para uso como fallback.
 */
export function optimizedSrc(url: string, width: number, quality = 80): string {
  return withTransform(url, { width, quality })
}

/**@ignore
 * Mapeia uma objectKey de hero para a versão WebP otimizada quando disponível.
 * Mantém compatibilidade com a antiga convenção de heroes do Supabase.
 */
const HERO_WEBP_MAP: Record<string, string> = {
  'heroes/Cena_01_v.png': 'heroes/Cena_01_v',
  'heroes/Cena_02.png': 'heroes/Cena_02',
  'heroes/sala_01.png': 'heroes/sala_01',
  'heroes/Cena_13.png': 'heroes/Cena_13',
  'heroes/sobre.jpg': 'heroes/sobre',
  'heroes/IMG_2441.JPG': 'heroes/IMG_2441',
  'heroes/4932a4d8-9ca4-47e9-bee4-52dffdb2b78b.png': 'heroes/4932a4d8-9ca4-47e9-bee4-52dffdb2b78b',
}

function heroWebpBase(url: string): string | null {
  // Converte para objectKey equivalenete se for uma URL completa do R2.
  const candidate = url
  for (const [original, base] of Object.entries(HERO_WEBP_MAP)) {
    if (candidate.includes(original) || candidate.includes(original.replace(/^heroes\//, ''))) return base
  }
  return null
}

/**
 * Retorna a URL WebP otimizada para uma largura específica, ou a URL original.
 * Busca o objeto `heroes/{base}-{width}.webp` no R2.
 */
export function optimizedHeroSrc(url: string, width: number): string {
  const base = heroWebpBase(url)
  if (!base) return url
  const original = HERO_WEBP_MAP[url]
  const keyBase = original ? original.replace(/\.(png|jpg|jpeg)$/i, '') : base
  return getImageUrl(`heroes/${keyBase}-${width}.webp`)
}

/** sizes para a grade de projetos (Gallery). */
export const GALLERY_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/** sizes para imagens full-width (hero, cover de detalhe). */
export const FULL_WIDTH_SIZES = '100vw'

/** Larguras usadas para imagens full-width (hero/cover). */
export const FULL_WIDTH_SRCSET = [800, 1200, 1600, 2000]

/** Larguras usadas para os cards da galeria. */
export const GALLERY_SRCSET = [400, 800, 1200]
