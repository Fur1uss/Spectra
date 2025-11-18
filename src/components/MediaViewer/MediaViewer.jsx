import React, { useState, useRef } from 'react'
import { getSignedUrl } from '../../utils/uploadHandler.js'
import './MediaViewer.css'

const MediaViewer = ({ file, type, index, onImageClick }) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState(file.url)
  const [retryCount, setRetryCount] = useState(0)
  const mediaRef = useRef(null)

  const handleError = async () => {
    console.log(`Error cargando ${type}:`, imageUrl)
    
    // Intentar refrescar la URL si es de Supabase (máximo 1 intento)
    if (retryCount === 0 && (imageUrl.includes('supabase.co') || imageUrl.includes('/storage/'))) {
      console.log('Intentando refrescar URL firmada...')
      try {
        const freshUrl = await getSignedUrl(imageUrl, 60 * 60)
        if (freshUrl && freshUrl !== imageUrl) {
          setImageUrl(freshUrl)
          setRetryCount(1)
          setIsLoading(true)
          return // No marcar como error todavía, intentar con la nueva URL
        }
      } catch (error) {
        console.error('Error al refrescar URL:', error)
      }
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
          <source src={imageUrl} type="video/mp4" />
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
          src={imageUrl}
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
            src={imageUrl}
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
