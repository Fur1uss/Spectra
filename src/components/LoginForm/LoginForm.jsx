import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../utils/auth'
import { AuthContext } from '../../context/AuthContext.jsx'
import './LoginForm.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const user = await loginUser(username, password)
      
      // Usar la función login del context
      login(user)
      
      // Limpiar formulario
      setUsername('')
      setPassword('')
      
      // Redirigir al hub
      navigate('/hub')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username">Nombre de usuario</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
