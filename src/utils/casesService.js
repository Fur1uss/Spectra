import { supabase } from './supabase.js';

// Servicio para manejar los casos
export const casesService = {
  // Obtener todos los casos con paginación
  async getCases(page = 1, limit = 6, filters = {}) {
    try {
      let query = supabase
        .from('Case')
        .select(`
          *,
          Case_Type!inner(id, nombre_Caso),
          Location!inner(id, address, country),
          User!inner(id, username, first_name, last_name),
          Files(id, url, type_multimedia)
        `)
        .order('timeHour', { ascending: false });

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('caseType', filters.type);
      }
      
      if (filters.search) {
        query = query.or(`caseName.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        cases: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: (page * limit) < (count || 0),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  },

  // Obtener un caso específico por ID
  async getCaseById(id) {
    try {
      const { data, error } = await supabase
        .from('Case')
        .select(`
          *,
          Case_Type!inner(id, nombre_Caso),
          Location!inner(id, address, country),
          User!inner(id, username, first_name, last_name),
          Files(id, url, type_multimedia)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching case:', error);
      throw error;
    }
  },

  // Obtener tipos de casos disponibles para filtros
  async getCaseTypes() {
    try {
      const { data, error } = await supabase
        .from('Case_Type')
        .select('id, nombre_Caso')
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching case types:', error);
      throw error;
    }
  },

  // Buscar casos por término
  async searchCases(searchTerm, page = 1, limit = 6) {
    try {
      const { data, error, count } = await supabase
        .from('Case')
        .select(`
          *,
          Case_Type!inner(id, nombre_Caso),
          Location!inner(id, address, country),
          User!inner(id, username, first_name, last_name),
          Files(id, url, type_multimedia)
        `)
        .or(`caseName.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('timeHour', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        cases: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        searchTerm
      };
    } catch (error) {
      console.error('Error searching cases:', error);
      throw error;
    }
  },

  // Obtener archivos multimedia de un caso específico
  async getCaseFiles(caseId) {
    try {
      const { data, error } = await supabase
        .from('Files')
        .select('*')
        .eq('Case', caseId)
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching case files:', error);
      throw error;
    }
  },

  // Obtener archivos por tipo multimedia
  async getFilesByType(type) {
    try {
      const { data, error } = await supabase
        .from('Files')
        .select(`
          *,
          Case!inner(id, caseName, description)
        `)
        .eq('type_multimedia', type);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching files by type:', error);
      throw error;
    }
  }
};
