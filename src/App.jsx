import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'

import NavBar from './components/NavBar/NavBar.jsx'

// Importar páginas
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import RegistrationPage from './pages/Main/RegistrationPage.jsx'
import Main from './pages/Main/Main.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'

// Componentes temporales para páginas sin implementar
const Hub = () => <h1>Hub</h1>
const Upload = () => <h1>Subir Caso</h1>
const ViewCase = () => <h1>Ver Caso</h1>
const ExtraCase = () => <h1>Caso Extra</h1>

function App() {
  const location = useLocation()
  
  const hiddenNavBarRoutes = ['/login', '/registration']
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
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/view-case" element={<ViewCase />} />
        <Route path="/extra-case" element={<ExtraCase />} />
      </Routes>
    </>
  )
}

export default App
