// src/lib/utils.ts
// Version: 3.2.0
// Last Modified: 29-05-2025 14:30 IST
// Purpose: Added generatePropertyCode utility with meta.code persistence

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from './supabase'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ===============================
 * PROPERTY CODE UTILITIES
 * ===============================
 */

/**
 * Generates or retrieves a unique 6-character property code
 * First checks if meta.code exists in property data, if not generates and saves one
 */
export async function generatePropertyCode(propertyId: string, propertyData?: any): Promise<string> {
  if (!propertyId) {
    throw new Error('Property ID is required to generate property code');
  }

  try {
    // If property data is provided, check for existing code
    if (propertyData) {
      const existingCode = getExistingPropertyCode(propertyData);
      if (existingCode) {
        console.log(`[generatePropertyCode] Found existing code for property ${propertyId}: ${existingCode}`);
        return existingCode;
      }
    } else {
      // If no property data provided, fetch it to check for existing code
      const fetchedData = await fetchPropertyData(propertyId);
      if (fetchedData) {
        const existingCode = getExistingPropertyCode(fetchedData);
        if (existingCode) {
          console.log(`[generatePropertyCode] Found existing code in fetched data for property ${propertyId}: ${existingCode}`);
          return existingCode;
        }
        propertyData = fetchedData;
      }
    }

    // Generate new code
    const newCode = await generateUniqueCode(propertyId);
    console.log(`[generatePropertyCode] Generated new code for property ${propertyId}: ${newCode}`);

    // Save the new code to meta.code
    await savePropertyCode(propertyId, newCode, propertyData);

    return newCode;
  } catch (error) {
    console.error('[generatePropertyCode] Error:', error);
    // Fallback: generate code without saving
    return await generateUniqueCode(propertyId);
  }
}

/**
 * Checks for existing property code in various locations within property data
 */
function getExistingPropertyCode(propertyData: any): string | null {
  if (!propertyData) return null;

  try {
    // Check direct meta.code path
    if (propertyData.meta?.code) {
      return propertyData.meta.code;
    }

    // Check property_details.meta.code path
    let details = propertyData.property_details;
    
    // Parse property_details if it's a string
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        console.warn('[getExistingPropertyCode] Failed to parse property_details JSON');
        return null;
      }
    }

    // Check parsed property_details.meta.code
    if (details?.meta?.code) {
      return details.meta.code;
    }

    // Check other possible locations
    if (details?.code) {
      return details.code;
    }

    if (propertyData.code) {
      return propertyData.code;
    }

  } catch (error) {
    console.error('[getExistingPropertyCode] Error checking for existing code:', error);
  }

  return null;
}

/**
 * Fetches property data from database to check for existing code
 */
async function fetchPropertyData(propertyId: string): Promise<any | null> {
  try {
    // Try properties_v2 first
    let { data, error } = await supabase
      .from('properties_v2')
      .select('id, property_details, meta')
      .eq('id', propertyId)
      .single();

    // Fall back to properties table if not found
    if (error || !data) {
      const result = await supabase
        .from('properties')
        .select('id, property_details')
        .eq('id', propertyId)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.warn(`[fetchPropertyData] Could not fetch property ${propertyId}:`, error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[fetchPropertyData] Error fetching property data:', error);
    return null;
  }
}

/**
 * Generates a unique 6-character code using SHA-256 and Base36 encoding
 */
async function generateUniqueCode(propertyId: string): Promise<string> {
  try {
    // Step 1: Take the Property ID as string input
    const input = propertyId.toString();
    
    // Step 2: Hash the UUID using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Step 3: Convert the hash to an integer (using first 8 bytes for precision)
    const hashArray = new Uint8Array(hashBuffer);
    let hashInt = 0;
    for (let i = 0; i < 8; i++) {
      hashInt = hashInt * 256 + hashArray[i];
    }
    
    // Step 4: Convert the integer to a Base36 string
    const base36String = hashInt.toString(36).toUpperCase();
    
    // Step 5: Take the first 6 characters
    return base36String.substring(0, 6).padEnd(6, '0');
  } catch (error) {
    console.error('[generateUniqueCode] Error generating unique code:', error);
    // Fallback: use first 6 characters of property ID
    return propertyId.replace(/-/g, '').substring(0, 6).toUpperCase();
  }
}

/**
 * Saves the generated property code to the database in meta.code field
 */
async function savePropertyCode(propertyId: string, code: string, existingData?: any): Promise<void> {
  try {
    // Prepare the meta object with the new code
    const newMeta = {
      ...(existingData?.meta || {}),
      code: code,
      codeGeneratedAt: new Date().toISOString()
    };

    // Prepare property_details with updated meta
    let updatedPropertyDetails: any = {};

    if (existingData?.property_details) {
      // Parse existing property_details if it's a string
      if (typeof existingData.property_details === 'string') {
        try {
          updatedPropertyDetails = JSON.parse(existingData.property_details);
        } catch (e) {
          console.warn('[savePropertyCode] Failed to parse existing property_details, creating new object');
          updatedPropertyDetails = {};
        }
      } else {
        updatedPropertyDetails = { ...existingData.property_details };
      }
    }

    // Update the meta section within property_details
    updatedPropertyDetails.meta = {
      ...updatedPropertyDetails.meta,
      ...newMeta
    };

    // Try to update properties_v2 first (only property_details column, no separate meta column)
    let { error } = await supabase
      .from('properties_v2')
      .update({ 
        property_details: updatedPropertyDetails
      })
      .eq('id', propertyId);

    // If properties_v2 update failed, try properties table
    if (error) {
      console.log('[savePropertyCode] properties_v2 update failed, trying properties table');
      console.error('[savePropertyCode] properties_v2 error details:', error);
      
      const { error: propertiesError } = await supabase
        .from('properties')
        .update({ 
          property_details: updatedPropertyDetails
        })
        .eq('id', propertyId);

      if (propertiesError) {
        console.error('[savePropertyCode] Failed to save to both tables:', propertiesError);
        throw propertiesError;
      } else {
        console.log(`[savePropertyCode] Successfully saved code ${code} to properties table for property ${propertyId}`);
      }
    } else {
      console.log(`[savePropertyCode] Successfully saved code ${code} to properties_v2 table for property ${propertyId}`);
    }

  } catch (error) {
    console.error('[savePropertyCode] Error saving property code:', error);
    // Don't throw error - we can still return the generated code even if save fails
  }
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
  generatePropertyCode,
  gridPatterns,
  spacing,
  typography,
  colors,
  animations
};