import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import {
  createProject,
  getFriendlyError,
  getProjectById,
  updateProject,
  projectCategories,
  type CoverSelection,
} from '@/services/projectsService'
import type { ProjectCategory, ProjectImage, ProjectInput } from '@/types/project'
import { getImageUrl } from '@/lib/r2'

interface FormState {
  title: string
  slug: string
  category: ProjectCategory
  year: number
  location: string
  area: string
  description: string
  published: boolean
  order: number
}

const emptyForm: FormState = {
  title: '',
  slug: '',
  category: 'residencial',
  year: new Date().getFullYear(),
  location: '',
  area: '',
  description: '',
  published: true,
  order: 999,
}

function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function AdminProjectForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))

  const [existingImages, setExistingImages] = useState<ProjectImage[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [coverSelection, setCoverSelection] = useState<CoverSelection>({ type: 'none' })

  const isEditing = Boolean(id)

  // Object URLs for previewing newly selected files (revoked on cleanup).
  const newFilePreviews = useMemo(() => newFiles.map(fileToObjectUrl), [newFiles])

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!id) {
      return
    }

    let isMounted = true

    const loadProject = async () => {
      try {
        const project = await getProjectById(id)

        if (!isMounted) {
          return
        }

        if (!project) {
          setError('Projeto não encontrado. Ele pode ter sido excluído.')
          return
        }

        setForm({
          title: project.title,
          slug: project.slug,
          category: project.category,
          year: project.year,
          location: project.location,
          area: project.area,
          description: project.description,
          published: project.published,
          order: project.order,
        })

        const images = project.projectImages ?? []
        setExistingImages(images)
        const cover = images.find((image) => image.isCover)
        setCoverSelection(cover ? { type: 'existing', imageId: cover.id } : { type: 'none' })
      } catch (loadError) {
        if (isMounted) {
          setError(getFriendlyError(loadError, 'Não foi possível carregar o projeto.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadProject()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      return
    }

    setNewFiles((current) => [...current, ...files])
    event.target.value = ''
  }

  const handleExistingImageRemove = (imageId: string) => {
    setExistingImages((current) => current.filter((image) => image.id !== imageId))
    setRemovedImageIds((current) => [...current, imageId])

    setCoverSelection((current) => {
      if (current.type === 'existing' && current.imageId === imageId) {
        return { type: 'none' }
      }
      return current
    })
  }

  const handleNewImageRemove = (index: number) => {
    setNewFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))

    setCoverSelection((current) => {
      if (current.type === 'new' && current.fileIndex === index) {
        return { type: 'none' }
      }
      return current
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('O título do projeto é obrigatório.')
      return
    }

    setStatus('saving')
    setError('')

    const payload: ProjectInput = {
      title: form.title,
      slug: form.slug || undefined,
      category: form.category,
      year: Number(form.year),
      location: form.location,
      area: form.area,
      description: form.description,
      published: form.published,
      order: Number(form.order),
    }

    try {
      if (isEditing && id) {
        await updateProject(id, payload, {
          newFiles,
          existingImages,
          removedImageIds,
          coverSelection,
        })
      } else {
        const coverFileIndex =
          coverSelection.type === 'new' ? coverSelection.fileIndex : 0
        await createProject(payload, newFiles, coverFileIndex)
      }

      setStatus('success')
      navigate('/admin/projetos', { state: { saved: true } })
    } catch (saveError) {
      setStatus('error')
      setError(getFriendlyError(saveError, 'Não foi possível salvar o projeto. Tente novamente.'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[32px] border border-[var(--color-border)] bg-white p-16 text-sm text-[var(--color-muted)]">
        <Loader2 size={18} className="animate-spin" />
        Carregando projeto...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
            {isEditing ? 'Editar projeto' : 'Novo projeto'}
          </p>
          <h2 className="font-serif text-3xl">Dados do projeto</h2>
        </div>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={16} />
          Projeto salvo com sucesso.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-1 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Título</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.slug || event.target.value }))}
              placeholder="Nome do projeto"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Slug</label>
            <input
              className="input-field"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="slug-do-projeto"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Categoria</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ProjectCategory }))}
            >
              {projectCategories
                .filter((option) => option.value !== 'todos')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Ano</label>
              <input
                type="number"
                className="input-field"
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Ordem</label>
              <input
                type="number"
                className="input-field"
                value={form.order}
                onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Localização</label>
            <input
              className="input-field"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Cidade, estado"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Área</label>
            <input
              className="input-field"
              value={form.area}
              onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
              placeholder="120 m²"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Descrição</label>
            <textarea
              rows={6}
              className="input-field resize-none"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Descreva o projeto"
            />
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Publicar no site
          </label>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Imagem de capa</p>
                <p className="text-sm text-[var(--color-muted)]">Defina a imagem principal do projeto.</p>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
              <ArrowRight size={18} />
              <span>Enviar imagem de capa</span>
              <input type="file" className="hidden" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }
                setNewFiles((current) => [...current, file])
                setCoverSelection({ type: 'new', fileIndex: newFiles.length })
                event.target.value = ''
              }} />
            </label>

            {coverSelection.type === 'existing' && (
              <div className="mt-4 overflow-hidden rounded-[20px] border border-[var(--color-border)]">
                <img
                  src={getImageUrl(
                    existingImages.find((image) => image.id === coverSelection.imageId)?.storagePath ?? '',
                    'thumbnail',
                  )}
                  alt="Preview da capa"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            {coverSelection.type === 'new' && (
              <div className="mt-4 overflow-hidden rounded-[20px] border border-[var(--color-border)]">
                <img
                  src={newFilePreviews[coverSelection.fileIndex]}
                  alt="Preview da capa"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Galeria</p>
                <p className="text-sm text-[var(--color-muted)]">Adicione múltiplas imagens para o projeto.</p>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
              <ArrowRight size={18} />
              <span>Adicionar imagens à galeria</span>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelection} />
            </label>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {existingImages.map((image) => (
                <div key={image.id} className="rounded-[20px] border border-[var(--color-border)] bg-white p-2">
                  <img src={getImageUrl(image.storagePath, 'thumbnail')} alt={image.storagePath} className="h-28 w-full rounded-[16px] object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]"
                      onClick={() => setCoverSelection({ type: 'existing', imageId: image.id })}
                    >
                      {coverSelection.type === 'existing' && coverSelection.imageId === image.id ? 'Capa atual' : 'Definir capa'}
                    </button>
                    <button type="button" className="text-red-600" onClick={() => handleExistingImageRemove(image.id)}>
                      <AlertCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {newFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="rounded-[20px] border border-[var(--color-border)] bg-white p-2">
                  <img src={newFilePreviews[index]} alt={`Nova imagem ${index + 1}`} className="h-28 w-full rounded-[16px] object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]"
                      onClick={() => setCoverSelection({ type: 'new', fileIndex: index })}
                    >
                      {coverSelection.type === 'new' && coverSelection.fileIndex === index ? 'Capa atual' : 'Definir capa'}
                    </button>
                    <button type="button" className="text-red-600" onClick={() => handleNewImageRemove(index)}>
                      <AlertCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {status === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar projeto'
          )}
        </button>
        <button type="button" onClick={() => navigate('/admin/projetos')} className="btn-outline">
          Cancelar
        </button>
      </div>
    </form>
  )
}
