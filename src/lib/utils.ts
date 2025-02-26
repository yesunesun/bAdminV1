// src/lib/utils.ts
// Version: 2.0.0
// Last Modified: 26-02-2025 17:15 IST
// Purpose: Updated utility functions to include formatCurrency

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