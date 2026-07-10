import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import App from '@/App'

const redirect = sessionStorage.redirect
if (redirect) {
  sessionStorage.removeItem('redirect')
  window.location.replace(redirect)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
