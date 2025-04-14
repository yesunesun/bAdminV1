// src/modules/seeker/pages/AllProperties/components/PropertyGrid.tsx
// Version: 1.7.0
// Last Modified: 14-04-2025 14:45 IST
// Purpose: Fixed property deletion callback functionality

import React from 'react';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import PropertyCard from './PropertyCard';
import { Card } from '@/components/ui/card';

interface PropertyGridProps {
  properties: PropertyType[];
  isLoading?: boolean;
  onPropertyDeleted?: () => void;
  onPropertyUpdated?: () => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  isLoading = false,
  onPropertyDeleted,
  onPropertyUpdated
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="h-64 animate-pulse">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="sm:w-1/4 bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-4">No properties found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property}
          onPropertyDeleted={onPropertyDeleted}
          onPropertyUpdated={onPropertyUpdated}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;