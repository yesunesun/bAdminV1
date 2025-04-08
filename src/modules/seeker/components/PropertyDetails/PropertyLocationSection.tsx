// src/modules/seeker/components/PropertyDetails/PropertyLocationSection.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 17:30 IST
// Purpose: Create a dedicated section for property location with a clear title

import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PropertyLocationMap from './PropertyLocationMap';

interface PropertyLocationSectionProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
}

const PropertyLocationSection: React.FC<PropertyLocationSectionProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Property Location</h3>
      </div>
      
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <PropertyLocationMap
            address={address}
            city={city}
            state={state}
            zipCode={zipCode}
            coordinates={coordinates}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyLocationSection;