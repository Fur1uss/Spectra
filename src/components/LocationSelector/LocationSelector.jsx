import React, { useState, useEffect, useCallback } from 'react';
import { countriesService } from '../../utils/countriesService.js';
import './LocationSelector.css';

const LocationSelector = ({ onLocationChange, initialData = {}, errors = {} }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(initialData.country || '');
  const [address, setAddress] = useState(initialData.address || '');

  // Cargar países al montar el componente
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const countriesData = await countriesService.getAllCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Notificar cambios al componente padre
  const notifyLocationChange = useCallback(() => {
    onLocationChange({
      country: selectedCountry,
      address: address
    });
  }, [selectedCountry, address, onLocationChange]);

  useEffect(() => {
    notifyLocationChange();
  }, [notifyLocationChange]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  return (
    <div className="location-selector">
      {/* País */}
      <div className="form-group">
        <label htmlFor="country">País *</label>
        <select
          id="country"
          value={selectedCountry}
          onChange={handleCountryChange}
          className={errors.country ? 'error' : ''}
          disabled={loading}
        >
          <option value="">
            {loading ? 'Cargando países...' : '-- Selecciona un país --'}
          </option>
          {countries.map((country, index) => (
            <option key={index} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country && <span className="error-message">{errors.country}</span>}
      </div>

      {/* Dirección */}
      <div className="form-group">
        <label htmlFor="address">Dirección (opcional)</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={handleAddressChange}
          placeholder="Ej: Calle Principal 123, Ciudad, Región"
          className={errors.address ? 'error' : ''}
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
    </div>
  );
};

export default LocationSelector;