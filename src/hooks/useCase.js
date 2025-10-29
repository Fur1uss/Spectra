import { useState, useEffect } from 'react'
import { casesService } from '../utils/casesService'

export const useCase = (caseId) => {
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) return

      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Cargando caso:', caseId)
        const data = await casesService.getCaseById(caseId)
        
        if (data) {
          console.log('✅ Caso cargado:', data)
          setCaseData(data)
        } else {
          setError('Caso no encontrado')
        }
      } catch (err) {
        console.error('❌ Error cargando caso:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCase()
  }, [caseId])

  return {
    caseData,
    loading,
    error,
    refetch: () => {
      if (caseId) {
        setLoading(true)
        setError(null)
        loadCase()
      }
    }
  }
}
