// src/config/index.ts
// Version: 1.1.0
// Last Modified: 08-06-2025 16:20 IST
// Purpose: Fixed import paths for YAML files in root /config folder

import yaml from 'js-yaml';
import type { HomeConfig, AppConfig } from './types';

// Cache for loaded configurations
let homeConfigCache: HomeConfig | null = null;
let appConfigCache: AppConfig | null = null;

/**
 * Loads and parses the home configuration from YAML
 */
export async function loadHomeConfig(): Promise<HomeConfig> {
  if (homeConfigCache) {
    return homeConfigCache;
  }

  try {
    // Import the YAML file from root /config folder as raw text
    const homeConfigYaml = await import('/config/home-config.yml?raw');
    const configData = yaml.load(homeConfigYaml.default) as HomeConfig;
    
    // Validate required fields
    if (!configData.company?.name) {
      throw new Error('Invalid home config: company.name is required');
    }
    
    homeConfigCache = configData;
    console.log('✅ Home configuration loaded successfully from /config/home-config.yml');
    return configData;
  } catch (error) {
    console.error('❌ Failed to load home configuration from /config/home-config.yml:', error);
    
    // Return fallback configuration
    return getFallbackHomeConfig();
  }
}

/**
 * Loads and parses the app configuration from YAML
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (appConfigCache) {
    return appConfigCache;
  }

  try {
    // Import the YAML file from root /config folder as raw text
    const appConfigYaml = await import('/config/app-config.yml?raw');
    const configData = yaml.load(appConfigYaml.default) as AppConfig;
    
    // Validate required fields
    if (!configData.pagination?.properties) {
      throw new Error('Invalid app config: pagination.properties is required');
    }
    
    appConfigCache = configData;
    console.log('✅ App configuration loaded successfully from /config/app-config.yml');
    return configData;
  } catch (error) {
    console.error('❌ Failed to load app configuration from /config/app-config.yml:', error);
    
    // Return fallback configuration
    return getFallbackAppConfig();
  }
}

/**
 * Fallback home configuration if YAML loading fails
 */
function getFallbackHomeConfig(): HomeConfig {
  console.warn('🔄 Using fallback home configuration');
  return {
    company: {
      name: "Bhoomitalli Real Estate",
      tagline: "Connecting property owners and seekers across India",
      copyright_year: 2025
    },
    contact: {
      phone: "+91 98765 43210",
      email: "info@bhoomitalli.com",
      support_email: "support@bhoomitalli.com",
      business_hours: "9:00 AM - 6:00 PM IST"
    },
    social_media: {
      facebook: { url: "https://facebook.com/bhoomitalli", enabled: true },
      twitter: { url: "https://twitter.com/bhoomitalli", enabled: true },
      instagram: { url: "https://instagram.com/bhoomitalli", enabled: true },
      linkedin: { url: "https://linkedin.com/company/bhoomitalli", enabled: false }
    },
    footer_links: {
      quick_links: [
        { name: "Home", path: "/", enabled: true },
        { name: "Browse Properties", path: "/seeker", enabled: true },
        { name: "List Property", path: "/properties/list", enabled: true },
        { name: "Login / Register", path: "/login", enabled: true }
      ],
      legal_links: [
        { name: "Privacy", path: "/privacy", enabled: true },
        { name: "Terms", path: "/terms", enabled: true },
        { name: "Sitemap", path: "/sitemap", enabled: true }
      ]
    },
    homepage: {
      hero: {
        title: "Welcome to Bhoomitalli",
        subtitle: "Your complete real estate platform for property owners, seekers, moderators and administrators"
      },
      sections: {
        featured_title: "Featured Properties",
        latest_title: "Latest Properties",
        popular_locations_title: "Popular Locations"
      }
    },
    ui_features: {
      show_social_links: true,
      show_phone_in_footer: true,
      show_email_in_footer: true,
      show_hero_section: true,
      show_featured_section: true,
      show_latest_section: true
    }
  };
}

/**
 * Fallback app configuration if YAML loading fails
 */
function getFallbackAppConfig(): AppConfig {
  console.warn('🔄 Using fallback app configuration');
  return {
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
  };
}

/**
 * Clears the configuration cache (useful for testing or reloading)
 */
export function clearConfigCache(): void {
  homeConfigCache = null;
  appConfigCache = null;
  console.log('🔄 Configuration cache cleared');
}

/**
 * Re-exports types for convenience
 */
export type { HomeConfig, AppConfig } from './types';

// End of file