// src/modules/seeker/components/PropertyDetails/PropertyHeader.tsx
// Version: 1.1.0
// Last Modified: 08-04-2025 16:30 IST
// Purpose: Fix address text wrapping issue

import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyHeaderProps {
  title: string;
  location: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ title, location }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      <div className="flex items-start text-muted-foreground mt-2">
        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-1" />
        <span className="break-words">{location}</span>
      </div>
    </div>
  );
};

export default PropertyHeader;