import { useState, useEffect, useRef } from 'react'
import {
  searchCountries,
  searchRegions,
  searchCities,
  isValidResult
} from '../../utils/nominatimAPI.js'
import './LocationSelector.css'

const LocationSelector = ({ onLocationSelect, initialValue = {} }) => {
  const [step, setStep] = useState(1) // 1: País, 2: Región, 3: Ciudad/Comuna
  
  const [selectedCountry, setSelectedCountry] = useState(initialValue.country || '')
  const [selectedRegion, setSelectedRegion] = useState(initialValue.region || '')
  const [selectedCity, setSelectedCity] = useState(initialValue.address || '')

  const [countrySearch, setCountrySearch] = useState('')
  const [regionSearch, setRegionSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')

  const [countryOptions, setCountryOptions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])

  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const [loading, setLoading] = useState(false)

  const countryDropdownRef = useRef(null)
  const regionDropdownRef = useRef(null)
  const cityDropdownRef = useRef(null)
  const countrySearchTimeoutRef = useRef(null)
  const regionSearchTimeoutRef = useRef(null)
  const citySearchTimeoutRef = useRef(null)

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false)
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target)) {
        setShowRegionDropdown(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar países con debounce
  useEffect(() => {
    if (countrySearchTimeoutRef.current) {
      clearTimeout(countrySearchTimeoutRef.current)
    }

    if (countrySearch.trim().length > 0) {
      setLoading(true)
      countrySearchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchCountries(countrySearch)
          setCountryOptions(results)
        } catch (error) {
          console.error('Error searching countries:', error)
          setCountryOptions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setCountryOptions([])
    }

    return () => {
      if (countrySearchTimeoutRef.current) {
        clearTimeout(countrySearchTimeoutRef.current)
      }
    }
  }, [countrySearch])

  // Cuando se selecciona país, cargar regiones
  useEffect(() => {
    if (selectedCountry) {
      setStep(2)
      setRegionOptions([])
      setSelectedRegion(null)
      setRegionSearch('')
      setStep(2)
    }
  }, [selectedCountry])

  // Buscar regiones con debounce
  useEffect(() => {
    if (regionSearchTimeoutRef.current) {
      clearTimeout(regionSearchTimeoutRef.current)
    }

    if (selectedCountry && regionSearch.trim().length > 0) {
      setLoading(true)
      regionSearchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchRegions(selectedCountry, regionSearch)
          setRegionOptions(results)
        } catch (error) {
          console.error('Error searching regions:', error)
          setRegionOptions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setRegionOptions([])
    }

    return () => {
      if (regionSearchTimeoutRef.current) {
        clearTimeout(regionSearchTimeoutRef.current)
      }
    }
  }, [regionSearch, selectedCountry])

  // Cuando se selecciona región, cargar ciudades
  useEffect(() => {
    if (selectedRegion) {
      setStep(3)
      setCityOptions([])
      setSelectedCity(null)
      setCitySearch('')
    }
  }, [selectedRegion])

  // Buscar ciudades con debounce
  useEffect(() => {
    if (citySearchTimeoutRef.current) {
      clearTimeout(citySearchTimeoutRef.current)
    }

    if (selectedRegion && selectedCountry && citySearch.trim().length > 0) {
      setLoading(true)
      citySearchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchCities(selectedRegion, selectedCountry, citySearch)
          setCityOptions(results)
        } catch (error) {
          console.error('Error searching cities:', error)
          setCityOptions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setCityOptions([])
    }

    return () => {
      if (citySearchTimeoutRef.current) {
        clearTimeout(citySearchTimeoutRef.current)
      }
    }
  }, [citySearch, selectedRegion, selectedCountry])

  // Completar selección de ciudad
  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setCitySearch(city.name || city)
    setShowCityDropdown(false)
    
    // Enviar datos al padre
    onLocationSelect({
      country: selectedCountry,
      region: selectedRegion,
      address: city.name || city,
      latitude: city.lat,
      longitude: city.lng
    })
  }

  return (
    <div className="location-selector">
      <div className="location-form">
        <div className="location-step" ref={countryDropdownRef}>
          <label>País *</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Buscar país..."
              value={selectedCountry ? `${selectedCountry}` : countrySearch}
              onChange={(e) => {
                if (selectedCountry) {
                  setCountrySearch('')
                  setSelectedCountry(null)
                }
                setCountrySearch(e.target.value)
                setShowCountryDropdown(true)
              }}
              onFocus={() => {
                if (countrySearch || !selectedCountry) {
                  setShowCountryDropdown(true)
                }
              }}
              className="search-input"
            />
            {loading && <span className="loading-spinner">⟳</span>}
            {showCountryDropdown && countryOptions.length > 0 && (
              <div className="dropdown-menu">
                {countryOptions.map((country) => (
                  <div
                    key={country.osm_id}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCountry(country.name)
                      setCountrySearch('')
                      setShowCountryDropdown(false)
                      setSelectedRegion(null)
                      setRegionSearch('')
                      setSelectedCity(null)
                      setCitySearch('')
                    }}
                  >
                    {country.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {step >= 2 && (
          <div className="location-step" ref={regionDropdownRef}>
            <label>Región/Provincia *</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar región..."
                value={selectedRegion ? `${selectedRegion}` : regionSearch}
                onChange={(e) => {
                  if (selectedRegion) {
                    setRegionSearch('')
                    setSelectedRegion(null)
                  }
                  setRegionSearch(e.target.value)
                  setShowRegionDropdown(true)
                }}
                onFocus={() => {
                  if (regionSearch || !selectedRegion) {
                    setShowRegionDropdown(true)
                  }
                }}
                className="search-input"
              />
              {loading && <span className="loading-spinner">⟳</span>}
              {showRegionDropdown && regionOptions.length > 0 && (
                <div className="dropdown-menu">
                  {regionOptions.map((region) => (
                    <div
                      key={region.osm_id}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedRegion(region.name)
                        setRegionSearch('')
                        setShowRegionDropdown(false)
                        setSelectedCity(null)
                        setCitySearch('')
                      }}
                    >
                      {region.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="location-step" ref={cityDropdownRef}>
            <label>Ciudad/Municipio *</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar ciudad..."
                value={selectedCity ? selectedCity.name : citySearch}
                onChange={(e) => {
                  if (selectedCity) {
                    setCitySearch('')
                    setSelectedCity(null)
                  }
                  setCitySearch(e.target.value)
                  setShowCityDropdown(true)
                }}
                onFocus={() => {
                  if (citySearch || !selectedCity) {
                    setShowCityDropdown(true)
                  }
                }}
                className="search-input"
              />
              {loading && <span className="loading-spinner">⟳</span>}
              {showCityDropdown && cityOptions.length > 0 && (
                <div className="dropdown-menu">
                  {cityOptions.map((city) => (
                    <div
                      key={city.osm_id}
                      className="dropdown-item"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && selectedCity && (
          <div className="location-summary">
            <p className="summary-label">Ubicación seleccionada:</p>
            <p className="summary-text">
              {selectedCity.name}, {selectedRegion}, {selectedCountry}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LocationSelector
