import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import SuccessModal from '../SuccessModal/SuccessModal.jsx'
import LocationSelector from '../LocationSelector/LocationSelector.jsx'
import FileUploader from '../FileUploader/FileUploader.jsx'
import {
  validateFiles,
  uploadFilesToSupabase,
  createCase,
  saveFilesToDatabase
} from '../../utils/uploadHandler.js'
import { locationService } from '../../utils/locationService.js'
import { supabase } from '../../utils/supabase.js'
import './UploadStepper.css'

const UploadStepper = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, loading: authLoading } = useContext(AuthContext)

  // Estados
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [successCaseId, setSuccessCaseId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [caseTypes, setCaseTypes] = useState([])

  const [formData, setFormData] = useState({
    caseType: '',
    caseName: '',
    country: '',
    address: '',
    description: '',
    files: []
  })

  const [fieldErrors, setFieldErrors] = useState({})

  // Protección de ruta - esperar a que cargue el auth
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, authLoading, navigate])

  // Cargar tipos de casos
  useEffect(() => {
    const loadCaseTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('Case_Type')
          .select('*')
          .order('nombre_Caso', { ascending: true })

        if (error) {
          throw error
        }
        
        setCaseTypes(data || [])
      } catch (error) {
        console.error('Error cargando tipos de casos:', error.message)
      }
    }

    loadCaseTypes()
  }, [])

  // Validar campo en tiempo real
  const validateField = (name, value) => {
    const errors = { ...fieldErrors }

    switch (name) {
      case 'caseType':
        if (!value) {
          errors.caseType = 'Selecciona un tipo de caso'
        } else {
          delete errors.caseType
        }
        break

      case 'caseName':
        if (!value.trim()) {
          errors.caseName = 'Ingresa un nombre para el caso'
        } else {
          delete errors.caseName
        }
        break

      case 'country':
        if (!value.trim()) {
          errors.country = 'Ingresa el país'
        } else {
          delete errors.country
        }
        break

      case 'address':
        // Dirección es opcional, no validamos
        delete errors.address
        break

      case 'description':
        if (!value.trim()) {
          errors.description = 'La descripción es requerida'
        } else if (value.length < 50) {
          errors.description = `Mínimo 50 caracteres (${value.length}/50)`
        } else {
          delete errors.description
        }
        break

      default:
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar paso completo
  const validateStep = (step) => {
    let stepValid = true

    if (step === 1) {
      stepValid = validateField('caseType', formData.caseType) && stepValid
    }

    if (step === 2) {
      stepValid = validateField('country', formData.country) && stepValid
      stepValid = validateField('address', formData.address) && stepValid
    }

    if (step === 3) {
      // Archivos son opcionales, no validamos
      stepValid = true
    }

    if (step === 4) {
      stepValid = validateField('description', formData.description) && stepValid
    }

    if (step === 5) {
      // Resumen - no validaciones adicionales
      stepValid = true
    }

    return stepValid
  }

  // Manejadores de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    validateField(name, value)
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      files: selectedFiles
    }))
    setFieldErrors(prev => ({ ...prev, files: '' }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFormData(prev => ({
      ...prev,
      files: droppedFiles
    }))
    setFieldErrors(prev => ({ ...prev, files: '' }))
  }

  // Navegar entre pasos
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
    setFieldErrors({})
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(5)) {
      return
    }

    setLoading(true)

    // Suprimir errores y warnings de Supabase en consola
    const originalWarn = console.warn
    const originalError = console.error
    console.warn = () => {}
    console.error = () => {}

    try {

      // 1. Crear ubicación
      const locationResult = await locationService.createOrGetLocation({
        country: formData.country,
        address: formData.address
      })

      if (!locationResult.success) {
        throw new Error(locationResult.error)
      }

      // 2. Crear caso en DB
      const caseResult = await createCase({
        userId: user.id,
        caseTypeId: parseInt(formData.caseType),
        caseName: formData.caseName,
        description: formData.description,
        timeHour: new Date().toISOString(),
        locationId: locationResult.locationId
      })

      if (!caseResult.success) {
        throw new Error(caseResult.error)
      }

      const caseId = caseResult.caseId

      // 3. Subir archivos a Storage
      const uploadResult = await uploadFilesToSupabase(formData.files, caseId)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      // 4. Guardar URLs en tabla Files
      const filesResult = await saveFilesToDatabase(caseId, uploadResult.urls)

      if (!filesResult.success) {
        throw new Error(filesResult.error)
      }

      // Restaurar console
      console.warn = originalWarn
      console.error = originalError

      // Mostrar modal de éxito
      setSuccessCaseId(caseId)
      setShowSuccess(true)

      // Resetear formulario
      setFormData({
        caseType: '',
        caseName: '',
        country: '',
        address: '',
        description: '',
        files: []
      })
      setCurrentStep(1)
      setFieldErrors({})
    } catch (error) {
      // Restaurar console en caso de error
      console.warn = originalWarn
      console.error = originalError

      setFieldErrors({
        submit: error.message || 'Error al subir el caso. Intenta de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambio de ubicación
  const handleLocationChange = useCallback((location) => {
    setFormData(prev => ({
      ...prev,
      country: location.country,
      address: location.address
    }))
    // Limpiar errores de ubicación
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.country
      delete newErrors.address
      return newErrors
    })
  }, [])

  // Manejar cambio de archivos
  const handleFilesChange = useCallback((files) => {
    setFormData(prev => ({
      ...prev,
      files: files
    }))
    // Limpiar errores de archivos
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.files
      return newErrors
    })
  }, [])

  if (authLoading) {
    return <div className="upload-stepper-page"><p>Cargando...</p></div>
  }

  if (!isLoggedIn) {
    return null
  }

  const handleBackClick = () => {
    navigate('/hub')
  }

  return (
    <div className="upload-stepper-page">
      <div className="upload-stepper-container">
        {/* Header */}
        <div className="upload-header">
          <button 
            type="button"
            className="back-button" 
            onClick={handleBackClick}
            title="Volver atrás"
          >
            ← VOLVER
          </button>
          <p className="step-indicator">Paso {currentStep} de 4</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
        </div>

        {/* Step Labels */}
        <div className="step-labels">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`label ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              {currentStep > step ? '✓' : step}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="upload-form">
          {/* STEP 1: Type & Time */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>📋 TIPO DE CASO</h2>

              <div className="form-group">
                <label htmlFor="caseType">Tipo de Caso *</label>
                <select
                  id="caseType"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleInputChange}
                  className={fieldErrors.caseType ? 'error' : ''}
                >
                  <option value="">-- Selecciona un tipo --</option>
                  {caseTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nombre_Caso}
                    </option>
                  ))}
                </select>
                {fieldErrors.caseType && (
                  <span className="field-error">{fieldErrors.caseType}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="caseName">Nombre del Caso *</label>
                <input
                  type="text"
                  id="caseName"
                  name="caseName"
                  value={formData.caseName}
                  onChange={handleInputChange}
                  placeholder="Ej: Avistamiento OVNI en La Plata"
                  className={fieldErrors.caseName ? 'error' : ''}
                />
                {fieldErrors.caseName && (
                  <span className="field-error">{fieldErrors.caseName}</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>📍 ¿DÓNDE pasó?</h2>
              <LocationSelector 
                onLocationChange={handleLocationChange}
                initialData={{
                  country: formData.country,
                  address: formData.address
                }}
                errors={fieldErrors}
              />
            </div>
          )}

          {/* STEP 3: Files */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>📁 ARCHIVOS MULTIMEDIA</h2>
              <FileUploader 
                onFilesChange={handleFilesChange}
                initialFiles={formData.files}
                errors={fieldErrors}
              />
            </div>
          )}

          {/* STEP 4: Description */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>📝 CUÉNTANOS MÁS</h2>

              <div className="form-group">
                <label htmlFor="description">
                  Descripción ({formData.description.length}/50 mín) *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Describe detalladamente lo que viste..."
                  rows="5"
                  className={fieldErrors.description ? 'error' : ''}
                />
                <span className="char-count">
                  {formData.description.length}/50 caracteres mínimo
                </span>
                {fieldErrors.description && (
                  <span className="field-error">{fieldErrors.description}</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Summary */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>📸 ¿TIENES EVIDENCIA?</h2>

              <div className="form-group">
                <label>Archivos Multimedia *</label>
                <div
                  className="file-drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="file-icon">📁</div>
                  <p className="file-text">
                    {formData.files.length === 0
                      ? 'Arrastra archivos aquí o haz clic'
                      : `${formData.files.length} archivo(s) seleccionado(s)`}
                  </p>
                  <input
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/m4a,audio/aac"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="files" className="file-btn">
                    Selecciona archivos
                  </label>
                </div>

                <div className="file-info">
                  <p>📷 Imágenes: sin límite</p>
                  <p>🎥 Video: máximo 1</p>
                  <p>🎵 Audio: máximo 2</p>
                </div>

                {fieldErrors.files && (
                  <span className="field-error">{fieldErrors.files}</span>
                )}
              </div>
            </div>
          )}

          {/* Error global */}
          {fieldErrors.submit && (
            <div className="submit-error">❌ {fieldErrors.submit}</div>
          )}

          {/* Buttons */}
          <div className="form-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-prev"
                onClick={handlePrev}
                disabled={loading}
              >
                ← ANTERIOR
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-next"
                onClick={handleNext}
                disabled={loading}
              >
                SIGUIENTE →
              </button>
            ) : (
              <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Subiendo caso...' : 'SUBIR CASO'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal caseId={successCaseId} isOpen={showSuccess} />
    </div>
  )
}

export default UploadStepper
