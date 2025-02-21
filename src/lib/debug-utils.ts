// src/lib/debug-utils.ts
// Version: 1.1.0
// Last Modified: 21-02-2025 17:55 IST

// Explicitly define which debug categories to enable, even in development
const ENABLED_DEBUG_CATEGORIES: Record<string, boolean> = {
  'Error': true,        // Keep error logging enabled
  'Critical': true,     // Keep critical logging enabled
  'Admin Check': false, // Disable admin check logging
  'Users Fetch': false, // Disable users fetch logging
  'Auth': false,        // Disable auth logging
  'API': false         // Disable general API logging
};

const DEBUG = import.meta.env.DEV;

export const debugLog = (category: string, message: string, data?: any) => {
  // Only log if we're in debug mode AND the category is enabled
  if (!DEBUG || !ENABLED_DEBUG_CATEGORIES[category]) return;
  
  console.log(`[${category}] ${message}`, data ? {
    timestamp: new Date().toISOString(),
    ...data
  } : '');
};

export const debugError = (category: string, message: string, error: any) => {
  // Always log errors in debug mode, regardless of category
  if (!DEBUG) return;

  console.error(`[${category}] ${message}`, {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined
  });
};

// New helper to check if debugging is enabled for a category
export const isDebugEnabled = (category: string): boolean => {
  return DEBUG && ENABLED_DEBUG_CATEGORIES[category];
};