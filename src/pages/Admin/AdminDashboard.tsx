import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Building2, Home, Loader2 } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'

export function AdminDashboard() {
  const { projects, loading } = useProjects()
  const publishedCount = projects.filter((project) => project.published).length
  const draftCount = projects.length - publishedCount

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-[var(--color-border)] bg-white p-16 text-sm text-[var(--color-muted)]">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Carregando projetos...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
          Visão geral
        </p>
        <h2 className="mt-2 font-serif text-3xl">Painel administrativo</h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
          Gerencie os projetos do portfólio com uma experiência simples, responsiva e alinhada ao design atual do site.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[var(--color-accent)]/10 p-2 text-[var(--color-accent)]">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted)]">Projetos</p>
              <p className="text-2xl font-serif">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
              <Home size={18} />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted)]">Publicado</p>
              <p className="text-2xl font-serif">{publishedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted)]">Rascunho</p>
              <p className="text-2xl font-serif">{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-2xl">Comece a organizar o portfólio</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Adicione novos projetos, atualize imagens e defina a ordem de exibição.
            </p>
          </div>

          <Link to="/admin/projetos/novo" className="btn-primary w-fit">
            Criar projeto
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
