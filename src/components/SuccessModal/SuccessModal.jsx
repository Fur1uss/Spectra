import { useNavigate } from 'react-router-dom'
import './SuccessModal.css'

const SuccessModal = ({ caseId, isOpen }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleViewCase = () => {
    navigate(`/case/${caseId}`)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">✨</div>
        <h2>¡Caso subido exitosamente!</h2>
        <p>Tu reporte de fenómeno paranormal ha sido registrado.</p>
        <button className="btn-view-case" onClick={handleViewCase}>
          Ver Caso
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
