// src/modules/owner/components/property/wizard/sections/PropertySummary/components/fields/FieldCurrency.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:20 IST
// Purpose: Field component for currency values

import React from 'react';

interface FieldCurrencyProps {
  label: string;
  value?: number | string;
  className?: string;
}

export const FieldCurrency: React.FC<FieldCurrencyProps> = ({
  label,
  value,
  className = ""
}) => {
  // Don't render if no value
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  // Format currency as Indian Rupees
  const formattedValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(formattedValue)) {
    return null;
  }
  
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };
  
  return (
    <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{formatCurrency(formattedValue)}</dd>
    </div>
  );
};