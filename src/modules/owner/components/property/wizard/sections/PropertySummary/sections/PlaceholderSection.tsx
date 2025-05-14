// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/PlaceholderSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 16:50 IST
// Purpose: Placeholder component for sections that are not yet implemented

import React from 'react';
import { FieldText } from '../components/fields/FieldText';

interface PlaceholderSectionProps {
  data: any;
  flowType?: string;
  listingType?: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No data available for this section.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => {
        // Skip internal fields or empty values
        if (key === '__typename' || value === undefined || value === null || value === '') {
          return null;
        }
        
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        
        // Format the value based on its type
        let formattedValue = value;
        
        if (typeof value === 'boolean') {
          formattedValue = value ? 'Yes' : 'No';
        } else if (Array.isArray(value)) {
          formattedValue = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value);
        }
        
        return (
          <FieldText 
            key={key} 
            label={label} 
            value={String(formattedValue)} 
          />
        );
      })}
    </div>
  );
};