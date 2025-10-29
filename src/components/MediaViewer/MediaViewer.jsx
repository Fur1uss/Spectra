import React, { useState, useRef } from 'react'
import './MediaViewer.css'

const MediaViewer = ({ file, type, index, onImageClick }) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const mediaRef = useRef(null)

  const handleError = async () => {
    console.log(`Error cargando ${type}:`, file.url)
    
    // Si es una URL firmada que expiró, intentar refrescar
    if (file.url.includes('supabase.co') && file.url.includes('token=')) {
      console.log('Intentando refrescar URL firmada...')
      // Aquí podrías implementar lógica para refrescar la URL
      // Por ahora, solo mostrar error
    }
    
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    console.log(`${type} cargado:`, file.url)
    setIsLoading(false)
  }

  const handleLoadStart = () => {
    setIsLoading(true)
  }

  const handleImageClick = () => {
    if (type === 'image' && onImageClick) {
      onImageClick(file)
    }
  }

  if (hasError) {
    return (
      <div className="media-error">
        <div className="error-icon">
          {type === 'image' && '🖼️'}
          {type === 'video' && '🎥'}
          {type === 'audio' && '🎵'}
        </div>
        <span>Archivo no disponible</span>
        <small>Content-Type incorrecto</small>
      </div>
    )
  }


  if (type === 'video') {
    return (
      <div className="video-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner-small"></div>
          </div>
        )}
        <video
          ref={mediaRef}
          controls
          className={`video-player ${isLoading ? 'loading' : ''}`}
          crossOrigin="anonymous"
          onError={handleError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleLoad}
        >
          <source src={file.url} type="video/mp4" />
          Tu navegador no soporta el elemento video.
        </video>
        <p className="video-description">Video {index + 1}</p>
      </div>
    )
  }

  if (type === 'audio') {
    return (
      <div className="audio-container">
        <div className="cassette-icon">🎙️</div>
        <span>Audio {index + 1}</span>
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner-small"></div>
          </div>
        )}
        <audio
          ref={mediaRef}
          controls
          src={file.url}
          className={`audio-player ${isLoading ? 'loading' : ''}`}
          crossOrigin="anonymous"
          onError={handleError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleLoad}
        >
          Tu navegador no soporta el elemento audio.
        </audio>
      </div>
    )
  }

  return (
    <>
      {/* Renderizar el contenido normal */}
      {type === 'image' && (
        <div className="image-container">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner-small"></div>
            </div>
          )}
          <img
            ref={mediaRef}
            src={file.url}
            alt={`Imagen ${index + 1}`}
            crossOrigin="anonymous"
            onError={handleError}
            onLoad={handleLoad}
            onLoadStart={handleLoadStart}
            onClick={handleImageClick}
            className={`${isLoading ? 'loading' : ''} clickable-image`}
          />
        </div>
      )}

    </>
  )
}

export default MediaViewer
