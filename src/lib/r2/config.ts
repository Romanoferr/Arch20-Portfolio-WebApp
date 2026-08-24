/**
 * Configuração central do Cloudflare R2.
 *
 * Toda URL de imagem deve ser gerada a partir deste módulo, para que
 * possamos trocar o provedor (R2 → CDN → outro storage) sem alterar
 * dezenas de componentes.
 */

const R2_PUBLIC_URL = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.replace(/\/+$/, '')

/** URL pública base dos objetos do R2 (custom domain). */
export const r2PublicBaseUrl = R2_PUBLIC_URL || ''

/** Endpoint do Worker para gerar presigned URL de upload. */
export const r2UploadEndpoint =
  (import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined) || ''

/** Endpoint do Worker para excluir objetos. */
export const r2DeleteEndpoint =
  (import.meta.env.VITE_R2_DELETE_ENDPOINT as string | undefined) || ''

/**
 * Constrói a URL pública de um objeto do R2 a partir da sua `objectKey`.
 * Se a configuração não estiver presente (ex.: dev), retorna uma URL
 * relativa para evitar quebra imediata.
 */
export function getImageUrl(objectKey: string): string {
  if (!objectKey) {
    return ''
  }

  // Se já é uma URL absoluta, retorna como está (compatibilidade).
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey
  }

  if (!r2PublicBaseUrl) {
    // Fallback: ainda precisamos do Supabase public URL (evita quebrar em dev).
    // Este caso idealmente é transitório até configurar VITE_R2_PUBLIC_URL.
    return objectKey
  }

  const cleanKey = objectKey.replace(/^\/+/, '')
  return `${r2PublicBaseUrl}/${cleanKey}`
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