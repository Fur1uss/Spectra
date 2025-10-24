import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../utils/auth'
import { AuthContext } from '../../context/AuthContext.jsx'
import './RegistrationStepper.css'

const RegistrationStepper = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  
  const [currentStep, setCurrentStep] = useState(1)
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

  const validateStep = (step) => {
    setError('')

    if (step === 1) {
      if (!formData.first_name.trim()) {
        setError('El nombre es requerido')
        return false
      }
      if (!formData.last_name.trim()) {
        setError('El apellido es requerido')
        return false
      }
      if (!formData.email.trim()) {
        setError('El correo es requerido')
        return false
      }
      // Validar formato email básico
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('El correo no es válido')
        return false
      }
    }

    if (step === 2) {
      if (!formData.birthday) {
        setError('La fecha de nacimiento es requerida')
        return false
      }
      if (!formData.username.trim()) {
        setError('El nombre de usuario es requerido')
        return false
      }
      if (formData.username.length < 3) {
        setError('El nombre de usuario debe tener al menos 3 caracteres')
        return false
      }
    }

    if (step === 3) {
      if (!formData.password.trim()) {
        setError('La contraseña es requerida')
        return false
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    setError('')
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(3)) return

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
      
      // Usar la función login del context
      login(newUser)
      
      // Redirigir al hub
      navigate('/hub')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registration-stepper">
      {/* Indicador de pasos */}
      <div className="stepper-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <span>1</span>
          <p>Datos Personales</p>
        </div>
        <div className={`connector ${currentStep > 1 ? 'active' : ''}`}></div>
        
        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <span>2</span>
          <p>Usuario</p>
        </div>
        <div className={`connector ${currentStep > 2 ? 'active' : ''}`}></div>
        
        <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <span>3</span>
          <p>Contraseña</p>
        </div>
      </div>

      {/* Formulario */}
      <form className="stepper-form" onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
        
        {/* Paso 1: Datos Personales */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2>Tus Datos Personales</h2>
            
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

            {error && <p className="error-message">{error}</p>}

            <button type="button" className="btn-next" onClick={handleNextStep} disabled={loading}>
              Siguiente →
            </button>
          </div>
        )}

        {/* Paso 2: Usuario y Fecha */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2>Datos de Usuario</h2>
            
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

            {error && <p className="error-message">{error}</p>}

            <div className="button-group">
              <button type="button" className="btn-back" onClick={handlePreviousStep} disabled={loading}>
                ← Atrás
              </button>
              <button type="button" className="btn-next" onClick={handleNextStep} disabled={loading}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Contraseña */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2>Seguridad</h2>
            
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

            <div className="button-group">
              <button type="button" className="btn-back" onClick={handlePreviousStep} disabled={loading}>
                ← Atrás
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Registrando...' : 'REGISTRAR'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default RegistrationStepper
