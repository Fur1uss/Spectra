import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, hashPassword } from '../../utils/auth'
import './RegistrationForm.css'

const RegistrationForm = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    birthday: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.first_name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!formData.last_name.trim()) {
      setError('El apellido es requerido')
      return
    }
    if (!formData.email.trim()) {
      setError('El correo es requerido')
      return
    }
    if (!formData.birthday) {
      setError('La fecha de nacimiento es requerida')
      return
    }
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido')
      return
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida')
      return
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        birthday: formData.birthday,
        username: formData.username,
        password: formData.password,
      }

      const newUser = await registerUser(userData)
      
      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('userId', newUser.id)
      
      // Limpiar formulario
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        birthday: '',
        username: '',
        password: '',
        confirmPassword: '',
      })
      
      // Redirigir al hub
      navigate('/hub')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">Nombre</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Apellido</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="email">Correo</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="birthday">Fecha de Nacimiento</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="btn-submit-register" disabled={loading}>
        {loading ? 'Registrando...' : 'REGISTRAR'}
      </button>
    </form>
  )
}

export default RegistrationForm
