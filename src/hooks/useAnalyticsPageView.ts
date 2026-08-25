import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/analytics/tracker'

/**
 * Rastreia mudanças de rota no SPA (react-router). Deve ser montado uma vez,
 * em um componente dentro do <Router> (ex.: dentro de <App/>).
 *
 * `trackPageView` já é deduplicado: se o pathname não mudou, não duplicamos.
 */
export function useAnalyticsPageView(): void {
  const location = useLocation()

  useEffect(() => {
    trackPageView()
  }, [location.pathname])
}