import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

import NavBar from './components/NavBar/NavBar.jsx'

// Importar páginas
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import RegistrationPage from './pages/Main/RegistrationPage.jsx'
import Main from './pages/Main/Main.jsx'
import Hub from './pages/Hub/Hub.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import UploadStepper from './components/UploadStepper/UploadStepper.jsx'
import ViewCase from './pages/ViewCase/ViewCase.jsx'
import AuthCallback from './pages/AuthCallback/AuthCallback.jsx'

// Componentes temporales para páginas sin implementar
const ExtraCase = () => <h1>Caso Extra</h1>

function App() {
  const location = useLocation()
  
  const hiddenNavBarRoutes = ['/login', '/registration', '/auth/callback']
  const showNavBar = !hiddenNavBarRoutes.includes(location.pathname)

  return (
    <>
      {showNavBar && <NavBar />}
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
      <Analytics />
    </>
  )
}

export default App
