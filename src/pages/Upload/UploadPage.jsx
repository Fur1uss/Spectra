import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import SuccessModal from '../../components/SuccessModal/SuccessModal.jsx'
import {
  validateFiles,
  uploadFilesToSupabase,
  createCase,
  saveFilesToDatabase,
  createOrGetLocation
} from '../../utils/uploadHandler.js'
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
    country: '',
    region: '',
    address: '',
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

    if (!formData.country) {
      newErrors.country = 'Ingresa el país'
    }

    if (!formData.address) {
      newErrors.address = 'Ingresa la dirección'
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Selecciona al menos 1 archivo'
    } else {
      const validation = validateFiles(formData.files)
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

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      files: selectedFiles
    }))
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }))
    }
  }

  // Manejar drag & drop
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
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }))
    }
  }

  // Mostrar nombres de archivos seleccionados
  const getFileDisplay = () => {
    if (formData.files.length === 0) {
      return 'Arrastra archivos aquí o haz clic para seleccionar'
    }
    return `${formData.files.length} archivo(s) seleccionado(s)`
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // 1. Crear ubicación
      const locationResult = await createOrGetLocation({
        country: formData.country,
        region: formData.region || '',
        address: formData.address
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
      const uploadResult = await uploadFilesToSupabase(formData.files, caseId)

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
        country: '',
        region: '',
        address: '',
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
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="country">País *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Ej: Argentina"
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="region">Región/Provincia (opcional)</label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Ej: Buenos Aires"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label htmlFor="address">Dirección/Localidad *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ej: Calle Principal 123, La Plata"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          {/* Carga de archivos */}
          <div className="form-group">
            <label>Archivos Multimedia *</label>
            <div
              className="file-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="file-drop-icon">📁</div>
              <p>{getFileDisplay()}</p>
              <input
                type="file"
                id="files"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/m4a,audio/aac"
                style={{ display: 'none' }}
              />
              <label htmlFor="files" className="file-label">
                Selecciona archivos
              </label>
              <p className="file-help">
                📷 Imágenes: ilimitadas | 🎥 Video: 1 máximo | 🎵 Audios: 2 máximos
              </p>
            </div>
            {errors.files && <span className="error-message">{errors.files}</span>}
          </div>

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
