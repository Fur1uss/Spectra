import { useState, useCallback } from 'react';
import { casesService } from '../utils/casesService.js';
import { supabase } from '../utils/supabase.js';

export const useFiles = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener archivos de un caso específico
  const getCaseFiles = useCallback(async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const files = await casesService.getCaseFiles(caseId);
      return files;
    } catch (err) {
      setError(err.message);
      console.error('Error loading case files:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener archivos por tipo multimedia
  const getFilesByType = useCallback(async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      const files = await casesService.getFilesByType(type);
      return files;
    } catch (err) {
      setError(err.message);
      console.error('Error loading files by type:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tipos de multimedia únicos
  const getMediaTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Files')
        .select('type_multimedia')
        .not('type_multimedia', 'is', null);

      if (error) throw error;
      
      // Extraer tipos únicos
      const uniqueTypes = [...new Set(data.map(item => item.type_multimedia))];
      return uniqueTypes;
    } catch (err) {
      setError(err.message);
      console.error('Error loading media types:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCaseFiles,
    getFilesByType,
    getMediaTypes
  };
};
