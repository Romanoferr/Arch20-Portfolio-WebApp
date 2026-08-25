/**
 * Configuração central do Cloudflare R2 / Image Delivery.
 *
 * Toda URL de imagem deve ser gerada a partir deste módulo, para que
 * possamos trocar o provedor (R2 → CDN → outro storage) sem alterar
 * dezenas de componentes.
 *
 * A partir desta implementação, a entrega de imagens ao navegador passa pelo
 * Worker de image delivery (`img.brunacamara-arq.com.br`), que aplica
 * Cloudflare Image Transformations. O frontend NUNCA gera URLs diretamente
 * para os arquivos originais no R2.
 */

import type { ImagePreset } from './presets'

const R2_PUBLIC_URL = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.replace(/\/+$/, '')
const IMG_BASE_URL = (import.meta.env.VITE_IMG_BASE_URL as string | undefined)?.replace(/\/+$/, '')

/**
 * URL pública base dos objetos originais do R2 (custom domain). Usada apenas
 * como fallback legado (dev) e pela origem do Worker de delivery. O frontend
 * deve preferir `getImageUrl(objectKey, preset)`.
 */
export const r2PublicBaseUrl = R2_PUBLIC_URL || ''

/** URL base do Worker de image delivery (imagens otimizadas). */
export const imgBaseUrl = IMG_BASE_URL || ''

/** Endpoint do Worker para gerar presigned URL de upload. */
export const r2UploadEndpoint =
  (import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined) || ''

/** Endpoint do Worker para excluir objetos. */
export const r2DeleteEndpoint =
  (import.meta.env.VITE_R2_DELETE_ENDPOINT as string | undefined) || ''

/**
 * Constrói a URL de entrega otimizada de um objeto do R2 a partir da sua
 * `objectKey` e de um `preset` (whitelist).
 *
 * Ex.: getImageUrl("projects/../original/x.jpg", "gallery")
 *   → https://img.brunacamara-arq.com.br/projects/.../x.jpg?preset=gallery
 *
 * Fallbacks (para não quebrar em dev sem configuração):
 *   - Se `VITE_IMG_BASE_URL` não existir, volta para a URL pública original.
 *   - Se nenhuma config existir, retorna o próprio objectKey.
 */
export function getImageUrl(
  objectKey: string,
  preset: ImagePreset = 'gallery',
): string {
  if (!objectKey) {
    return ''
  }

  // Se já é uma URL absoluta, retorna como está (compatibilidade com
  // heróis/Unsplash remotos).
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey
  }

  const cleanKey = objectKey.replace(/^\/+/, '')

  // 1ª escolha: Worker de image delivery (entrega otimizada + cache).
  if (imgBaseUrl) {
    return `${imgBaseUrl}/${cleanKey}?preset=${preset}`
  }

  // 2º fallback: URL original do custom domain R2 (dev/transitório).
  if (r2PublicBaseUrl) {
    return `${r2PublicBaseUrl}/${cleanKey}`
  }

  // Último recurso: dev sem configuração.
  return cleanKey
}

/**
 * Object_keys canônicos das imagens de hero, para uso centralizado.
 * (Compatível com a estrutura atual do bucket.)
 */
export const HERO_OBJECT_KEYS = {
  home: 'heroes/Cena_01_v.png',
  sobre: 'heroes/4932a4d8-9ca4-47e9-bee4-52dffdb2b78b.png',
  sobrePerfil: 'heroes/IMG_2441.JPG',
  projetos: 'heroes/d2315cb1-68a0-4760-bf97-4249af291c99.png',
  servicos: 'heroes/1ac7d3b7-0637-4e34-8d0e-e8f9ec032aad.png',
  contatoHero: 'heroes/Cena_13.png',
} as const