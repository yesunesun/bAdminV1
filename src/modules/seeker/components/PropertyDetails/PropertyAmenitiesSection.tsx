// src/modules/seeker/components/PropertyDetails/PropertyAmenitiesSection.tsx
// Version: 1.2.0
// Last Modified: 08-04-2025 17:25 IST
// Purpose: Redesign to match the provided mockup with clear section title

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PropertyAmenitiesSectionProps {
  amenities: string[];
}

const PropertyAmenitiesSection: React.FC<PropertyAmenitiesSectionProps> = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-primary">Amenities</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
        {amenities.map((amenity: string, index: number) => (
          <div key={index} className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
            <span className="text-foreground">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyAmenitiesSection;