import { useState, useEffect, useCallback } from 'react';
import { casesService } from '../utils/casesService.js';

export const useCases = (initialPage = 1, initialLimit = 6) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    sortBy: 'timeHour',
    sortOrder: 'desc'
  });
  const [caseTypes, setCaseTypes] = useState([]);

  // Cargar casos
  const loadCases = useCallback(async (page = pagination.currentPage, newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await casesService.getCases(page, initialLimit, newFilters);
      
      setCases(result.cases);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (err) {
      setError(err.message);
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters, initialLimit]);

  // Buscar casos
  const searchCases = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await casesService.searchCases(searchTerm, 1, initialLimit);
      
      setCases(result.cases);
      setPagination({
        currentPage: 1,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.totalPages > 1,
        hasPrevPage: false
      });
      
      setFilters(prev => ({ ...prev, search: searchTerm }));
    } catch (err) {
      setError(err.message);
      console.error('Error searching cases:', err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadCases(1, { ...filters, ...newFilters });
  }, [filters, loadCases]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    loadCases(1, {
      search: '',
      type: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }, [loadCases]);

  // Navegación de páginas
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadCases(page);
    }
  }, [pagination.totalPages, loadCases]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.hasPrevPage, pagination.currentPage, goToPage]);

  // Cargar tipos de casos
  const loadCaseTypes = useCallback(async () => {
    try {
      const types = await casesService.getCaseTypes();
      setCaseTypes(types);
    } catch (err) {
      console.error('Error loading case types:', err);
    }
  }, []);

  // Cargar casos iniciales
  useEffect(() => {
    loadCases();
    loadCaseTypes();
  }, [loadCases, loadCaseTypes]);

  return {
    cases,
    loading,
    error,
    pagination,
    filters,
    caseTypes,
    loadCases,
    searchCases,
    applyFilters,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
    loadCaseTypes
  };
};
