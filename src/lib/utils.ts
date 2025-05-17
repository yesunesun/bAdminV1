// src/lib/utils.ts
// Version: 2.1.0
// Last Modified: 17-05-2025 15:45 IST
// Purpose: Added slugify function and utils object export

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string
 * @param value - The number to format
 * @param locale - The locale to use for formatting (defaults to en-IN for Indian Rupees)
 * @returns A formatted currency string
 */
export function formatCurrency(value: number): string {
  // Format value as Indian currency (no currency symbol, just the number formatting)
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

// Export individual functions and also as a utils object for backward compatibility
export const utils = {
  cn,
  formatCurrency,
  slugify
};