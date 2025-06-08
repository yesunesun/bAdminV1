// src/config/hooks/useHomeConfig.ts
// Version: 1.1.0
// Last Modified: 08-06-2025 16:45 IST
// Purpose: Added cache clearing and refresh functionality

import { useState, useEffect, useCallback } from 'react';
import { loadHomeConfig, clearConfigCache } from '../index';
import type { HomeConfig } from '../types';

export function useHomeConfig() {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (clearCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if requested
      if (clearCache) {
        clearConfigCache();
      }
      
      const homeConfig = await loadHomeConfig();
      setConfig(homeConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('useHomeConfig error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function to reload config
  const refreshConfig = useCallback(() => {
    fetchConfig(true);
  }, [fetchConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { 
    config, 
    loading, 
    error, 
    refreshConfig 
  };
}

// End of file