// Servicio para manejar países usando REST Countries API
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1'

// Cache para países
let countriesCache = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
let cacheTimestamp = null

// Lista de fallback para países (solo en caso de error crítico)
const FALLBACK_COUNTRIES = [
  'Argentina', 'Brasil', 'Chile', 'Colombia', 'México', 'Perú', 'Uruguay', 'Venezuela',
  'España', 'Francia', 'Italia', 'Alemania', 'Reino Unido', 'Estados Unidos', 'Canadá',
  'Australia', 'Japón', 'China', 'India', 'Rusia', 'Sudáfrica', 'Egipto'
]

// Obtener todos los países
export const getAllCountries = async () => {
  // Verificar cache
  if (countriesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return countriesCache
  }

  try {
    console.log('🌍 Cargando países desde REST Countries API...')
    
    const response = await fetch(`${REST_COUNTRIES_API}/all?fields=name,cca2,region,subregion,capital,population`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`📊 Países recibidos: ${data.length}`)

    const countries = data
      .map(country => ({
        name: country.name.common,
        code: country.cca2,
        region: country.region,
        subregion: country.subregion,
        capital: country.capital?.[0] || '',
        population: country.population || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Guardar en cache
    countriesCache = countries
    cacheTimestamp = Date.now()

    console.log(`✅ ${countries.length} países cargados y cacheados`)
    return countries

  } catch (error) {
    console.error('❌ Error loading countries:', error)
    
    // Fallback a lista predefinida
    const fallbackCountries = FALLBACK_COUNTRIES.map(name => ({
      name,
      code: '',
      region: '',
      subregion: '',
      capital: '',
      population: 0
    }))
    
    console.log('🔄 Usando fallback:', fallbackCountries.length)
    return fallbackCountries
  }
}

// Función eliminada - ya no necesitamos regiones

// Buscar países por nombre
export const searchCountries = async (query) => {
  if (!query.trim()) return []

  try {
    const response = await fetch(`${REST_COUNTRIES_API}/name/${encodeURIComponent(query)}?fields=name,cca2,region,subregion`)
    
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.map(country => ({
      name: country.name.common,
      code: country.cca2,
      region: country.region,
      subregion: country.subregion
    }))

  } catch (error) {
    console.error('Error searching countries:', error)
    return []
  }
}

// Obtener información detallada de un país
export const getCountryDetails = async (countryName) => {
  try {
    const response = await fetch(`${REST_COUNTRIES_API}/name/${encodeURIComponent(countryName)}?fields=name,cca2,region,subregion,capital,population,area,languages,currencies,flags`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const country = data[0]

    return {
      name: country.name.common,
      officialName: country.name.official,
      code: country.cca2,
      region: country.region,
      subregion: country.subregion,
      capital: country.capital?.[0] || '',
      population: country.population || 0,
      area: country.area || 0,
      languages: country.languages || {},
      currencies: country.currencies || {},
      flag: country.flags?.svg || country.flags?.png || ''
    }

  } catch (error) {
    console.error('Error getting country details:', error)
    return null
  }
}

// Servicio principal
export const countriesService = {
  getAllCountries,
  searchCountries,
  getCountryDetails
}
