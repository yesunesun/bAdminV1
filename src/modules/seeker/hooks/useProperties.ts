// src/modules/seeker/hooks/useProperties.ts
// Version: 1.0.0
// Last Modified: 26-02-2025 15:00 IST
// Purpose: Hook for fetching and managing property listings

import { useState, useEffect } from 'react';
import { fetchProperties, PropertyFilters } from '../services/seekerService';
import { PropertyType } from '@/modules/owner/components/property/types';

export const useProperties = (initialFilters: PropertyFilters = {}) => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [page, setPage] = useState<number>(1);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [pageSize] = useState<number>(12);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const { properties: fetchedProperties, total } = await fetchProperties(filters, page, pageSize);
        setProperties(fetchedProperties as unknown as PropertyType[]);
        setTotalProperties(total);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [filters, page, pageSize]);

  const updateFilters = (newFilters: Partial<PropertyFilters>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const nextPage = () => {
    if (page * pageSize < totalProperties) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= Math.ceil(totalProperties / pageSize)) {
      setPage(pageNum);
    }
  };

  return {
    properties,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    pagination: {
      page,
      pageSize,
      totalProperties,
      totalPages: Math.ceil(totalProperties / pageSize),
      nextPage,
      prevPage,
      goToPage
    }
  };
};