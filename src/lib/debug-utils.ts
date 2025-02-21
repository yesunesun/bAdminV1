// src/lib/debug-utils.ts
// Version: 1.0.0
// Last Modified: 20-02-2025 20:00 IST

const DEBUG = import.meta.env.DEV;

export const debugLog = (category: string, message: string, data?: any) => {
  if (!DEBUG) return;
  
  console.log(`[${category}] ${message}`, data ? {
    timestamp: new Date().toISOString(),
    ...data
  } : '');
};

export const debugError = (category: string, message: string, error: any) => {
  if (!DEBUG) return;

  console.error(`[${category}] ${message}`, {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined
  });
};