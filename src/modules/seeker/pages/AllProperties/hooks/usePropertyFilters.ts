// src/modules/seeker/pages/AllProperties/hooks/usePropertyFilters.ts
// Version: 1.3.0
// Last Modified: 14-04-2025 15:15 IST
// Purpose: Added property flow filtering

import { useState, useEffect, useMemo } from 'react';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { getPropertyFlow } from '../utils/propertyUtils';

type Filters = {
  propertyType: string;
  priceRange: string;
  ownerId: string;
  propertyFlow: string;
  [key: string]: string;
};

export function usePropertyFilters(properties: PropertyType[]) {
  const [filters, setFilters] = useState<Filters>({
    propertyType: '',
    priceRange: '',
    ownerId: '',
    propertyFlow: ''
  });

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      propertyType: '',
      priceRange: '',
      ownerId: '',
      propertyFlow: ''
    });
  };

  // Apply filters and return filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Property Type Filter
      if (filters.propertyType && property.property_details?.propertyType !== filters.propertyType) {
        return false;
      }

      // Price Range Filter
      if (filters.priceRange) {
        const price = property.price || 0;
        const [min, max] = filters.priceRange.split('-').map(Number);
        
        if (filters.priceRange === '100000+') {
          if (price < 100000) return false;
        } else if (price < min || (max && price > max)) {
          return false;
        }
      }
      
      // Owner Filter
      if (filters.ownerId && property.profiles?.id !== filters.ownerId) {
        return false;
      }
      
      // Property Flow Filter
      if (filters.propertyFlow) {
        const flow = getPropertyFlow(property);
        if (flow !== filters.propertyFlow) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filters]);

  return {
    filters,
    setFilters,
    filteredProperties,
    resetFilters
  };
}