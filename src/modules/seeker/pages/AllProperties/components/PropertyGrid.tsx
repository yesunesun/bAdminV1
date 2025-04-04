// src/modules/seeker/pages/AllProperties/components/PropertyGrid.tsx
// Version: 1.0.1
// Last Modified: 06-04-2025 19:30 IST
// Purpose: Property grid component for displaying properties

import React from 'react';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PropertyGridProps {
  properties: PropertyType[];
  googleMapsLoaded: boolean;
  geocodingInProgress: string | null;
  setGeocodingInProgress: (id: string | null) => void;
  isLoading?: boolean;
  onClearFilters?: () => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  googleMapsLoaded, 
  geocodingInProgress, 
  setGeocodingInProgress,
  isLoading = false,
  onClearFilters
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500 dark:text-gray-400">No properties match your filter criteria.</p>
        <Button 
          className="mt-4" 
          variant="outline"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          googleMapsLoaded={googleMapsLoaded}
          geocodingInProgress={geocodingInProgress}
          setGeocodingInProgress={setGeocodingInProgress}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;