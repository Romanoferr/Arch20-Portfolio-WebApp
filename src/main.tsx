import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import App from '@/App'

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
