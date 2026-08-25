import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PenTool, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { deleteProject } from '@/services/projectsService'
import { useProjects } from '@/hooks/useProjects'
import { imageUrl } from '@/utils/imageUrl'

export function AdminProjectList() {
  const location = useLocation()
  const { projects, loading, error, refresh } = useProjects()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [showSuccess, setShowSuccess] = useState(Boolean(location.state?.saved))

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects])

  // Esconde o notifier de sucesso após alguns segundos.
  useEffect(() => {
    if (!showSuccess) {
      return
    }
    const timer = setTimeout(() => setShowSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [showSuccess])

  const handleDelete = async (projectId: string) => {
    setDeletingId(projectId)
    setDeleteError('')
    try {
      await deleteProject(projectId)
      await refresh()
      setConfirmingId(null)
    } catch (deleteErr) {
      setDeleteError(
        deleteErr instanceof Error
          ? deleteErr.message
          : 'Não foi possível excluir o projeto. Tente novamente.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-[var(--color-border)] bg-white p-16 text-sm text-[var(--color-muted)]">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Carregando projetos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={16} className="mt-1 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Projetos</p>
          <h2 className="font-serif text-3xl">Lista de projetos</h2>
        </div>

        <Link to="/admin/projetos/novo" className="btn-primary w-fit">
          <ArrowRight size={16} />
          Novo projeto
        </Link>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={16} />
          Projeto salvo com sucesso.
        </div>
      )}

      {deleteError && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-1 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="grid gap-4">
        {sortedProjects.map((project) => {
          const isConfirming = confirmingId === project.id
          const isDeleting = deletingId === project.id

          return (
            <article key={project.id} className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center">
                <img
                  src={imageUrl(project.coverImageStorage, 'thumbnail')}
                  alt={project.title}
                  className="h-32 w-full rounded-[20px] object-cover md:w-44"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-xl">{project.title}</h3>
                    <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {project.category}
                    </span>
                    <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                      {project.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-muted)] line-clamp-3">{project.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
                    <span>{project.location}</span>
                    <span>{project.year}</span>
                    <span>{project.area}</span>
                    <span>Ordem {project.order}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:flex-col">
                  <Link to={`/admin/projetos/${project.id}/editar`} className="btn-outline w-full justify-center">
                    <PenTool size={16} />
                    Editar
                  </Link>

                  {isConfirming ? (
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        disabled={isDeleting}
                        className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleDelete(project.id)}
                      >
                        {isDeleting ? 'Excluindo...' : 'Confirmar'}
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        className="btn-outline w-full justify-center"
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-outline w-full justify-center"
                      onClick={() => {
                        setConfirmingId(project.id)
                        setDeleteError('')
                      }}
                    >
                      <AlertCircle size={16} />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {sortedProjects.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white p-10 text-center text-sm text-[var(--color-muted)]">
          Nenhum projeto cadastrado ainda.
        </div>
      )}
    </div>
  )
}
