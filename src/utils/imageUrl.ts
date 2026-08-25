/**
 * Helpers para otimização de imagens via presets de entrega.
 *
 * Toda imagem exibida no frontend deve passar por `getImageUrl(objectKey,
 * preset)`. Este módulo reexporta os presets e fornece helpers de
 * `srcset`/`sizes` responsivos baseados na whitelist de presets.
 *
 * NENHUM componente deve montar URLs R2 originais ou combinações arbitrárias
 * de parâmetros diretamente.
 */

import {
  getImageUrl,
  IMAGE_PRESETS,
  isImagePreset,
} from '@/lib/r2'
import type { ImagePreset } from '@/lib/r2'

export { IMAGE_PRESETS, isImagePreset }
export type { ImagePreset }

/**
 * Gera uma URL otimizada para um `objectKey` usando um preset.
 * Atalho curto para componentes; delega para `getImageUrl(objectKey, preset)`.
 */
export function imageUrl(objectKey: string, preset: ImagePreset = 'gallery'): string {
  return getImageUrl(objectKey, preset)
}

/**
 * Gera um `srcset` com variantes de presets (e a largura correspondente) para
 * que o navegador escolha a melhor resolução conforme o viewport e o `sizes`.
 *
 * Apenas presets da whitelist são usados — nunca larguras arbitrárias.
 *
 * Ex.: buildSrcSet(key, ['mobile', 'tablet', 'gallery'])
 *   → "…?preset=mobile 800w, …?preset=tablet 1200w, …?preset=gallery 1600w"
 */
export function buildSrcSet(
  objectKey: string,
  presets: ImagePreset[] = ['mobile', 'tablet', 'gallery'],
): string {
  if (!objectKey) return ''
  return presets
    .filter(isImagePreset)
    .map((p) => `${getImageUrl(objectKey, p)} ${IMAGE_PRESETS[p].width}w`)
    .join(', ')
}

/** `sizes` para a grade de projetos (Gallery). O navegador escolhe a variante
 * de srcset que melhor cabe no elemento (33vw em desktop, 50vw em tablet,
 * 100vw em mobile). */
export const GALLERY_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/** `sizes` para imagens full-width (hero, cover de detalhe). */
export const FULL_WIDTH_SIZES = '100vw'

/** Presets usados para imagens full-width (hero/cover de detalhe). */
export const FULL_WIDTH_PRESETS: ImagePreset[] = ['mobile', 'tablet', 'gallery', 'hero']

/** Presets usados nos cards da galeria. */
export const GALLERY_PRESETS: ImagePreset[] = ['mobile', 'tablet', 'gallery']
