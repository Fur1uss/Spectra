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
      
      // Buscar ubicación existente usando ilike para búsqueda flexible
      const { data: existingLocation, error: searchError } = await supabase
        .from('Location')
        .select('id')
        .eq('country', country)
        .ilike('address', address)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingLocation) {
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
