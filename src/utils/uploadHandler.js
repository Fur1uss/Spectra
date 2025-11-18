import { supabase } from './supabase.js'

/**
 * Verifica si una URL firmada aún es válida
 * @param {string} signedUrl - URL firmada a verificar
 * @returns {boolean} true si la URL es válida, false si está expirada
 */
const isSignedUrlValid = (signedUrl) => {
  try {
    if (!signedUrl || !signedUrl.includes('token=')) {
      return false;
    }
    
    const urlObj = new URL(signedUrl);
    const tokenParam = urlObj.searchParams.get('token');
    
    if (!tokenParam) {
      return false;
    }
    
    // Decodificar el JWT (solo la parte del payload)
    try {
      // El token puede tener formato JWT estándar o formato de Supabase
      const parts = tokenParam.split('.');
      if (parts.length < 2) {
        return false;
      }
      
      // Decodificar el payload (segunda parte del JWT)
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const exp = payload.exp;
      
      if (!exp) {
        return false;
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      // Considerar válida si expira en más de 1 hora (3600 segundos)
      // Esto evita regenerar URLs que aún son válidas
      return (exp - now) > 3600;
    } catch (e) {
      // Si no se puede decodificar, asumir que no es válida
      return false;
    }
  } catch (e) {
    return false;
  }
};

/**
 * Genera una URL firmada fresca desde un path o URL existente
 * @param {string} filePathOrUrl - Path del archivo o URL firmada existente
 * @param {number} expiresIn - Tiempo de expiración en segundos (default: 7 días)
 * @param {boolean} forceRefresh - Forzar regeneración incluso si la URL es válida
 * @returns {Promise<string|null>} URL firmada o null si hay error
 */
export const getSignedUrl = async (filePathOrUrl, expiresIn = 60 * 60 * 24 * 7, forceRefresh = false) => {
  try {
    // Si ya es un path simple (no empieza con http), usarlo directamente
    if (!filePathOrUrl.startsWith('http://') && !filePathOrUrl.startsWith('https://')) {
      const { data: signedUrl, error } = await supabase.storage
        .from('multimedia')
        .createSignedUrl(filePathOrUrl, expiresIn)
      
      if (error) {
        console.error('Error creating signed URL from path:', error)
        return null
      }
      
      return signedUrl.signedUrl
    }
    
    // Si es una URL firmada y aún es válida, no regenerar
    if (!forceRefresh && isSignedUrlValid(filePathOrUrl)) {
      return filePathOrUrl
    }
    
    // Si es una URL, extraer el path
    let filePath = null
    
    try {
      const urlObj = new URL(filePathOrUrl)
      
      // Extraer path de URL firmada: /storage/v1/object/sign/multimedia/{path}?token=...
      const signedMatch = urlObj.pathname.match(/\/storage\/v1\/object\/sign\/multimedia\/(.+)/)
      if (signedMatch) {
        filePath = decodeURIComponent(signedMatch[1].split('?')[0])
      }
      
      // Extraer path de URL pública: /storage/v1/object/public/multimedia/{path}
      if (!filePath) {
        const publicMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/multimedia\/(.+)/)
        if (publicMatch) {
          filePath = decodeURIComponent(publicMatch[1])
        }
      }
    } catch (e) {
      console.warn('No se pudo parsear la URL:', filePathOrUrl, e)
      // Si no se puede extraer el path, devolver la URL original
      return filePathOrUrl
    }
    
    // Si no se pudo extraer el path, devolver la URL original
    if (!filePath) {
      console.warn('No se pudo extraer el path de la URL:', filePathOrUrl)
      return filePathOrUrl
    }
    
    // Generar nueva URL firmada con el path extraído
    const { data: signedUrl, error } = await supabase.storage
      .from('multimedia')
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      console.error('Error creating signed URL:', error)
      // Fallback: intentar URL pública si el bucket es público
      const { data: publicUrl } = supabase.storage
        .from('multimedia')
        .getPublicUrl(filePath)
      return publicUrl.publicUrl
    }
    
    return signedUrl.signedUrl
  } catch (error) {
    console.error('Error getting signed URL:', error)
    // Si todo falla, devolver la URL original
    return filePathOrUrl
  }
}

// Función para refrescar URLs firmadas (mantener compatibilidad)
export const refreshSignedUrl = async (filePath) => {
  return getSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 días de validez
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

      // Guardar el path del archivo en lugar de la URL firmada
      // Las URLs firmadas se generarán dinámicamente cuando se necesiten
      return {
        path: filePath,
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
 * @param {Array} uploadedFiles - Array de archivos subidos (con path o url)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveFilesToDatabase = async (caseId, uploadedFiles) => {
  try {
    const fileRecords = uploadedFiles.map(item => ({
      Case: caseId,
      // Guardar path si existe, sino usar url (para compatibilidad con datos antiguos)
      url: item.path || item.url,
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
