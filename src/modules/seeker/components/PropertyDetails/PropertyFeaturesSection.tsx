// src/modules/seeker/components/PropertyDetails/PropertyFeaturesSection.tsx
// Version: 1.2.0
// Last Modified: 08-04-2025 17:20 IST
// Purpose: Redesign to match the provided mockup with clear section layout

import React from 'react';
import { Building } from 'lucide-react';

interface PropertyFeaturesSectionProps {
  propertyDetails: {
    propertyType?: string;
    yearBuilt?: string;
    furnishing?: string;
    availability?: string;
    floor?: string;
    facing?: string;
    [key: string]: any;
  };
}

const PropertyFeaturesSection: React.FC<PropertyFeaturesSectionProps> = ({ propertyDetails }) => {
  if (!propertyDetails) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
          <Building className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Property Details</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Type</div>
          <p className="font-medium text-foreground">{propertyDetails.propertyType || "Not specified"}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Year Built</div>
          <p className="font-medium text-foreground">{propertyDetails.yearBuilt || "Not specified"}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Furnishing</div>
          <p className="font-medium text-foreground">{propertyDetails.furnishing || "Not specified"}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Availability</div>
          <p className="font-medium text-foreground">{propertyDetails.availability || "Not specified"}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Floor</div>
          <p className="font-medium text-foreground">{propertyDetails.floor || "Not specified"}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Facing</div>
          <p className="font-medium text-foreground">{propertyDetails.facing || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyFeaturesSection;