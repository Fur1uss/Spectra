import { supabase } from './supabase.js'

// Función para refrescar URLs firmadas
export const refreshSignedUrl = async (filePath) => {
  try {
    const { data: signedUrl, error } = await supabase.storage
      .from('multimedia')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 días de validez
    
    if (error) throw error
    return signedUrl.signedUrl
  } catch (error) {
    console.error('Error refreshing signed URL:', error)
    return null
  }
}

/**
 * Valida y carga archivos a Supabase Storage
 * Reglas:
 * - Máximo 1 video (mp4, webm, mov)
 * - Imágenes ilimitadas (jpg, png, webp, gif)
 * - Máximo 2 audios (mp3, wav, m4a, aac)
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac']

// Helper para obtener el tipo de archivo por extensión
const getFileTypeFromExtension = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac']
  
  if (imageTypes.includes(extension)) return 'image'
  if (videoTypes.includes(extension)) return 'video'
  if (audioTypes.includes(extension)) return 'audio'
  return 'unknown'
}

export const validateFiles = (files) => {
  let imageCount = 0
  let videoCount = 0
  let audioCount = 0
  const errors = []

  for (let file of files) {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      imageCount++
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      videoCount++
    } else if (ALLOWED_AUDIO_TYPES.includes(file.type)) {
      audioCount++
    } else {
      errors.push(`${file.name}: Tipo de archivo no permitido`)
    }
  }

  if (videoCount > 1) {
    errors.push('Máximo 1 video permitido')
  }

  if (audioCount > 2) {
    errors.push('Máximo 2 audios permitidos')
  }

  if (imageCount === 0 && videoCount === 0 && audioCount === 0) {
    errors.push('Debes seleccionar al menos 1 archivo (imagen, video o audio)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    counts: { imageCount, videoCount, audioCount }
  }
}

/**
 * Carga archivos a Supabase Storage
 * @param {File[]} files - Array de archivos a cargar
 * @param {number} caseId - ID del caso para crear la carpeta
 * @returns {Promise<{success: boolean, urls: string[], error?: string}>}
 */
export const uploadFilesToSupabase = async (files, caseId) => {
  try {
    const uploadedUrls = []

    // Subir archivos en paralelo para mayor velocidad
    const uploadPromises = files.map(async (fileItem) => {
      // Extraer el archivo real del objeto fileItem
      const file = fileItem.file || fileItem
      const fileType = fileItem.type || getFileTypeFromExtension(file.name)
      
      let subfolder = 'fotos' // default

      if (ALLOWED_VIDEO_TYPES.includes(file.type) || fileType === 'video') {
        subfolder = 'videos'
      } else if (ALLOWED_AUDIO_TYPES.includes(file.type) || fileType === 'audio') {
        subfolder = 'audios'
      }

      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}_${subfolder}.${fileExtension}`
      const filePath = `caso_${caseId}/${subfolder}/${fileName}`

      const { error } = await supabase.storage
        .from('multimedia')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600'
        })

      if (error) {
        throw new Error(`Error al subir ${file.name}: ${error.message}`)
      }

      // Obtener URL firmada del archivo (no requiere CORS)
      const { data: signedUrl, error: signedError } = await supabase.storage
        .from('multimedia')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 días de validez

      if (signedError) {
        console.warn('Error creating signed URL, using public URL:', signedError)
        // Fallback a URL pública
        const { data: urlData } = supabase.storage
          .from('multimedia')
          .getPublicUrl(filePath)
        return {
          url: urlData.publicUrl,
          type: fileType
        }
      }

      return {
        url: signedUrl.signedUrl,
        type: fileType
      }
    })

    // Esperar a que todos los archivos se suban en paralelo
    const results = await Promise.all(uploadPromises)
    
    return {
      success: true,
      urls: results
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      urls: []
    }
  }
}

/**
 * Crea un caso en la base de datos
 * @param {Object} caseData - Datos del caso (debe incluir userId)
 * @returns {Promise<{success: boolean, caseId?: number, error?: string}>}
 */
export const createCase = async (caseData) => {
  try {
    const { data, error } = await supabase
      .from('Case')
      .insert([
        {
          user_id: caseData.userId,
          caseType: caseData.caseTypeId,
          caseName: caseData.caseName,
          description: caseData.description,
          timeHour: caseData.timeHour,
          location: caseData.locationId
        }
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      caseId: data[0].id
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Guarda archivos en la tabla Files vinculados al caso
 * @param {number} caseId - ID del caso
 * @param {Array} uploadedUrls - Array de URLs de archivos subidos
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveFilesToDatabase = async (caseId, uploadedUrls) => {
  try {
    const fileRecords = uploadedUrls.map(item => ({
      Case: caseId,
      url: item.url,
      type_multimedia: item.type
    }))

    const { error } = await supabase
      .from('Files')
      .insert(fileRecords)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Crea o obtiene una ubicación
 * @param {Object} locationData - {address, country, region}
 * @returns {Promise<{success: boolean, locationId?: number, error?: string}>}
 */
export const createOrGetLocation = async (locationData) => {
  try {
    // Primero buscar si ya existe
    const { data: existingLocation } = await supabase
      .from('Location')
      .select('id')
      .eq('address', locationData.address)
      .eq('country', locationData.country)
      .single()

    if (existingLocation) {
      return {
        success: true,
        locationId: existingLocation.id
      }
    }

    // Si no existe, crear nueva
    const { data, error } = await supabase
      .from('Location')
      .insert([
        {
          address: locationData.address,
          country: locationData.country,
          region: locationData.region || null
        }
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      locationId: data[0].id
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
