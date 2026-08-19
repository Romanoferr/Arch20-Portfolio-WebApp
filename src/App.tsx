import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react'
import { Layout } from '@/components/Layout/Layout'
import { AdminLayout } from '@/components/Layout/AdminLayout'
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute'
import { Home } from '@/pages/Home/Home'
import { Projetos } from '@/pages/Projetos/Projetos'
import { ProjetoDetalhe } from '@/pages/ProjetoDetalhe/ProjetoDetalhe'
import { Servicos } from '@/pages/Servicos/Servicos'
import { Sobre } from '@/pages/Sobre/Sobre'
import { Contato } from '@/pages/Contato/Contato'
import { pageTransition } from '@/utils/animations'

// Admin pages are lazy-loaded so their heavy dependencies
// (react-hook-form, admin components) are not in the initial bundle.
const AdminDashboard = lazy(() =>
  import('@/pages/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
const AdminProjectList = lazy(() =>
  import('@/pages/Admin/AdminProjectList').then((m) => ({ default: m.AdminProjectList })),
)
const AdminProjectForm = lazy(() =>
  import('@/pages/Admin/AdminProjectForm').then((m) => ({ default: m.AdminProjectForm })),
)
const AdminLogin = lazy(() =>
  import('@/pages/Admin/AdminLogin').then((m) => ({ default: m.AdminLogin })),
)

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="projetos/:slug" element={<ProjetoDetalhe />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="contato" element={<Contato />} />
          </Route>

          <Route
            path="admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />

          <Route path="admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
              <Route
                path="projetos"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminProjectList />
                  </Suspense>
                }
              />
              <Route
                path="projetos/novo"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminProjectForm />
                  </Suspense>
                }
              />
              <Route
                path="projetos/:id/editar"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminProjectForm />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
        Carregando...
      </div>
    </div>
  )
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console — in future, send to monitoring
    // eslint-disable-next-line no-console
    console.error('Uncaught error in App routes:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <Home />
    }

    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AnimatedRoutes />
    </ErrorBoundary>
  )
}
