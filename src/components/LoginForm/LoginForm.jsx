import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../utils/auth'
import { AuthContext } from '../../context/AuthContext.jsx'
import './LoginForm.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setLoading(true)

    try {
      // Suprimir errores y warnings de Supabase en consola
      const originalWarn = console.warn
      const originalError = console.error
      console.warn = () => {}
      console.error = () => {}

      const user = await loginUser(email, password)
      
      // Restaurar console
      console.warn = originalWarn
      console.error = originalError
      
      // Usar la función login del context
      login(user)
      
      // Limpiar formulario
      setEmail('')
      setPassword('')
      
      // Redirigir al hub
      navigate('/hub')
    } catch (err) {
      // Restaurar console en caso de error
      console.warn = originalWarn
      console.error = originalError

      // Mensajes de error más específicos
      if (err.message.includes('Email not confirmed')) {
        setError('Por favor confirma tu email primero')
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos')
      } else if (err.message.includes('User not found')) {
        setError('El usuario no existe')
      } else {
        setError(err.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          required
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="btn-submit-login" disabled={loading}>
        {loading ? 'Ingresando...' : 'INGRESAR'}
      </button>
    </form>
  )
}

export default LoginForm
