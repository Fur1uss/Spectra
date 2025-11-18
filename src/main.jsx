import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Suprimir advertencias de cookies de Cloudflare en consola
if (typeof console !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function(...args) {
    // Filtrar mensajes sobre cookies __cf_bm
    if (args.some(arg => typeof arg === 'string' && arg.includes('__cf_bm'))) {
      return
    }
    originalWarn.apply(console, args)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
