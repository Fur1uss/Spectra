import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import './ImageModal.css'

const ImageModal = ({ isOpen, onClose, imageUrl, imageAlt }) => {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevenir scroll del body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !imageUrl) return null

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cerrar */}
        <button className="image-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Imagen agrandada */}
        <img 
          src={imageUrl} 
          alt={imageAlt || 'Imagen ampliada'}
          className="image-modal-image"
          onError={(e) => {
            e.target.src = '/placeholder-image.webp'
          }}
        />
      </div>
    </div>
  )
}

export default ImageModal
