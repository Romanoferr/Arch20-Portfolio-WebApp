/**
 * Helpers para otimização de imagens servidas pelo Supabase Storage.
 *
 * O Supabase Storage suporta transformações de imagem via query params
 * (?width, ?height, ?quality, ?resize). Usamos isso para gerar múltiplas
 * resoluções (srcset) sem custo de build e sem duplicar arquivos.
 */

export interface ImageTransform {
  width?: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Anexa parâmetros de transformação a uma URL pública do Supabase Storage.
 * Se a URL não for do Supabase (ex.: Unsplash), retorna a URL original.
 */
export function withTransform(url: string, transform: ImageTransform): string {
  if (!url || !url.includes('supabase.co/storage')) {
    return url
  }

  const params = new URLSearchParams()
  if (transform.width) params.set('width', String(transform.width))
  if (transform.height) params.set('height', String(transform.height))
  if (transform.quality) params.set('quality', String(transform.quality))
  if (transform.resize) params.set('resize', transform.resize)

  const query = params.toString()
  if (!query) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${query}`
}

/**
 * Gera uma string `srcset` a partir de uma URL pública, com as larguras dadas.
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

/**
 * `sizes` para a grade de projetos (Gallery).
 * 1 coluna em mobile, 2 em sm, 3 em lg.
 */
export const GALLERY_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/**
 * `sizes` para imagens full-width (hero, cover de detalhe).
 */
export const FULL_WIDTH_SIZES = '100vw'

/**
 * Larguras usadas para imagens full-width (hero/cover).
 */
export const FULL_WIDTH_SRCSET = [800, 1200, 1600, 2000]

/**
 * Larguras usadas para os cards da galeria.
 */
export const GALLERY_SRCSET = [400, 800, 1200]
