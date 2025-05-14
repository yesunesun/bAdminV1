// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldArea.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:10 IST
// Purpose: Field component for area values

import React from 'react';

interface FieldAreaProps {
  label: string;
  value?: number | string;
  unit?: string;
  className?: string;
}

export const FieldArea: React.FC<FieldAreaProps> = ({
  label,
  value,
  unit = 'sqft',
  className = ""
}) => {
  // Don't render if no value
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  const displayUnit = unit === 'sqyd' ? 'sq. yard' : unit === 'sqft' ? 'sq. ft.' : unit;
  
  return (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value} {displayUnit}</dd>
    </div>
  );
};