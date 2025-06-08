// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldText.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 16:55 IST
// Purpose: Field component for text values

import React from 'react';

interface FieldTextProps {
  label: string;
  value?: string | number;
  className?: string;
}

export const FieldText: React.FC<FieldTextProps> = ({
  label,
  value,
  className = ""
}) => {
  // Don't render if no value
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  return (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value}</dd>
    </div>
  );
};