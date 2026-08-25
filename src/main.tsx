import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import '@/styles/index.css'
import App from '@/App'
import { AuthProvider } from '@/contexts/AuthContext'
import { initAnalytics } from '@/lib/analytics/tracker'

// Inicializa o tracker de analytics (privacy-first, sessionStorage efêmero).
// O initAnalytics registra a primeira view; as rotas do SPA são rastreadas
// pelo hook useAnalyticsPageView montado em <App/>.
initAnalytics()

const redirect = sessionStorage.redirect
if (redirect) {
  sessionStorage.removeItem('redirect')

  try {
    const targetUrl = new URL(redirect, window.location.origin)
    const targetPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
    history.replaceState(null, '', targetPath)
  } catch {
    window.location.replace(redirect)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
