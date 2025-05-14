// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldBoolean.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:15 IST
// Purpose: Field component for boolean values

import React from 'react';
import { Check, X } from 'lucide-react';

interface FieldBooleanProps {
  label: string;
  value?: boolean;
  className?: string;
}

export const FieldBoolean: React.FC<FieldBooleanProps> = ({
  label,
  value,
  className = ""
}) => {
  // Don't render if value is undefined or null
  if (value === undefined || value === null) {
    return null;
  }
  
  return (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium flex items-center">
        {value ? (
          <>
            <Check className="h-4 w-4 text-green-500 mr-1" />
            <span>Yes</span>
          </>
        ) : (
          <>
            <X className="h-4 w-4 text-red-500 mr-1" />
            <span>No</span>
          </>
        )}
      </dd>
    </div>
  );
};