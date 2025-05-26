// src/lib/utils.ts
// Version: 3.1.0
// Last Modified: 27-01-2025 11:50 IST
// Purpose: Fixed utilities with Indian formatting and design system

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ===============================
 * INDIAN FORMATTING UTILITIES
 * ===============================
 */

/**
 * Formats currency in Indian Rupees with proper symbol and notation
 */
export function formatIndianCurrency(
  value: number | string, 
  options: {
    showSymbol?: boolean;
    showDecimal?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showDecimal = false, compact = false } = options;
  
  const numValue = typeof value === 'number' ? value : Number(parseFloat(value as string));
  
  if (isNaN(numValue)) return showSymbol ? '₹0' : '0';
  
  // Compact format for large numbers
  if (compact && numValue >= 10000000) {
    const crores = numValue / 10000000;
    const formatted = crores.toFixed(crores >= 100 ? 0 : 2);
    return `${showSymbol ? '₹' : ''}${formatted} Cr`;
  } else if (compact && numValue >= 100000) {
    const lakhs = numValue / 100000;
    const formatted = lakhs.toFixed(lakhs >= 100 ? 0 : 2);
    return `${showSymbol ? '₹' : ''}${formatted} L`;
  } else if (compact && numValue >= 1000) {
    const thousands = numValue / 1000;
    const formatted = thousands.toFixed(thousands >= 100 ? 0 : 1);
    return `${showSymbol ? '₹' : ''}${formatted}K`;
  }
  
  // Standard Indian number formatting
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimal ? 2 : 0,
    minimumFractionDigits: 0
  });
  
  if (!showSymbol) {
    return formatter.format(numValue).replace(/₹\s?/, '');
  }
  
  return formatter.format(numValue);
}

/**
 * Formats phone number in Indian format (+91 XXXXX XXXXX)
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
  
  // Return as-is if doesn't match expected patterns
  return phoneNumber.toString();
}

/**
 * Formats date in Indian DD/MM/YYYY format
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
 * Formats area measurements with proper units
 */
export function formatArea(area: number | string | null | undefined, unit: string = 'sqft'): string {
  if (!area || area === 0) return '-';
  
  const numArea = typeof area === 'number' ? area : Number(area);
  
  if (isNaN(numArea)) return '-';
  
  // Format with commas for large numbers
  const formatted = new Intl.NumberFormat('en-IN').format(numArea);
  
  return `${formatted} ${unit}`;
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
 * Boolean formatter for Indian context
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
 * Capacity formatter (1 Person, 2 Persons, etc.)
 */
export function formatCapacity(capacity: any): string {
  if (!capacity) return '-';
  const num = Number(capacity);
  if (num === 1) return '1 Person';
  if (num > 1) return `${num} Persons`;
  return formatValue(capacity);
}

/**
 * Legacy currency function for backward compatibility
 */
export function formatCurrency(value: number): string {
  return formatIndianCurrency(value, { showSymbol: false });
}

/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * ===============================
 * DESIGN SYSTEM CONSTANTS
 * ===============================
 */

// Standard responsive grid classes for consistent layouts
export const gridPatterns = {
  // Property detail grids
  details2Col: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  details3Col: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  details4Col: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
  
  // Feature/amenity grids
  features: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
  amenities: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2",
  
  // Card layouts
  cards2Col: "grid grid-cols-1 md:grid-cols-2 gap-6",
  cards3Col: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  
  // Auto-fit grids
  autoFit: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4",
  autoFitSmall: "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
};

// Standard spacing patterns for consistent layouts
export const spacing = {
  // Section spacing
  sectionY: "space-y-6",
  sectionYLarge: "space-y-8",
  
  // Card padding
  cardPadding: "p-4 md:p-6",
  cardPaddingLarge: "p-6 md:p-8",
  
  // Content spacing
  contentY: "space-y-4",
  contentYSmall: "space-y-3",
  
  // Border spacing
  borderTop: "pt-4 mt-4 border-t border-border",
  borderBottom: "pb-4 mb-4 border-b border-border"
};

// Typography scale for consistent text styling
export const typography = {
  // Headers
  h1: "text-2xl md:text-3xl font-bold",
  h2: "text-xl md:text-2xl font-semibold",
  h3: "text-lg md:text-xl font-semibold",
  h4: "text-base md:text-lg font-medium",
  
  // Body text
  body: "text-sm md:text-base",
  bodySmall: "text-xs md:text-sm",
  
  // Labels
  label: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
  fieldLabel: "text-sm font-medium text-muted-foreground",
  
  // Special
  price: "text-xl md:text-2xl font-bold text-primary",
  priceSmall: "text-lg font-bold text-primary"
};

// Standard color patterns for consistent theming
export const colors = {
  // Status indicators
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  
  // Interactive elements
  interactive: "text-primary bg-primary/10 hover:bg-primary/20",
  muted: "text-muted-foreground bg-muted/50",
  
  // Badges
  badge: "bg-primary/10 text-primary border-primary/20",
  badgeSecondary: "bg-secondary/10 text-secondary-foreground border-secondary/20"
};

// Animation and transition utilities
export const animations = {
  // Hover effects
  hoverScale: "transition-transform hover:scale-105",
  hoverLift: "transition-all hover:-translate-y-1 hover:shadow-md",
  
  // Fade animations
  fadeIn: "opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]",
  slideUp: "opacity-0 animate-[slideUp_0.3s_ease-in-out_forwards]",
  
  // Standard transitions
  transition: "transition-colors duration-200",
  transitionAll: "transition-all duration-200"
};

// Export everything as a utils object for convenience
export const utils = {
  cn,
  formatCurrency,
  formatIndianCurrency,
  formatIndianPhone,
  formatIndianDate,
  formatArea,
  formatValue,
  formatBoolean,
  formatCapacity,
  slugify,
  gridPatterns,
  spacing,
  typography,
  colors,
  animations
};