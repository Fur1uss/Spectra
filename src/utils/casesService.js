import { supabase } from './supabase.js';
import { getSignedUrl } from './uploadHandler.js';

/**
 * Procesa los archivos de un caso para generar URLs firmadas frescas
 * @param {Array} files - Array de archivos con url/path
 * @returns {Promise<Array>} Array de archivos con URLs actualizadas
 */
const processFilesWithFreshUrls = async (files) => {
  if (!files || files.length === 0) return files;
  
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      if (!file.url) return file;
      
      try {
        // Generar URL firmada fresca (1 hora de validez)
        const freshUrl = await getSignedUrl(file.url, 60 * 60);
        return {
          ...file,
          url: freshUrl || file.url // Usar URL fresca o mantener la original si falla
        };
      } catch (error) {
        console.warn('Error generando URL fresca para archivo:', file.id, error);
        return file; // Devolver archivo original si hay error
      }
    })
  );
  
  return processedFiles;
};

// Servicio para manejar los casos
export const casesService = {
  // Obtener todos los casos con paginación
  async getCases(page = 1, limit = 6, filters = {}) {
    try {
      // 1) Consulta de conteo exacto (más robusta en Supabase con head: true)
      let countQuery = supabase
        .from('Case')
        .select('*', { count: 'exact', head: true });

      if (filters.type) {
        countQuery = countQuery.eq('caseType', filters.type);
      }
      if (filters.search) {
        countQuery = countQuery.or(`caseName.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw countError;

      // 2) Consulta de datos paginados
      let dataQuery = supabase
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
        dataQuery = dataQuery.eq('caseType', filters.type);
      }

      if (filters.search) {
        dataQuery = dataQuery.or(`caseName.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      
      if (error) throw error;

      // Procesar casos para generar URLs frescas para los archivos
      const processedCases = await Promise.all(
        (data || []).map(async (caseItem) => {
          if (caseItem.Files && caseItem.Files.length > 0) {
            const processedFiles = await processFilesWithFreshUrls(caseItem.Files);
            return {
              ...caseItem,
              Files: processedFiles
            };
          }
          return caseItem;
        })
      );

      return {
        cases: processedCases,
        totalCount: totalCount || 0,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil((totalCount || 0) / limit)),
        hasNextPage: (page * limit) < (totalCount || 0),
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
      
      // Procesar archivos para generar URLs frescas
      if (data.Files && data.Files.length > 0) {
        data.Files = await processFilesWithFreshUrls(data.Files);
      }
      
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
        `, { count: 'exact', head: false })
        .or(`caseName.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('timeHour', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Procesar casos para generar URLs frescas para los archivos
      const processedCases = await Promise.all(
        (data || []).map(async (caseItem) => {
          if (caseItem.Files && caseItem.Files.length > 0) {
            const processedFiles = await processFilesWithFreshUrls(caseItem.Files);
            return {
              ...caseItem,
              Files: processedFiles
            };
          }
          return caseItem;
        })
      );

      return {
        cases: processedCases,
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
      
      // Procesar archivos para generar URLs frescas
      const processedFiles = await processFilesWithFreshUrls(data || []);
      return processedFiles;
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
      
      // Procesar archivos para generar URLs frescas
      const processedFiles = await processFilesWithFreshUrls(data || []);
      return processedFiles;
    } catch (error) {
      console.error('Error fetching files by type:', error);
      throw error;
    }
  }
};
