import { supabase } from './supabase.js';

// Servicio para manejar ubicaciones jerárquicas
export const locationService = {
  // Obtener países disponibles
  async getCountries() {
    try {
      const { data, error } = await supabase
        .from('Location')
        .select('country')
        .not('country', 'is', null)
        .order('country');

      if (error) throw error;
      
      // Extraer países únicos
      const uniqueCountries = [...new Set(data.map(item => item.country))];
      return uniqueCountries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  // Obtener regiones por país
  async getRegionsByCountry(country) {
    try {
      const { data, error } = await supabase
        .from('Location')
        .select('address')
        .eq('country', country)
        .not('address', 'is', null)
        .order('address');

      if (error) throw error;
      
      // Extraer regiones únicas (asumiendo que address contiene la región)
      const uniqueRegions = [...new Set(data.map(item => item.address))];
      return uniqueRegions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Crear o obtener ubicación
  async createOrGetLocation(locationData) {
    try {
      const { country, address } = locationData;
      
      // Si no hay dirección, crear directamente sin buscar
      if (!address || address.trim() === '') {
        const { data: newLocation, error: insertError } = await supabase
          .from('Location')
          .insert({
            country,
            address: ''
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        return { success: true, locationId: newLocation.id };
      }

      // Buscar ubicación existente con timeout
      const searchPromise = supabase
        .from('Location')
        .select('id')
        .eq('country', country)
        .ilike('address', `%${address}%`)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location search timeout')), 5000)
      );

      const { data: existingLocation, error: searchError } = await Promise.race([
        searchPromise,
        timeoutPromise
      ]);

      if (searchError && searchError.code !== 'PGRST116') {
        console.warn('Location search failed, creating new location:', searchError.message);
        // Si falla la búsqueda, crear nueva ubicación directamente
      } else if (existingLocation) {
        return { success: true, locationId: existingLocation.id };
      }

      // Crear nueva ubicación
      const { data: newLocation, error: insertError } = await supabase
        .from('Location')
        .insert({
          country,
          address
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return { success: true, locationId: newLocation.id };
    } catch (error) {
      console.error('Error creating/getting location:', error);
      return { success: false, error: error.message };
    }
  }
};
