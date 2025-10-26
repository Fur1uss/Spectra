// Wrapper para Nominatim API (OpenStreetMap)
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

// Búsqueda de países
export const searchCountries = async (query) => {
  if (!query.trim()) return []
  
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/search?` +
      `q=${encodeURIComponent(query)}&` +
      `featuretype=country&` +
      `format=json&` +
      `limit=10`
    )
    const data = await response.json()
    return data.map(item => ({
      id: item.osm_id,
      name: item.name,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: 'country'
    }))
  } catch (error) {
    console.error('Error buscando países:', error)
    return []
  }
}

// Búsqueda de regiones/provincias por país
export const searchRegions = async (countryName, query) => {
  if (!query.trim()) return []
  
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/search?` +
      `q=${encodeURIComponent(query)}&` +
      `countrycodes=${getCountryCode(countryName)}&` +
      `featuretype=state&` +
      `format=json&` +
      `limit=15`
    )
    const data = await response.json()
    return data.map(item => ({
      id: item.osm_id,
      name: item.name,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: 'region'
    }))
  } catch (error) {
    console.error('Error buscando regiones:', error)
    return []
  }
}

// Búsqueda de ciudades/comunas
export const searchCities = async (regionName, countryName, query) => {
  if (!query.trim()) return []
  
  try {
    const countryCode = getCountryCode(countryName)
    const response = await fetch(
      `${NOMINATIM_BASE}/search?` +
      `q=${encodeURIComponent(query)}&` +
      `countrycodes=${countryCode}&` +
      `featuretype=city&` +
      `format=json&` +
      `limit=20`
    )
    const data = await response.json()
    return data.map(item => ({
      id: item.osm_id,
      name: item.name,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: 'city'
    }))
  } catch (error) {
    console.error('Error buscando ciudades:', error)
    return []
  }
}

// Obtener dirección completa desde coordenadas (reverse geocoding)
export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `format=json`
    )
    const data = await response.json()
    return data.address || null
  } catch (error) {
    console.error('Error obteniendo dirección:', error)
    return null
  }
}

// Mapeo de países a códigos ISO (para Nominatim)
const countryCodeMap = {
  'Argentina': 'ar',
  'Bolivia': 'bo',
  'Brasil': 'br',
  'Chile': 'cl',
  'Colombia': 'co',
  'Costa Rica': 'cr',
  'Cuba': 'cu',
  'Ecuador': 'ec',
  'El Salvador': 'sv',
  'España': 'es',
  'Estados Unidos': 'us',
  'Francia': 'fr',
  'Guatemala': 'gt',
  'Guinea Ecuatorial': 'gq',
  'Guyana': 'gy',
  'Haití': 'ht',
  'Honduras': 'hn',
  'México': 'mx',
  'Nicaragua': 'ni',
  'Panamá': 'pa',
  'Paraguay': 'py',
  'Perú': 'pe',
  'Portugal': 'pt',
  'República Dominicana': 'do',
  'Surinam': 'sr',
  'Uruguay': 'uy',
  'Venezuela': 've',
  'Alemania': 'de',
  'Italia': 'it',
  'Reino Unido': 'gb',
  'Rusia': 'ru',
  'Japón': 'jp',
  'China': 'cn',
  'India': 'in',
  'Australia': 'au',
  'Nueva Zelanda': 'nz',
  'Sudáfrica': 'za'
}

const getCountryCode = (countryName) => {
  // Buscar en el mapeo directo
  if (countryCodeMap[countryName]) {
    return countryCodeMap[countryName]
  }
  
  // Si no encuentra, intenta extraer el código del nombre mostrado
  // Por ejemplo: "Chile" → "cl"
  return countryName.toLowerCase().substring(0, 2)
}

// Validar que es un resultado válido
export const isValidResult = (result) => {
  return result && result.name && result.lat && result.lng
}
