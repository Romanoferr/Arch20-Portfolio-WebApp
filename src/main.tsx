import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import App from '@/App'
import { AuthProvider } from '@/contexts/AuthContext'

const redirect = sessionStorage.redirect
if (redirect) {
  sessionStorage.removeItem('redirect')
  window.location.replace(redirect)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
