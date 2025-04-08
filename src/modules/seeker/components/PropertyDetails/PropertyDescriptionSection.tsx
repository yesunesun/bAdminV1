// src/modules/seeker/components/PropertyDetails/PropertyDescriptionSection.tsx
// Version: 1.2.0
// Last Modified: 08-04-2025 17:15 IST
// Purpose: Redesign to match the provided mockup with clear section layout

import React from 'react';
import { Info } from 'lucide-react';

interface PropertyDescriptionSectionProps {
  description: string;
}

const PropertyDescriptionSection: React.FC<PropertyDescriptionSectionProps> = ({ description }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">About this Property</h3>
      </div>
      
      <div className="bg-card p-4 rounded-lg border border-border/40">
        <p className="text-foreground">
          {description || "No description provided for this property."}
        </p>
      </div>
    </div>
  );
};

export default PropertyDescriptionSection;