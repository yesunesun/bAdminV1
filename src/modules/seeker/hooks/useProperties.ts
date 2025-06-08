// src/modules/seeker/hooks/useProperties.ts
// Version: 1.2.0
// Last Modified: 03-04-2025 10:30 IST
// Purpose: Advanced hook for fetching and managing property listings with robust error handling

import { useState, useEffect, useCallback } from 'react';
import { fetchProperties, PropertyFilters } from '../services/seekerService';
import { PropertyType } from '@/modules/owner/components/property/types';

// Comprehensive error handling interface
interface ErrorState {
  message: string;
  code?: string;
  details?: string;
}

export const useProperties = (initialFilters: PropertyFilters = {}) => {
  // State management with enhanced type safety
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [page, setPage] = useState<number>(1);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [pageSize] = useState<number>(12);

  // Comprehensive property loading method
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchProperties(filters, page, pageSize);
      
      // Robust data processing with fallback mechanisms
      const fetchedProperties = result.properties || [];
      
      setProperties(fetchedProperties);
      setTotalProperties(result.totalCount || fetchedProperties.length);
    } catch (err) {
      // Detailed error handling
      const errorState: ErrorState = {
        message: err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred while fetching properties',
        code: err instanceof Error && 'code' in err 
          ? (err as any).code 
          : undefined,
        details: err instanceof Error && 'details' in err 
          ? (err as any).details 
          : undefined
      };

      console.warn('Properties Fetch Warning:', errorState);
      setError(errorState);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // Initial and filter-change property load
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Filter management methods with reset capabilities
  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Pagination methods with boundary checks
  const nextPage = useCallback(() => {
    const maxPages = Math.ceil(totalProperties / pageSize);
    setPage(currentPage => 
      currentPage < maxPages ? currentPage + 1 : currentPage
    );
  }, [totalProperties, pageSize]);

  const prevPage = useCallback(() => {
    setPage(currentPage => 
      currentPage > 1 ? currentPage - 1 : currentPage
    );
  }, []);

  const goToPage = useCallback((pageNum: number) => {
    const maxPages = Math.ceil(totalProperties / pageSize);
    setPage(currentPage => 
      pageNum >= 1 && pageNum <= maxPages ? pageNum : currentPage
    );
  }, [totalProperties, pageSize]);

  // Refresh method to reload current properties
  const refresh = useCallback(() => {
    loadProperties();
  }, [loadProperties]);

  return {
    // Property data
    properties,
    loading,
    error,

    // Filter management
    filters,
    updateFilters,
    resetFilters,

    // Pagination details
    pagination: {
      page,
      pageSize,
      totalProperties,
      totalPages: Math.ceil(totalProperties / pageSize),
      nextPage,
      prevPage,
      goToPage
    },

    // Additional utility methods
    refresh
  };
};