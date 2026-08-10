import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutGrid, PenTool, Home, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/projetos', label: 'Projetos', icon: PenTool },
  { to: '/admin/projetos/novo', label: 'Novo projeto', icon: Home },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/admin/login', { replace: true })
    } catch {
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur">
        <div className="container-main flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Administração
            </p>
            <h1 className="font-serif text-2xl">Gerenciar portfólio</h1>
            {user?.email && <p className="mt-2 text-sm text-[var(--color-muted)]">{user.email}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="btn-outline w-fit">
              <ArrowLeft size={16} />
              Voltar ao site
            </Link>
            <button type="button" onClick={handleLogout} className="btn-outline w-fit">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-main py-8">
        <nav className="mb-8 flex flex-wrap gap-3">
          {links.map((link) => {
            const Icon = link.icon

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                    isActive
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                  )
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
