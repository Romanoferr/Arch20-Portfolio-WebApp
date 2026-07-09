import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from '@/components/Layout/Layout'
import { Home } from '@/pages/Home/Home'
import { Projetos } from '@/pages/Projetos/Projetos'
import { ProjetoDetalhe } from '@/pages/ProjetoDetalhe/ProjetoDetalhe'
import { Servicos } from '@/pages/Servicos/Servicos'
import { Sobre } from '@/pages/Sobre/Sobre'
import { Contato } from '@/pages/Contato/Contato'
import { pageTransition } from '@/utils/animations'
import { Component, ErrorInfo, ReactNode } from 'react'

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
        </Routes>
      </motion.div>
    </AnimatePresence>
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
      return (
        <Layout>
          <Home />
        </Layout>
      )
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
