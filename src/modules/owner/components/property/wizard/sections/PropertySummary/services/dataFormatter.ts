// src/modules/owner/components/property/wizard/sections/PropertySummary/services/dataFormatter.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:35 IST
// Purpose: Data formatting utilities for PropertySummary

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatCurrency = (value?: string | number): string => {
  if (!value || value === 0) return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '-' : `₹${numValue.toLocaleString('en-IN')}`;
};

export const formatArea = (area?: string | number, unit?: string): string => {
  if (!area) return '-';
  const displayUnit = unit === 'sqyd' ? 'sq. yard' : 'sq. ft.';
  return `${area} ${displayUnit}`;
};

export const formatBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase();
    return lowercaseValue === 'yes' || lowercaseValue === 'true' || lowercaseValue === 'on';
  }
  if (typeof value === 'number') return value !== 0;
  return undefined;
};

export const formatDistance = (value?: string | number): string => {
  if (!value) return '-';
  return `${value} km`;
};

export const formatDimensions = (length?: string | number, width?: string | number): string => {
  if (!length || !width) return '-';
  return `${length} x ${width}`;
};