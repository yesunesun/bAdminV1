// src/config/types.ts
// Version: 1.4.0
// Last Modified: 08-06-2025 18:15 IST
// Purpose: Added defaultPropertyListCount to ListingSettings

export interface CompanyInfo {
  name: string;
  tagline?: string;
  copyright_year?: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  support_email?: string;
  business_hours: string;
}

export interface SocialMediaLink {
  url: string;
  enabled: boolean;
}

export interface SocialMediaLinks {
  facebook: SocialMediaLink;
  twitter: SocialMediaLink;
  instagram: SocialMediaLink;
  linkedin: SocialMediaLink;
}

export interface FooterLink {
  name: string;
  path: string;
  enabled: boolean;
}

export interface FooterLinks {
  quick_links: FooterLink[];
  legal_links: FooterLink[];
}

export interface HeroSection {
  title: string;
  subtitle: string;
}

export interface HomepageSections {
  featured_title: string;
  latest_title: string;
  popular_locations_title: string;
}

export interface HomepageSettings {
  hero: HeroSection;
  sections: HomepageSections;
}

export interface UIFeatures {
  show_hero_section: boolean;
  show_contact_info: boolean;
  show_social_links: boolean;
  show_phone_in_footer: boolean;
  show_email_in_footer: boolean;
  show_featured_section: boolean;
  show_latest_section: boolean;
}

export interface HomeConfig {
  company: CompanyInfo;
  contact: ContactInfo;
  social_media: SocialMediaLinks;
  footer_links: FooterLinks;
  homepage: HomepageSettings;
  ui_features: UIFeatures;
}

// Keep existing AppConfig types...
export interface PaginationSetting {
  default: number;
  options: number[];
  max: number;
}

export interface PaginationSettings {
  properties: PaginationSetting;
  users: PaginationSetting;
  search_results: PaginationSetting;
}

export interface SearchSettings {
  debounce_delay: number;
  max_suggestions: number;
  max_results: number;
  timeout: number;
}

export interface ListingSettings {
  featured_properties_count: number;
  latest_properties_count: number;
  similar_properties_count: number;
  defaultPropertyListCount: number; // NEW: Configurable property list count
  image_lazy_loading: boolean;
  show_property_code: boolean;
  cache_images: boolean;
  image_quality: string;
  default_zoom_level: number;
  cluster_properties: boolean;
  max_map_markers: number;
}

export interface DevFeatures {
  enable_debug_mode: boolean;
  enable_property_analytics: boolean;
  enable_video_upload: boolean;
  enable_coordinate_sync: boolean;
  show_performance_metrics: boolean;
  enable_error_reporting: boolean;
}

export interface AppConfig {
  pagination: PaginationSettings;
  search: SearchSettings;
  listing: ListingSettings;
  dev_features: DevFeatures;
}

// End of file