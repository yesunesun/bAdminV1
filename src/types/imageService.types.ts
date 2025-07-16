// src/types/imageService.types.ts
// Version: 1.0.0
// Last Modified: 2025-01-16
// Purpose: Type definitions for unified image service

export interface CachedImage {
  url: string;
  timestamp: number;
  format: ImageFormat;
  size?: ImageSize;
}

export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'unknown';
export type ImageSize = 'thumbnail' | 'medium' | 'full' | 'original';

export interface ImageContext {
  propertyId: string;
  fileName: string;
  component: string;
  attempt: number;
}

export interface ImageLoadResult {
  success: boolean;
  url: string;
  format: ImageFormat;
  size?: ImageSize;
  fromCache: boolean;
  loadTime?: number;
  error?: string;
}

export interface ImageFallbackStrategy {
  formats: ImageFormat[];
  sizes: ImageSize[];
  paths: string[];
  maxAttempts: number;
}

export interface ImageServiceConfig {
  cacheDuration: number;
  maxCacheSize: number;
  defaultImage: string;
  storageBucket: string;
  enableOptimization: boolean;
  enableLegacySupport: boolean;
  fallbackStrategy: ImageFallbackStrategy;
}

export interface OptimizationImageRecord {
  id: string;
  property_id: string;
  original_filename: string;
  thumbnail_path?: string;
  medium_path?: string;
  full_path?: string;
  created_at: string;
}

export interface UnifiedImageService {
  // Core image loading
  getImageUrl(propertyId: string, fileName: string, size?: ImageSize): Promise<string>;
  
  // Format detection and support
  detectImageFormat(fileName: string): ImageFormat;
  
  // Batch operations
  preloadImages(propertyId: string, fileNames: string[]): Promise<string[]>;
  
  // Cache management
  getCachedUrl(propertyId: string, fileName: string): string | null;
  setCachedUrl(propertyId: string, fileName: string, url: string, format: ImageFormat): void;
  clearCache(propertyId?: string): void;
  
  // Error handling
  handleImageError(error: Error, context: ImageContext): Promise<string>;
  
  // Legacy support
  handleLegacyImage(propertyId: string, fileName: string): Promise<string>;
  
  // Optimization integration
  getOptimizedVariant(propertyId: string, fileName: string, size: ImageSize): Promise<string>;
  
  // Configuration
  updateConfig(config: Partial<ImageServiceConfig>): void;
  
  // Statistics
  getCacheStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; url: string; timestamp: number }>;
  };
}

export interface ImageValidationResult {
  isValid: boolean;
  format: ImageFormat;
  error?: string;
  size?: number;
}

export interface ImageLoadOptions {
  preferredSize?: ImageSize;
  allowFallback?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface ImageUrlGenerationResult {
  url: string;
  source: 'cache' | 'storage' | 'optimization' | 'fallback';
  format: ImageFormat;
  size?: ImageSize;
}

export interface LegacyImageMapping {
  originalFileName: string;
  newFileName?: string;
  migrationStatus: 'pending' | 'completed' | 'failed';
  migrationDate?: string;
}

export interface ImagePerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  errorRate: number;
  fallbackRate: number;
}

export interface ImageDebugInfo {
  propertyId: string;
  fileName: string;
  attempts: Array<{
    method: string;
    url: string;
    success: boolean;
    error?: string;
    duration: number;
  }>;
  finalUrl: string;
  totalDuration: number;
}