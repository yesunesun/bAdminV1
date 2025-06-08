// src/modules/admin/pages/PropertyMapView/hooks/usePropertyMapData.ts
// Version: 1.1.0
// Last Modified: 01-03-2025 13:50 IST
// Purpose: Fixed potential infinite fetch loop

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPublishedProperties, PropertyWithImages } from '../services/propertyMapService';

export const usePropertyMapData = () => {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use ref to track if fetch has been done
  const fetchedRef = useRef(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await fetchPublishedProperties();
      
      if (error) {
        setError('Failed to load properties. Please try again later.');
      } else if (data) {
        setProperties(data);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Error in usePropertyMapData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch data once on mount
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchProperties();
    }
  }, [fetchProperties]);

  // Only reset fetchedRef when component unmounts
  useEffect(() => {
    return () => {
      fetchedRef.current = false;
    };
  }, []);

  return {
    properties,
    loading,
    error,
    refresh: fetchProperties
  };
};