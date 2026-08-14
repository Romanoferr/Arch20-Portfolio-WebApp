import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAuthenticated, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [from, isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const nextSession = await signIn(email.trim(), password)
      // Navigate based on the signIn result (single source of truth) instead
      // of relying on the isAuthenticated effect, which can race with the
      // onAuthStateChange listener.
      if (nextSession?.user) {
        navigate(from, { replace: true })
      }
    } catch (authError) {
      // error handled by context; log for diagnostics
      // eslint-disable-next-line no-console
      console.error('AdminLogin signIn failed:', authError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Link to="/" className="btn-outline w-fit">
          <ArrowLeft size={16} />
          Voltar ao site
        </Link>

        <div className="grid gap-8 rounded-[36px] border border-[var(--color-border)] bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Administração</p>
            <h1 className="font-serif text-4xl sm:text-5xl">Acesse o painel</h1>
            <p className="max-w-xl text-sm text-[var(--color-muted)]">
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em]">E-mail</label>
                <input
                  type="email"
                  autoComplete="email"
                  className="input-field"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em]">Senha</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="input-field"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-1 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={submitting || loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                {submitting || loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
