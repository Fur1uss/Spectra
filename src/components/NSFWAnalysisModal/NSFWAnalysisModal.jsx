import React from 'react';
import './NSFWAnalysisModal.css';

const NSFWAnalysisModal = ({ isOpen, status, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="nsfw-modal-overlay">
      <div className="nsfw-modal-container">
        {status === 'analyzing' && (
          <>
            <div className="nsfw-modal-icon analyzing">
              <div className="spinner"></div>
            </div>
            <h3 className="nsfw-modal-title">Analizando imagen</h3>
            <p className="nsfw-modal-message">
              Verificando contenido de <strong>{fileName}</strong>
            </p>
            <div className="nsfw-modal-progress">
              <div className="progress-bar-animated"></div>
            </div>
          </>
        )}

        {status === 'safe' && (
          <>
            <div className="nsfw-modal-icon safe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="nsfw-modal-title safe">Imagen aprobada</h3>
            <p className="nsfw-modal-message">
              El contenido de <strong>{fileName}</strong> es seguro
            </p>
          </>
        )}

        {status === 'nsfw' && (
          <>
            <div className="nsfw-modal-icon nsfw">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="nsfw-modal-title nsfw">Contenido no permitido</h3>
            <p className="nsfw-modal-message">
              El archivo <strong>{fileName}</strong> contiene contenido explícito y no puede ser subido
            </p>
            <div className="nsfw-modal-warning">
              <p>Por favor, sube solo contenido apropiado para todos los públicos</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="nsfw-modal-icon error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="nsfw-modal-title error">Error al analizar</h3>
            <p className="nsfw-modal-message">
              No se pudo analizar <strong>{fileName}</strong>
            </p>
            <p className="nsfw-modal-submessage">
              Por seguridad, el archivo no será subido
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NSFWAnalysisModal;

