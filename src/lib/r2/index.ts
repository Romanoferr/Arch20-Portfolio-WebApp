/**
 * Serviço de acesso ao Cloudflare R2 via Worker.
 *
 * As operações administrativas (upload/delete) são delegadas ao
 * Cloudflare Worker, que detém as credenciais R2 e valida a sessão
 * Supabase. O frontend nunca lida diretamente com chaves R2.
 */

import { supabase } from '@/lib/supabase/client'
import { r2DeleteEndpoint, r2UploadEndpoint, getImageUrl } from './config'

export interface R2UploadResult {
  objectKey: string
  uploadUrl: string
  publicUrl: string
}

/**
 * Obtém a sessão atual do Supabase para envio no header Authorization.
 */
async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/**
 * Solicita ao Worker uma presigned URL para fazer upload direto ao R2.
 * Não envia o arquivo pelo Worker (evita o custo de egress/banda dupla).
 */
export async function requestR2Upload(
  projectId: string,
  filename: string,
  contentType: string,
): Promise<R2UploadResult> {
  if (!r2UploadEndpoint) {
    throw new Error('Endpoint de upload R2 não configurado (VITE_R2_UPLOAD_ENDPOINT).')
  }

  const token = await getAccessToken()
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const response = await fetch(r2UploadEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId, filename, contentType }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Falha ao solicitar upload (${response.status}).`)
  }

  const data = (await response.json()) as { objectKey: string; uploadUrl: string }
  return {
    objectKey: data.objectKey,
    uploadUrl: data.uploadUrl,
    publicUrl: getImageUrl(data.objectKey),
  }
}

/**
 * Executa o upload do arquivo diretamente para R2 usando a presigned URL.
 */
export async function uploadToR2(presignedUrl: string, file: File): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`Falha ao enviar imagem ao R2 (${response.status}).`)
  }
}

/**
 * Remove um objeto do R2 via Worker (valida autenticação server-side).
 */
export async function deleteR2Object(objectKey: string): Promise<void> {
  if (!r2DeleteEndpoint) {
    throw new Error('Endpoint de delete R2 não configurado (VITE_R2_DELETE_ENDPOINT).')
  }

  const token = await getAccessToken()
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const response = await fetch(r2DeleteEndpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ objectKey }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Falha ao excluir objeto do R2 (${response.status}).`)
  }
}

export { getImageUrl } from './config'
export { r2PublicBaseUrl, imgBaseUrl, r2UploadEndpoint, r2DeleteEndpoint, HERO_OBJECT_KEYS } from './config'
export {
  IMAGE_PRESETS,
  IMAGE_PRESET_NAMES,
  isImagePreset,
} from './presets'
export type { ImagePreset, ImagePresetConfig } from './presets'