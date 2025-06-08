// src/modules/seeker/components/PropertyDetails/PropertyFeaturesSection.tsx
// Version: 2.0.0
// Last Modified: 01-05-2025 16:30 IST
// Purpose: Enhanced to handle both v1 and v2 property data formats

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyFeaturesSectionProps {
  propertyDetails: any;
}

const PropertyFeaturesSection: React.FC<PropertyFeaturesSectionProps> = ({ 
  propertyDetails 
}) => {
  if (!propertyDetails) return null;
  
  // Create features array to display
  const features = [
    { label: 'Type', value: propertyDetails.propertyType || 'Not specified' },
    { 
      label: 'Year Built', 
      value: propertyDetails.yearBuilt || propertyDetails.propertyAge || 'Not specified' 
    },
    { 
      label: 'Furnishing', 
      value: propertyDetails.furnishingStatus || 'Not specified' 
    },
    { 
      label: 'Availability', 
      value: propertyDetails.availability || 'Not specified' 
    },
    { 
      label: 'Floor', 
      value: propertyDetails.floor ? `${propertyDetails.floor}${propertyDetails.totalFloors ? ` of ${propertyDetails.totalFloors}` : ''}` : 'Not specified' 
    },
    { 
      label: 'Facing', 
      value: propertyDetails.facing || 'Not specified' 
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">{feature.label}</div>
              <div className="font-semibold">{feature.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFeaturesSection;