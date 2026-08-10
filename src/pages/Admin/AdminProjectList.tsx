import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PenTool, ArrowRight, AlertCircle } from 'lucide-react'
import { deleteProject, getProjects } from '@/services/projectsService'
import type { Project } from '@/types/project'

export function AdminProjectList() {
  const [projects, setProjects] = useState<Project[]>(() => getProjects())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects])

  const handleDelete = (projectId: string) => {
    const deleted = deleteProject(projectId)

    if (deleted) {
      setProjects(getProjects())
      setConfirmingId(null)
    }
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

      <div className="grid gap-4">
        {sortedProjects.map((project) => (
          <article key={project.id} className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center">
              <img
                src={project.coverImage || project.images[0]}
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

                {confirmingId === project.id ? (
                  <div className="flex w-full gap-2">
                    <button type="button" className="btn-primary w-full justify-center" onClick={() => handleDelete(project.id)}>
                      Confirmar
                    </button>
                    <button type="button" className="btn-outline w-full justify-center" onClick={() => setConfirmingId(null)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn-outline w-full justify-center" onClick={() => setConfirmingId(project.id)}>
                    <AlertCircle size={16} />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {sortedProjects.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white p-10 text-center text-sm text-[var(--color-muted)]">
          Nenhum projeto cadastrado ainda.
        </div>
      )}
    </div>
  )
}
