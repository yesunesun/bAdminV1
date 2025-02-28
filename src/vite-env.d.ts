// src/vite-env.d.ts
// Version: 1.1.0
// Last Modified: 01-03-2025 20:30 IST
// Purpose: Type definitions for environment variables including Google Maps key

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_GOOGLE_MAPS_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }