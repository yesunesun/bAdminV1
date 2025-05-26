// src/modules/seeker/components/PropertyDetails/utils/dataFormatters.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 16:30 IST
// Purpose: Data formatting utilities for property details display

/**
 * Enhanced Indian Rupee formatter
 * @param amount - Amount to format (number or string)
 * @returns Formatted currency string in INR
 */
export const formatIndianRupees = (amount: number | string): string => {
  const numValue = typeof amount === 'number' ? amount : Number(parseFloat(amount));

  if (isNaN(numValue)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numValue);
};

/**
 * Helper function to render field value with appropriate formatting
 * @param field - Field value to render
 * @param key - Field key for context-aware formatting
 * @returns Formatted field value as string
 */
export const renderFieldValue = (field: any, key: string): string => {
  // Handle different data types appropriately
  if (field === null || field === undefined) {
    return 'Not specified';
  }

  if (typeof field === 'boolean') {
    return field ? 'Yes' : 'No';
  }

  if (Array.isArray(field)) {
    return field.join(', ');
  }

  // Format date fields (keys containing 'date', 'from', etc.)
  if (typeof field === 'string' &&
    (key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('from') ||
      key.toLowerCase().includes('possession'))) {
    try {
      const date = new Date(field);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (e) {
      // If date parsing fails, return the original string
    }
  }

  // Format price fields (keys containing 'price', 'amount', etc.)
  if ((typeof field === 'number' || !isNaN(Number(field))) &&
    (key.toLowerCase().includes('price') ||
      key.toLowerCase().includes('amount') ||
      key.toLowerCase().includes('deposit') ||
      key.toLowerCase().includes('cost') ||
      key.toLowerCase().includes('value') ||
      key.toLowerCase().includes('budget'))) {
    const numValue = typeof field === 'number' ? field : Number(field);
    return formatIndianRupees(numValue);
  }

  return field.toString();
};

/**
 * Format step ID for display (e.g., "com_sale_basic_details" -> "Basic Details")
 * @param id - Step ID to format
 * @returns Formatted step name
 */
export const formatStepId = (id: string): string => {
  const parts = id.split('_');
  // Remove flow prefix (e.g., "com_sale") and join remaining parts
  const relevantParts = parts.slice(2);
  return relevantParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Format field key for display (camelCase to Title Case)
 * @param key - Field key to format
 * @returns Formatted field name
 */
export const formatFieldKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};