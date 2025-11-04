import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import fullpage from 'fullpage.js'
import 'fullpage.js/dist/fullpage.css'
import { useCase } from '../../hooks/useCase'
import MediaViewer from '../../components/MediaViewer/MediaViewer'
import ImageModal from '../../components/ImageModal/ImageModal'
import CommentsSection from '../../components/CommentsSection/CommentsSection'
import './ViewCase.css'

const ViewCase = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const fullpageRef = useRef(null)
  const fullpageApiRef = useRef(null)
  
  // Obtener datos del caso desde la base de datos
  const { caseData, loading, error } = useCase(caseId)
  
  // Estado del modal de imagen
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    // Inicializar fullPage.js solo si no está ya inicializado y los datos están cargados
    if (fullpageRef.current && !fullpageApiRef.current && caseData && !loading) {
      fullpageApiRef.current = new fullpage(fullpageRef.current, {
        licenseKey: 'GPL-v3.0', // GPLv3 para proyectos open source
        autoScrolling: true,
        scrollingSpeed: 700,
        fitToSection: true,
        navigation: true,
        navigationPosition: 'bottom', // Bullets en parte inferior
        navigationTooltips: ['Info del Caso', 'Ubicación & Comentarios'],
        keyboardScrolling: true,
        touchSensitivity: 5,
        css3: true,
        verticalCentered: false,
        scrollOverflow: true,
        recordHistory: true,
        orientation: 'sections', // Scroll horizontal (izquierda/derecha)
        responsiveWidth: 768, // En mobile, deshabilitar fullPage
        afterLoad: (origin, destination, direction, trigger) => {
          console.log('Loaded section:', destination.index)
        },
        onLeave: (origin, destination, direction, trigger) => {
          console.log('Leaving section:', origin.index)
        }
      })
    }

    return () => {
      if (fullpageApiRef.current) {
        fullpageApiRef.current.destroy('all')
        fullpageApiRef.current = null
      }
    }
  }, [caseId, caseData, loading])

  // Estados de carga y error
  if (loading) {
    return (
      <div className="view-case-loading">
        <div className="loading-spinner"></div>
        <p>Cargando caso...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-case-error">
        <h2>Error al cargar el caso</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/hub')} className="btn-back">
          ← Volver al Hub
        </button>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="view-case-error">
        <h2>Caso no encontrado</h2>
        <p>El caso que buscas no existe o ha sido eliminado.</p>
        <button onClick={() => navigate('/hub')} className="btn-back">
          ← Volver al Hub
        </button>
      </div>
    )
  }


  // Separar archivos por tipo
  const images = caseData?.Files?.filter(file => file.type_multimedia === 'image') || []
  const videos = caseData?.Files?.filter(file => file.type_multimedia === 'video') || []
  const audios = caseData?.Files?.filter(file => file.type_multimedia === 'audio') || []

  // Funciones para manejar el modal de imagen
  const handleImageClick = (image) => {
    setSelectedImage(image)
    setIsImageModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsImageModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div id="fullpage" ref={fullpageRef}>
      {/* Botón de volver */}
      <button className="btn-back" onClick={() => navigate('/hub')}>
        ← Volver
      </button>

      {/* SECCIÓN 1: Información del Caso */}
      <div className="section">
        <div className="view-case-content">
          <div className="column column-left">
            <h1 className="case-title">{caseData.caseName || 'Sin título'}</h1>
            
            <div className="description-section">
              <h2>Descripción</h2>
              <p>{caseData.description || 'Sin descripción disponible'}</p>
            </div>

            {audios.length > 0 && (
              <div className="audios-section">
                <h3>Audios</h3>
                <div className="audios-container">
                  {audios.map((audio, index) => (
                    <MediaViewer
                      key={audio.id}
                      file={audio}
                      type="audio"
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="column column-right">
            {images.length > 0 && (
              <div className="images-section">
                <h3>Imágenes ({images.length})</h3>
                <div className="images-gallery">
                  {images.map((image, index) => (
                    <div key={image.id} className="image-polaroid">
                      <MediaViewer
                        file={image}
                        type="image"
                        index={index}
                        onImageClick={handleImageClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="video-section">
                <h3>Videos ({videos.length})</h3>
                {videos.map((video, index) => (
                  <MediaViewer
                    key={video.id}
                    file={video}
                    type="video"
                    index={index}
                  />
                ))}
              </div>
            )}

            {images.length === 0 && videos.length === 0 && (
              <div className="no-media">
                <p>No hay archivos multimedia disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Ubicación y Comentarios */}
      <div className="section">
        <div className="view-case-content">
          <div className="column column-left">
            <div className="case-type-section">
              <h3>{caseData.Case_Type?.nombre_Caso || 'Sin tipo'}</h3>
            </div>

            <div className="location-section">
              <h3>Ubicación</h3>
              <div className="location-info">
                <p><strong>País:</strong> {caseData.Location?.country || 'No especificado'}</p>
                <p><strong>Dirección:</strong> {caseData.Location?.address || 'No especificada'}</p>
              </div>
            </div>

            <div className="case-meta">
              <h3>Información del Caso</h3>
              <p><strong>Subido por:</strong> {caseData.User?.username || 'Usuario desconocido'}</p>
              <p><strong>Fecha:</strong> {new Date(caseData.timeHour).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> {new Date(caseData.timeHour).toLocaleTimeString('es-ES')}</p>
            </div>
          </div>

          <div className="column column-right">
            <CommentsSection caseId={caseId} />
          </div>
        </div>
      </div>

      {/* Modal de imagen externo */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={handleCloseModal}
        imageUrl={selectedImage?.url}
        imageAlt={selectedImage ? `Imagen ${images.findIndex(img => img.id === selectedImage.id) + 1}` : ''}
      />
    </div>
  )
}

export default ViewCase
