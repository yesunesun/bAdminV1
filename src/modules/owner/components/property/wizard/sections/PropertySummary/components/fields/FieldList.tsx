// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldList.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:25 IST
// Purpose: Field component for list values

import React from 'react';

interface FieldListProps {
  label: string;
  value?: string[] | string;
  className?: string;
}

export const FieldList: React.FC<FieldListProps> = ({
  label,
  value,
  className = ""
}) => {
  // Don't render if no value or empty array
  if (
    value === undefined || 
    value === null || 
    value === '' || 
    (Array.isArray(value) && value.length === 0)
  ) {
    return null;
  }
  
  // Convert string to array if needed
  const items = Array.isArray(value) ? value : [value];
  
  return (
    <div className={`flex flex-col py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">
        <ul className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <li 
              key={`${item}-${index}`}
              className="bg-secondary/30 px-2 py-1 rounded-md text-xs font-medium"
            >
              {item}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
};