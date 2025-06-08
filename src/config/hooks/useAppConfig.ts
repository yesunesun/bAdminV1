// src/config/hooks/useAppConfig.ts
// Version: 1.1.0
// Last Modified: 08-06-2025 18:30 IST
// Purpose: Hook to access app configuration with fallback values - Fixed infinite re-render issue

import { useState, useEffect, useMemo } from 'react';
import { loadAppConfig, type AppConfig } from '../index';

/**
 * Hook to load and access app configuration
 * Returns the config with proper fallbacks
 */
export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const appConfig = await loadAppConfig();
        setConfig(appConfig);
      } catch (err) {
        console.error('Failed to load app config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Set fallback config
        setConfig({
          pagination: {
            properties: { default: 20, options: [10, 20, 50, 100], max: 100 },
            users: { default: 15, options: [10, 15, 25, 50], max: 50 },
            search_results: { default: 25, options: [10, 25, 50], max: 100 }
          },
          search: {
            debounce_delay: 300,
            max_suggestions: 5,
            max_results: 1000,
            timeout: 5000
          },
          listing: {
            featured_properties_count: 6,
            latest_properties_count: 20,
            similar_properties_count: 8,
            defaultPropertyListCount: 25, // Fallback value
            image_lazy_loading: true,
            show_property_code: true,
            cache_images: true,
            image_quality: "medium",
            default_zoom_level: 12,
            cluster_properties: true,
            max_map_markers: 100
          },
          dev_features: {
            enable_debug_mode: true,
            enable_property_analytics: false,
            enable_video_upload: true,
            enable_coordinate_sync: true,
            show_performance_metrics: false,
            enable_error_reporting: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  /**
   * Get the default property list count with fallback to 25
   * Using useMemo to prevent infinite re-renders
   */
  const getDefaultPropertyListCount = useMemo((): number => {
    return config?.listing?.defaultPropertyListCount ?? 25;
  }, [config?.listing?.defaultPropertyListCount]);

  /**
   * Get listing configuration with fallbacks
   * Using useMemo to prevent infinite re-renders
   */
  const getListingConfig = useMemo(() => {
    return {
      featuredPropertiesCount: config?.listing?.featured_properties_count ?? 6,
      latestPropertiesCount: config?.listing?.latest_properties_count ?? 20,
      similarPropertiesCount: config?.listing?.similar_properties_count ?? 8,
      defaultPropertyListCount: getDefaultPropertyListCount,
      imageLazyLoading: config?.listing?.image_lazy_loading ?? true,
      showPropertyCode: config?.listing?.show_property_code ?? true,
      cacheImages: config?.listing?.cache_images ?? true,
      imageQuality: config?.listing?.image_quality ?? "medium",
      defaultZoomLevel: config?.listing?.default_zoom_level ?? 12,
      clusterProperties: config?.listing?.cluster_properties ?? true,
      maxMapMarkers: config?.listing?.max_map_markers ?? 100
    };
  }, [config?.listing, getDefaultPropertyListCount]);

  return {
    config,
    loading,
    error,
    getDefaultPropertyListCount,
    getListingConfig
  };
};

// End of file