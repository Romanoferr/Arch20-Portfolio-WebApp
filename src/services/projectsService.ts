import { supabase } from '@/lib/supabase/client'
import type { Project, ProjectCategory, ProjectImage, ProjectInput } from '@/types/project'

export const projectCategories: { value: ProjectCategory | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'interiores', label: 'Interiores' },
]

const PROJECTS_TABLE = 'projects'
const PROJECT_IMAGES_TABLE = 'project_images'
const PROJECT_IMAGES_BUCKET = 'project-images'

export type CoverSelection =
  | { type: 'existing'; imageId: string }
  | { type: 'new'; fileIndex: number }
  | { type: 'none' }

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getTimestamp() {
  return new Date().toISOString()
}

export function getFriendlyError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message).toLowerCase()

    if (
      message.includes('row-level security') ||
      message.includes('permission denied') ||
      message.includes('new row violates row-level security')
    ) {
      return 'Permissão negada. Verifique se você está autenticado como administrador.'
    }

    if (
      message.includes('duplicate key') ||
      message.includes('already exists') ||
      message.includes('unique constraint')
    ) {
      return 'Já existe um projeto com este slug/título. Use um slug diferente.'
    }

    if (message.includes('storage') || message.includes('bucket')) {
      return 'Falha ao acessar o armazenamento de imagens. Verifique se o bucket "project-images" existe e está configurado.'
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return 'Falha de conexão com o Supabase. Verifique sua conexão com a internet.'
    }

    return (error as { message: string }).message
  }

  return fallback
}

function getPublicUrl(storagePath: string) {
  return supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(storagePath).data?.publicUrl || ''
}

function normalizeProjectImageRow(row: {
  id: string
  storage_path: string
  is_cover: boolean
  display_order: number
  created_at: string
}): ProjectImage {
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: getPublicUrl(row.storage_path),
    isCover: row.is_cover,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  }
}

function normalizeProjectRow(row: any): Project {
  const imagesRows = (row[PROJECT_IMAGES_TABLE] ?? []) as Array<{
    id: string
    storage_path: string
    is_cover: boolean
    display_order: number
    created_at: string
  }>

  const projectImages = imagesRows
    .map(normalizeProjectImageRow)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const images = projectImages.map((image) => image.publicUrl)
  const coverImage = projectImages.find((image) => image.isCover)?.publicUrl || images[0] || ''

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    year: row.year,
    location: row.location,
    area: row.area,
    description: row.description,
    published: row.published,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
    coverImage,
    projectImages,
  }
}

async function uploadProjectFile(projectId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${crypto.randomUUID()}.${extension}`
  const storagePath = `projects/${projectId}/${fileName}`

  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false })

  if (error) {
    throw error
  }

  return { storagePath, publicUrl: getPublicUrl(storagePath) }
}

async function insertProjectImages(
  projectId: string,
  files: File[],
  coverIndex: number,
  initialOrder = 0,
): Promise<ProjectImage[]> {
  if (files.length === 0) {
    return []
  }

  const uploadedImages = await Promise.all(files.map((file) => uploadProjectFile(projectId, file)))
  const records = uploadedImages.map((image, index) => ({
    project_id: projectId,
    storage_path: image.storagePath,
    is_cover: index === coverIndex,
    display_order: initialOrder + index,
  }))

  const { data, error } = await supabase
    .from(PROJECT_IMAGES_TABLE)
    .insert(records)
    .select()

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeProjectImageRow)
}

async function updateProjectImageMetadata(images: ProjectImage[], coverImageId?: string) {
  await Promise.all(
    images.map((image, index) =>
      supabase
        .from(PROJECT_IMAGES_TABLE)
        .update({ display_order: index, is_cover: image.id === coverImageId })
        .eq('id', image.id),
    ),
  )
}

async function deleteStorageObjects(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return
  }

  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove(storagePaths)

  if (error) {
    throw error
  }
}

export async function getProjects(publishedOnly = false, limit?: number): Promise<Project[]> {
  let query = supabase
    .from(PROJECTS_TABLE)
    .select(
      `${PROJECT_IMAGES_TABLE}(id,storage_path,is_cover,display_order,created_at)`,
    )
    .order('order', { ascending: true })

  if (publishedOnly) {
    query = query.eq('published', true)
  }

  if (limit !== undefined) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeProjectRow)
}

export async function getPublishedProjects(limit?: number): Promise<Project[]> {
  return getProjects(true, limit)
}

export async function getFeaturedProjects(count = 3): Promise<Project[]> {
  return getProjects(true, count)
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return undefined
  }

  const { data: imageRows, error: imagesError } = await supabase
    .from(PROJECT_IMAGES_TABLE)
    .select('id,storage_path,is_cover,display_order,created_at')
    .eq('project_id', id)
    .order('display_order', { ascending: true })

  if (imagesError) {
    throw imagesError
  }

  return normalizeProjectRow({
    ...data,
    [PROJECT_IMAGES_TABLE]: imageRows ?? [],
  })
}

export async function getProjectBySlug(
  slug: string,
  publishedOnly = true,
): Promise<Project | undefined> {
  let query = supabase
    .from(PROJECTS_TABLE)
    .select(
      `${PROJECT_IMAGES_TABLE}(id,storage_path,is_cover,display_order,created_at)`,
    )
    .eq('slug', slug)

  if (publishedOnly) {
    query = query.eq('published', true)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw error
  }

  return data ? normalizeProjectRow(data) : undefined
}

export async function createProject(
  input: ProjectInput,
  newFiles: File[] = [],
  coverFileIndex = 0,
): Promise<Project> {
  const projectPayload = {
    title: input.title,
    slug: input.slug || slugify(input.title),
    category: input.category,
    year: input.year,
    location: input.location,
    area: input.area,
    description: input.description,
    published: input.published ?? true,
    order: input.order ?? 999,
    created_at: getTimestamp(),
    updated_at: getTimestamp(),
  }

  const { data: createdProject, error: createError } = await supabase
    .from(PROJECTS_TABLE)
    .insert(projectPayload)
    .select()
    .maybeSingle()

  if (createError || !createdProject) {
    throw createError || new Error('Unable to create project')
  }

  const insertedImages = await insertProjectImages(
    createdProject.id,
    newFiles,
    coverFileIndex,
  )

  return normalizeProjectRow({
    ...createdProject,
    [PROJECT_IMAGES_TABLE]: insertedImages,
  })
}

export async function updateProject(
  id: string,
  input: ProjectInput,
  options?: {
    newFiles?: File[]
    existingImages?: ProjectImage[]
    removedImageIds?: string[]
    coverSelection?: CoverSelection
  },
): Promise<Project | undefined> {
  const existingProject = await getProjectById(id)

  if (!existingProject) {
    return undefined
  }

  const newFiles = options?.newFiles ?? []
  const existingImages = options?.existingImages ?? existingProject.projectImages ?? []
  const removedImageIds = options?.removedImageIds ?? []
  const coverSelection = options?.coverSelection ?? { type: 'none' }

  const projectPayload = {
    title: input.title,
    slug: input.slug || slugify(input.title),
    category: input.category,
    year: input.year,
    location: input.location,
    area: input.area,
    description: input.description,
    published: input.published ?? existingProject.published,
    order: input.order ?? existingProject.order,
    updated_at: getTimestamp(),
  }

  const { error: updateError } = await supabase
    .from(PROJECTS_TABLE)
    .update(projectPayload)
    .eq('id', id)

  if (updateError) {
    throw updateError
  }

  const deletedImages = existingImages.filter((image) => removedImageIds.includes(image.id))
  const remainingImages = existingImages.filter((image) => !removedImageIds.includes(image.id))

  if (deletedImages.length) {
    await deleteStorageObjects(deletedImages.map((image) => image.storagePath))
    const { error: deleteError } = await supabase
      .from(PROJECT_IMAGES_TABLE)
      .delete()
      .in('id', deletedImages.map((image) => image.id))

    if (deleteError) {
      throw deleteError
    }
  }

  const insertedImages = await insertProjectImages(
    id,
    newFiles,
    coverSelection.type === 'new' ? coverSelection.fileIndex : 0,
    remainingImages.length,
  )

  const allImages = [...remainingImages, ...insertedImages]
  let coverImageId: string | undefined

  if (coverSelection.type === 'existing') {
    coverImageId = coverSelection.imageId
  } else if (coverSelection.type === 'new') {
    coverImageId = insertedImages[coverSelection.fileIndex]?.id
  }

  if (!coverImageId && allImages.length > 0) {
    coverImageId = allImages[0].id
  }

  await updateProjectImageMetadata(allImages, coverImageId)

  return getProjectById(id)
}

export async function deleteProject(id: string): Promise<boolean> {
  // 1. Busca os caminhos das imagens para limpar o Storage depois.
  const { data: images, error: selectError } = await supabase
    .from(PROJECT_IMAGES_TABLE)
    .select('storage_path')
    .eq('project_id', id)

  if (selectError) {
    throw selectError
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path)

  // 2. Apaga o projeto. O `on delete cascade` remove os registros de imagem.
  const { error: deleteError } = await supabase.from(PROJECTS_TABLE).delete().eq('id', id)

  if (deleteError) {
    throw deleteError
  }

  // 3. Limpa os arquivos do Storage (best-effort — não deve impedir a exclusão).
  if (storagePaths.length) {
    try {
      await deleteStorageObjects(storagePaths)
    } catch {
      // Arquivos órfãos no Storage não bloqueiam a exclusão do projeto.
    }
  }

  return true
}
