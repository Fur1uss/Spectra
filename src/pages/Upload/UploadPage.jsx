import { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import SuccessModal from '../../components/SuccessModal/SuccessModal.jsx'
import LocationSelector from '../../components/LocationSelector/LocationSelector.jsx'
import FileUploader from '../../components/FileUploader/FileUploader.jsx'
import {
  validateFiles,
  uploadFilesToSupabase,
  createCase,
  saveFilesToDatabase
} from '../../utils/uploadHandler.js'
import { locationService } from '../../utils/locationService.js'
import { supabase } from '../../utils/supabase.js'
import './UploadPage.css'

const UploadPage = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, loading: authLoading } = useContext(AuthContext)

  // Redirigir si no está logueado - esperar a que cargue el auth
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, authLoading, navigate])

  // Estado del formulario
  const [formData, setFormData] = useState({
    caseType: '',
    description: '',
    timeHour: '',
    location: {
      country: '',
      region: '',
      address: ''
    },
    files: []
  })

  const [caseTypes, setCaseTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successCaseId, setSuccessCaseId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Cargar tipos de casos
  useEffect(() => {
    const loadCaseTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('Case_Type')
          .select('id, nombre_Caso')
          .order('nombre_Caso', { ascending: true })

        if (error) throw error
        setCaseTypes(data || [])
      } catch (error) {
        console.error('Error cargando tipos de casos:', error)
      }
    }

    loadCaseTypes()
  }, [])

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.caseType) {
      newErrors.caseType = 'Selecciona un tipo de caso'
    }

    if (!formData.description || formData.description.trim().length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres'
    }

    if (!formData.timeHour) {
      newErrors.timeHour = 'Selecciona la hora del evento'
    }

    if (!formData.location.country) {
      newErrors.location = { ...errors.location, country: 'Selecciona un país' }
    }

    if (!formData.location.address) {
      newErrors.location = { ...errors.location, address: 'Ingresa la dirección' }
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Selecciona al menos 1 archivo'
    } else {
      const fileObjects = formData.files.map(f => f.file || f);
      const validation = validateFiles(fileObjects)
      if (!validation.isValid) {
        newErrors.files = validation.errors.join(' | ')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambio en inputs de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario modifica el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Manejar cambio de ubicación
  const handleLocationChange = useCallback((locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }))
    // Limpiar errores de ubicación
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: {}
      }))
    }
  }, [errors.location])

  // Manejar cambio de archivos
  const handleFilesChange = useCallback((filesData) => {
    setFormData(prev => ({
      ...prev,
      files: filesData
    }))
    // Limpiar error de archivos
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }))
    }
  }, [errors.files])


  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // 1. Crear ubicación
      const locationResult = await locationService.createOrGetLocation({
        country: formData.location.country,
        region: formData.location.region || '',
        address: formData.location.address
      })

      if (!locationResult.success) {
        throw new Error(locationResult.error)
      }

      // 2. Crear caso en DB
      const caseResult = await createCase({
        userId: user.id,
        caseTypeId: parseInt(formData.caseType),
        description: formData.description,
        timeHour: formData.timeHour,
        locationId: locationResult.locationId
      })

      if (!caseResult.success) {
        throw new Error(caseResult.error)
      }

      const caseId = caseResult.caseId

      // 3. Subir archivos a Storage
      const fileObjects = formData.files.map(f => f.file || f);
      const uploadResult = await uploadFilesToSupabase(fileObjects, caseId)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      // 4. Guardar URLs en tabla Files
      const filesResult = await saveFilesToDatabase(caseId, uploadResult.urls)

      if (!filesResult.success) {
        throw new Error(filesResult.error)
      }

      // Mostrar modal de éxito
      setSuccessCaseId(caseId)
      setShowSuccess(true)

      // Resetear formulario para permitir otro caso
      setFormData({
        caseType: '',
        description: '',
        timeHour: '',
        location: {
          country: '',
          region: '',
          address: ''
        },
        files: []
      })
      setErrors({})
    } catch (error) {
      console.error('Error al subir caso:', error)
      setErrors({
        submit: error.message || 'Error al subir el caso. Intenta de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="upload-page"><p>Cargando...</p></div>
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Reportar Caso Paranormal</h1>
          <p>Comparte tu experiencia de fenómeno paranormal con nuestra comunidad</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Tipo de Caso */}
          <div className="form-group">
            <label htmlFor="caseType">Tipo de Caso *</label>
            <select
              id="caseType"
              name="caseType"
              value={formData.caseType}
              onChange={handleInputChange}
              className={errors.caseType ? 'error' : ''}
            >
              <option value="">-- Selecciona un tipo --</option>
              {caseTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nombre_Caso}
                </option>
              ))}
            </select>
            {errors.caseType && <span className="error-message">{errors.caseType}</span>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">
              Descripción ({formData.description.length}/50 mín) *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe detalladamente lo que viste, sentiste o experimentaste..."
              rows="6"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Hora del evento */}
          <div className="form-group">
            <label htmlFor="timeHour">Hora del evento *</label>
            <input
              type="time"
              id="timeHour"
              name="timeHour"
              value={formData.timeHour}
              onChange={handleInputChange}
              className={errors.timeHour ? 'error' : ''}
            />
            {errors.timeHour && <span className="error-message">{errors.timeHour}</span>}
          </div>

          {/* Ubicación */}
          <LocationSelector
            onLocationChange={handleLocationChange}
            initialData={formData.location}
            errors={errors.location || {}}
          />

          {/* Carga de archivos */}
          <FileUploader
            onFilesChange={handleFilesChange}
            errors={errors}
          />

          {/* Error general */}
          {errors.submit && (
            <div className="alert alert-error">
              ❌ {errors.submit}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Subiendo caso...' : 'SUBIR CASO'}
          </button>
        </form>
      </div>

      {/* Modal de éxito */}
      <SuccessModal caseId={successCaseId} isOpen={showSuccess} />
    </div>
  )
}

export default UploadPage
