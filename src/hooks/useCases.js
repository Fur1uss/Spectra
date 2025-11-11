import { useState, useEffect, useCallback, useRef } from 'react';
import { casesService } from '../utils/casesService.js';

export const useCases = (initialPage = 1, initialLimit = 6) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [casesCache, setCasesCache] = useState({});
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
  const latestRequestRef = useRef(0);

  const getCacheKey = useCallback((page, f, limit) => {
    const keyObj = {
      page,
      limit,
      search: f.search || '',
      type: f.type || '',
      sortBy: f.sortBy || 'timeHour',
      sortOrder: f.sortOrder || 'desc'
    };
    return JSON.stringify(keyObj);
  }, []);

  // Cargar casos
  const loadCases = useCallback(async (page = pagination.currentPage, newFilters = filters) => {
    try {
      const effectiveFilters = newFilters || filters;
      const cacheKey = getCacheKey(page, effectiveFilters, initialLimit);
      const cached = casesCache[cacheKey];

      // No mostrar skeleton si ya hay datos cacheados para esa página
      setLoading(!cached);
      setError(null);
      
      const requestId = Date.now();
      latestRequestRef.current = requestId;

      // Si hay cache, úsalo de inmediato para evitar flicker
      if (cached) {
        setCases(cached.cases);
        setPagination(cached.pagination);
      }

      const result = await casesService.getCases(page, initialLimit, effectiveFilters);

      // Si llegó una respuesta vieja, ignórala
      if (latestRequestRef.current !== requestId) return;
      
      setCases(result.cases);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });

      // Actualizar cache
      setCasesCache(prev => ({
        ...prev,
        [cacheKey]: {
          cases: result.cases,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalCount: result.totalCount,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          }
        }
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters, initialLimit, casesCache, getCacheKey]);

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
      // Invalidar cache al realizar una búsqueda nueva
      setCasesCache({});
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
    // Invalidar cache cuando cambian los filtros
    setCasesCache({});
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
    setCasesCache({});
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
