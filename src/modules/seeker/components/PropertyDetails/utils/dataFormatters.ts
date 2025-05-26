// src/modules/seeker/components/PropertyDetails/utils/dataFormatters.ts
// Version: 1.1.0
// Last Modified: 27-01-2025 12:00 IST
// Purpose: Simplified formatting utilities that work without complex imports

/**
 * Format currency in Indian Rupees with proper symbol and notation
 */
export function formatIndianRupees(value: number | string): string {
  const numValue = typeof value === 'number' ? value : Number(parseFloat(value as string));
  
  if (isNaN(numValue)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numValue);
}

/**
 * Format phone number in Indian format (+91 XXXXX XXXXX)
 */
export function formatIndianPhone(phoneNumber: string | number): string {
  if (!phoneNumber) return '';
  
  const phone = phoneNumber.toString().replace(/\D/g, '');
  
  // If already has country code
  if (phone.startsWith('91') && phone.length === 12) {
    const number = phone.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  // If 10 digit number
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  
  return phoneNumber.toString();
}

/**
 * Format date in Indian DD/MM/YYYY format
 */
export function formatIndianDate(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'Not specified';
  
  try {
    const date = new Date(dateInput);
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Safe value formatter with fallback
 */
export function formatValue(value: any, fallback: string = '-'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (value === 0 && fallback !== '0') return fallback;
  return String(value);
}

/**
 * Format field value based on field type and context
 */
export function renderFieldValue(value: any, fieldKey: string): string {
  if (value === null || value === undefined || value === '') return '-';
  
  const key = fieldKey.toLowerCase();
  
  // Price fields
  if (key.includes('price') || key.includes('rent') || key.includes('deposit') || 
      key.includes('cost') || key.includes('amount') || key.includes('charge')) {
    return formatIndianRupees(value);
  }
  
  // Phone fields
  if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) {
    return formatIndianPhone(value);
  }
  
  // Date fields
  if (key.includes('date') || key.includes('from') || key.includes('available') ||
      key.includes('possession')) {
    return formatIndianDate(value);
  }
  
  // Boolean fields
  if (key.includes('available') || key.includes('negotiable') || key.includes('parking') ||
      key.includes('furnished') || key.includes('lift') || key.includes('security')) {
    if (typeof value === 'boolean' || value === 'true' || value === 'false' ||
        value === 'yes' || value === 'no') {
      return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
             (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' ? 'Yes' : 'No');
    }
  }
  
  // Default: return formatted value
  return formatValue(value);
}

/**
 * Format field label for display
 */
export function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim();
}

/**
 * Format step ID for display (converts snake_case to Title Case)
 */
export function formatStepId(stepId: string): string {
  return stepId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a value should be displayed
 */
export function shouldDisplayValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

/**
 * Format boolean values for display
 */
export function formatBoolean(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === 'available') return 'Yes';
    if (lower === 'false' || lower === 'no' || lower === 'not available') return 'No';
  }
  return formatValue(value);
}

/**
 * Format capacity (1 Person, 2 Persons, etc.)
 */
export function formatCapacity(capacity: any): string {
  if (!capacity) return '-';
  const num = Number(capacity);
  if (num === 1) return '1 Person';
  if (num > 1) return `${num} Persons`;
  return formatValue(capacity);
}

/**
 * Format area with unit
 */
export function formatArea(area: number | string | null | undefined, unit: string = 'sqft'): string {
  if (!area || area === 0) return '-';
  
  const numArea = typeof area === 'number' ? area : Number(area);
  
  if (isNaN(numArea)) return '-';
  
  // Format with commas for large numbers
  const formatted = new Intl.NumberFormat('en-IN').format(numArea);
  
  return `${formatted} ${unit}`;
}