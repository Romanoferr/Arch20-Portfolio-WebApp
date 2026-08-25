/**
 * Presets centralizados de otimização de imagens.
 *
 * Esta tabela é a ÚNICA fonte de verdade para os tamanhos de entrega. Ela deve
 * permanecer SÍNCRONA com a whitelist de presets do Worker de image delivery
 * (`worker-image-delivery/index.js`).
 *
 * IMPORTANTE:
 * - A lista é uma whitelist FECHADA. Nunca gerar combinações arbitrárias de
 *   width/height/quality no frontend, para preservar cacheabilidade e custo
 *   previsível na Cloudflare.
 * - O preset `full` (2560px) só deve ser usado quando houver necessidade real
 *   de alta resolução (ex.: visualização em tela cheia). Evitar por padrão.
 */

export type ImagePreset =
  | 'thumbnail'
  | 'mobile'
  | 'tablet'
  | 'gallery'
  | 'hero'
  | 'full'
  | 'social'

export interface ImagePresetConfig {
  /** Largura máxima da imagem entregue (em px). */
  width: number
  /** Qualidade da compressão (0–100). */
  quality: number
}

export const IMAGE_PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  thumbnail: { width: 500, quality: 78 },
  mobile: { width: 800, quality: 80 },
  tablet: { width: 1200, quality: 82 },
  gallery: { width: 1600, quality: 82 },
  hero: { width: 1920, quality: 84 },
  full: { width: 2560, quality: 88 },
  social: { width: 1200, quality: 85 },
}

/** Nomes de presets válidos (para validação em runtime quando necessário). */
export const IMAGE_PRESET_NAMES = Object.keys(IMAGE_PRESETS) as ImagePreset[]

/** Valida se um preset é válido. */
export function isImagePreset(value: unknown): value is ImagePreset {
  return typeof value === 'string' && value in IMAGE_PRESETS
}