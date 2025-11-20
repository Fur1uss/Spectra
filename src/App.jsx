import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Suspense, lazy } from 'react'

import NavBar from './components/NavBar/NavBar.jsx'

// Importar páginas críticas (carga inmediata)
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import RegistrationPage from './pages/Main/RegistrationPage.jsx'
import Main from './pages/Main/Main.jsx'
import Hub from './pages/Hub/Hub.jsx'
import AuthCallback from './pages/AuthCallback/AuthCallback.jsx'

// Code splitting: componentes pesados con lazy loading
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage.jsx'))
const UploadStepper = lazy(() => import('./components/UploadStepper/UploadStepper.jsx'))
const ViewCase = lazy(() => import('./pages/ViewCase/ViewCase.jsx'))

// Componente de carga para Suspense
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    gap: '1rem'
  }}>
    <div 
      style={{
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTop: '3px solid #42ff1c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    ></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// Componentes temporales para páginas sin implementar
const ExtraCase = () => <h1>Caso Extra</h1>

function App() {
  const location = useLocation()
  
  const hiddenNavBarRoutes = ['/login', '/registration', '/auth/callback']
  const showNavBar = !hiddenNavBarRoutes.includes(location.pathname)

  return (
    <>
      {showNavBar && <NavBar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/main" element={<Main />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/upload" element={<UploadStepper />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/case/:caseId" element={<ViewCase />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/extra-case" element={<ExtraCase />} />
        </Routes>
      </Suspense>
      <Analytics />
    </>
  )
}

export default App
