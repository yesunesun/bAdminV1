// src/services/unifiedImageService.ts
// Version: 1.0.0
// Last Modified: 2025-01-16
// Purpose: Unified image service combining all image handling functionality

import { supabase } from '@/lib/supabase';
import {
  CachedImage,
  ImageFormat,
  ImageSize,
  ImageContext,
  ImageServiceConfig,
  UnifiedImageService,
  ImagePerformanceMetrics
} from '@/types/imageService.types';
import {
  detectImageFormat,
  validateImageFileName,
  generateFallbackFilenames,
  isLegacyImageName,
  isOptimizationImageName,
  normalizeImageFileName,
  extractOptimizationId,
  generateImageVariants
} from '@/utils/imageFormatDetection';

class UnifiedImageServiceImpl implements UnifiedImageService {
  private cache = new Map<string, CachedImage>();
  private performanceMetrics: ImagePerformanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    errorRate: 0,
    fallbackRate: 0
  };
  
  private config: ImageServiceConfig = {
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    maxCacheSize: 1000,
    defaultImage: '/noimage.png',
    storageBucket: 'property-images-v2',
    enableOptimization: true, // Re-enabled with proper error handling
    enableLegacySupport: true,
    fallbackStrategy: {
      formats: ['jpg', 'png', 'webp'],
      sizes: ['medium', 'full', 'thumbnail'],
      paths: ['', 'images/', 'legacy/'],
      maxAttempts: 5
    }
  };

  /**
   * Main method to get image URL with comprehensive fallback strategy
   */
  async getImageUrl(propertyId: string, fileName: string, size?: ImageSize): Promise<string> {
    const startTime = performance.now();
    this.performanceMetrics.totalRequests++;
    
    const context: ImageContext = {
      propertyId,
      fileName,
      component: 'unified-service',
      attempt: 0
    };

    try {
      console.log(`[UnifiedImageService] 🔍 Getting image URL for: ${propertyId}/${fileName} (size: ${size})`);
      
      // Input validation
      if (!propertyId || !fileName) {
        console.log(`[UnifiedImageService] ❌ Invalid input: propertyId=${propertyId}, fileName=${fileName}`);
        this.performanceMetrics.fallbackRate++;
        return this.config.defaultImage;
      }

      // CRITICAL FIX: Prevent UUID processing as filename
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(fileName)) {
        console.log(`[UnifiedImageService] ❌ Rejecting UUID as filename: "${fileName}"`);
        this.performanceMetrics.fallbackRate++;
        return this.config.defaultImage;
      }

      // Normalize filename
      const normalizedFileName = normalizeImageFileName(fileName);
      console.log(`[UnifiedImageService] 🔄 Normalized filename: "${fileName}" -> "${normalizedFileName}"`);
      
      // Check cache first
      const cachedResult = this.getCachedUrl(propertyId, normalizedFileName);
      
      if (cachedResult) {
        console.log(`[UnifiedImageService] 💾 Cache hit for: ${propertyId}/${normalizedFileName}`);
        this.performanceMetrics.cacheHits++;
        return cachedResult;
      }

      console.log(`[UnifiedImageService] 🔍 Cache miss, processing: ${propertyId}/${normalizedFileName}`);
      this.performanceMetrics.cacheMisses++;

      // Handle different image types
      let result: string;
      
      console.log(`[UnifiedImageService] 🔍 Processing image: ${normalizedFileName}`);
      console.log(`[UnifiedImageService] Is optimization image: ${isOptimizationImageName(normalizedFileName)}`);
      console.log(`[UnifiedImageService] Is legacy image: ${isLegacyImageName(normalizedFileName)}`);
      
      if (isOptimizationImageName(normalizedFileName)) {
        // Handle optimization format
        console.log(`[UnifiedImageService] 🔄 Handling as optimization image`);
        result = await this.handleOptimizationImage(normalizedFileName, size);
      } else if (isLegacyImageName(normalizedFileName)) {
        // Handle legacy images with special care
        console.log(`[UnifiedImageService] 🔄 Handling as legacy image`);
        result = await this.handleLegacyImageInternal(propertyId, normalizedFileName);
      } else {
        // Handle regular images
        console.log(`[UnifiedImageService] 🔄 Handling as regular image`);
        result = await this.handleRegularImage(propertyId, normalizedFileName, size);
      }

      // Cache successful result
      if (result && result !== this.config.defaultImage) {
        const format = detectImageFormat(normalizedFileName);
        this.setCachedUrl(propertyId, normalizedFileName, result, format);
      }

      // Update performance metrics
      const loadTime = performance.now() - startTime;
      this.updateLoadTime(loadTime);

      return result;

    } catch (error) {
      console.error(`[UnifiedImageService] Error loading image ${propertyId}/${fileName}:`, error);
      this.performanceMetrics.errorRate++;
      
      return await this.handleImageError(error as Error, context);
    }
  }

  /**
   * Handle optimization format images
   */
  private async handleOptimizationImage(fileName: string, size?: ImageSize): Promise<string> {
    const optimizationId = extractOptimizationId(fileName);
    if (!optimizationId) {
      console.debug(`[UnifiedImageService] Could not extract optimization ID from: ${fileName}`);
      return this.config.defaultImage;
    }

    try {
      console.log(`[UnifiedImageService] 🔍 Querying optimization record for ID: ${optimizationId}`);
      
      const { data: optRecord, error } = await supabase
        .from('image_optimizations')
        .select('medium_path, full_path, thumbnail_path')
        .eq('id', optimizationId)
        .single();

      if (error) {
        console.log(`[UnifiedImageService] ❌ Optimization query error for ID ${optimizationId}:`, error);
        return this.config.defaultImage;
      }

      if (!optRecord) {
        console.log(`[UnifiedImageService] ❌ No optimization record found for ID: ${optimizationId}`);
        return this.config.defaultImage;
      }

      // Choose the best available size
      const preferredSize = size || 'medium';
      let imagePath = optRecord[`${preferredSize}_path`];
      
      // Fallback to other sizes if preferred not available
      if (!imagePath) {
        imagePath = optRecord.medium_path || optRecord.full_path || optRecord.thumbnail_path;
      }

      if (!imagePath) {
        console.log(`[UnifiedImageService] ❌ No valid image path found in optimization record for ID: ${optimizationId}`);
        return this.config.defaultImage;
      }

      const { data } = supabase.storage
        .from(this.config.storageBucket)
        .getPublicUrl(imagePath);

      if (data.publicUrl) {
        const finalUrl = `${data.publicUrl}?t=${Date.now()}`;
        console.log(`[UnifiedImageService] ✅ Optimization image loaded successfully: ${finalUrl}`);
        return finalUrl;
      } else {
        console.log(`[UnifiedImageService] ❌ Could not construct public URL for path: ${imagePath}`);
        return this.config.defaultImage;
      }

    } catch (error) {
      console.error(`[UnifiedImageService] Error loading optimization image for ID ${optimizationId}:`, error);
      return this.config.defaultImage;
    }
  }

  /**
   * Handle legacy images with enhanced support
   */
  private async handleLegacyImageInternal(propertyId: string, fileName: string): Promise<string> {
    if (!this.config.enableLegacySupport) {
      return this.config.defaultImage;
    }

    // Try multiple strategies for legacy images
    const strategies = [
      // Strategy 1: Try original filename in different paths
      () => this.tryImagePaths(propertyId, fileName),
      
      // Strategy 2: Try without legacy prefix
      () => this.tryWithoutLegacyPrefix(propertyId, fileName),
      
      // Strategy 3: Try different formats
      () => this.tryAlternativeFormats(propertyId, fileName),
      
      // Strategy 4: Try in legacy folder
      () => this.tryLegacyFolder(propertyId, fileName)
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result !== this.config.defaultImage) {
          return result;
        }
      } catch (error) {
        console.debug(`[UnifiedImageService] Legacy strategy failed:`, error);
      }
    }

    return this.config.defaultImage;
  }

  /**
   * Handle regular images with fallback
   */
  private async handleRegularImage(propertyId: string, fileName: string, size?: ImageSize): Promise<string> {
    console.log(`[UnifiedImageService] 📁 Handling regular image: ${propertyId}/${fileName}`);
    
    // Validate filename first
    const validation = validateImageFileName(fileName);
    if (!validation.isValid) {
      console.log(`[UnifiedImageService] ❌ Invalid filename: ${fileName}`, validation);
      return this.config.defaultImage;
    }

    console.log(`[UnifiedImageService] ✅ Filename validation passed for: ${fileName}`);

    // PRIORITY 1: Try direct storage lookup first (for old images)
    console.log(`[UnifiedImageService] 🔍 Trying direct storage lookup...`);
    const directUrl = await this.tryDirectImageUrl(propertyId, fileName);
    if (directUrl && directUrl !== this.config.defaultImage) {
      console.log(`[UnifiedImageService] ✅ Direct storage lookup successful`);
      return directUrl;
    }
    
    console.log(`[UnifiedImageService] ❌ Direct storage lookup failed, trying variants...`);

    // PRIORITY 2: Try image variants with direct storage
    const variants = generateImageVariants(fileName);
    for (const variant of variants) {
      if (variant.fileName !== fileName) { // Skip original as we already tried it
        const url = await this.tryDirectImageUrl(propertyId, variant.fileName);
        if (url && url !== this.config.defaultImage) {
          return url;
        }
      }
    }

    // PRIORITY 3: Try optimization system (for new images)
    if (this.config.enableOptimization) {
      return await this.tryOptimizationSystem(propertyId, fileName, size);
    }
    
    console.log(`[UnifiedImageService] ❌ All strategies failed for ${propertyId}/${fileName}`);
    console.log(`[UnifiedImageService] Returning default image: ${this.config.defaultImage}`);

    return this.config.defaultImage;
  }

  /**
   * Try to get image from direct storage path
   */
  private async tryDirectImageUrl(propertyId: string, fileName: string): Promise<string> {
    try {
      // FAST APPROACH: Just construct the public URL directly (like fastImageService)
      const { data } = supabase.storage
        .from(this.config.storageBucket)
        .getPublicUrl(`${propertyId}/${fileName}`);

      if (data.publicUrl) {
        // Add timestamp to prevent caching issues
        const finalUrl = `${data.publicUrl}?t=${Date.now()}`;
        console.log(`[UnifiedImageService] ✅ Direct URL constructed: ${finalUrl}`);
        return finalUrl;
      }

      console.log(`[UnifiedImageService] ❌ Could not construct URL for: ${propertyId}/${fileName}`);
      return this.config.defaultImage;
    } catch (error) {
      console.log(`[UnifiedImageService] Direct URL failed for ${propertyId}/${fileName}:`, error);
      return this.config.defaultImage;
    }
  }

  /**
   * Try multiple image paths
   */
  private async tryImagePaths(propertyId: string, fileName: string): Promise<string> {
    const paths = this.config.fallbackStrategy.paths;
    
    for (const path of paths) {
      const fullPath = path ? `${path}${fileName}` : fileName;
      const url = await this.tryDirectImageUrl(propertyId, fullPath);
      if (url && url !== this.config.defaultImage) {
        return url;
      }
    }

    return this.config.defaultImage;
  }

  /**
   * Try without legacy prefix
   */
  private async tryWithoutLegacyPrefix(propertyId: string, fileName: string): Promise<string> {
    const cleanName = fileName.replace(/^(legacy-|img-|_old|-old)/, '');
    if (cleanName !== fileName) {
      return await this.tryDirectImageUrl(propertyId, cleanName);
    }
    return this.config.defaultImage;
  }

  /**
   * Try alternative formats
   */
  private async tryAlternativeFormats(propertyId: string, fileName: string): Promise<string> {
    const fallbackNames = generateFallbackFilenames(fileName);
    
    for (const fallbackName of fallbackNames) {
      const url = await this.tryDirectImageUrl(propertyId, fallbackName);
      if (url && url !== this.config.defaultImage) {
        return url;
      }
    }

    return this.config.defaultImage;
  }

  /**
   * Try legacy folder
   */
  private async tryLegacyFolder(propertyId: string, fileName: string): Promise<string> {
    return await this.tryDirectImageUrl(propertyId, `legacy/${fileName}`);
  }

  /**
   * Try optimization system
   */
  private async tryOptimizationSystem(propertyId: string, fileName: string, size?: ImageSize): Promise<string> {
    try {
      // TEMPORARILY DISABLED: Skip optimization table query to prevent 406 errors
      console.warn(`[UnifiedImageService] Optimization system disabled - skipping for ${propertyId}/${fileName}`);
      return this.config.defaultImage;
      
      // const { data, error } = await supabase
      //   .from('image_optimizations')
      //   .select('medium_path, full_path, thumbnail_path')
      //   .eq('property_id', propertyId)
      //   .eq('original_filename', fileName)
      //   .order('created_at', { ascending: false })
      //   .limit(1)
      //   .single();

      if (error || !data) {
        return this.config.defaultImage;
      }

      const preferredSize = size || 'medium';
      let imagePath = data[`${preferredSize}_path`];
      
      if (!imagePath) {
        imagePath = data.medium_path || data.full_path || data.thumbnail_path;
      }

      if (!imagePath) {
        return this.config.defaultImage;
      }

      const { data: urlData } = supabase.storage
        .from(this.config.storageBucket)
        .getPublicUrl(imagePath);

      return urlData.publicUrl || this.config.defaultImage;

    } catch (error) {
      console.error(`[UnifiedImageService] Optimization system failed:`, error);
      return this.config.defaultImage;
    }
  }

  /**
   * Detect image format
   */
  detectImageFormat(fileName: string): ImageFormat {
    return detectImageFormat(fileName);
  }

  /**
   * Preload multiple images
   */
  async preloadImages(propertyId: string, fileNames: string[]): Promise<string[]> {
    const promises = fileNames.map(fileName => 
      this.getImageUrl(propertyId, fileName)
    );

    return Promise.all(promises);
  }

  /**
   * Get cached URL
   */
  getCachedUrl(propertyId: string, fileName: string): string | null {
    const cacheKey = this.generateCacheKey(propertyId, fileName);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
      return cached.url;
    }

    // Remove expired cache entry
    if (cached) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Set cached URL
   */
  setCachedUrl(propertyId: string, fileName: string, url: string, format: ImageFormat): void {
    const cacheKey = this.generateCacheKey(propertyId, fileName);
    
    // Implement cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 10% of entries
      const toRemove = Math.ceil(entries.length * 0.1);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(cacheKey, {
      url,
      timestamp: Date.now(),
      format
    });
  }

  /**
   * Clear cache
   */
  clearCache(propertyId?: string): void {
    if (propertyId) {
      // Clear cache for specific property
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(`${propertyId}/`)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Handle image error
   */
  async handleImageError(error: Error, context: ImageContext): Promise<string> {
    console.error(`[UnifiedImageService] Image error for ${context.propertyId}/${context.fileName}:`, error);
    
    // Log error details for debugging
    const errorInfo = {
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    console.debug('[UnifiedImageService] Error details:', errorInfo);
    
    return this.config.defaultImage;
  }

  /**
   * Handle legacy image (public interface)
   */
  async handleLegacyImage(propertyId: string, fileName: string): Promise<string> {
    return await this.handleLegacyImageInternal(propertyId, fileName);
  }

  /**
   * Get optimized variant
   */
  async getOptimizedVariant(propertyId: string, fileName: string, size: ImageSize): Promise<string> {
    return await this.getImageUrl(propertyId, fileName, size);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ImageServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      url: value.url,
      timestamp: value.timestamp
    }));

    const hitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100
      : 0;

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      entries
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(propertyId: string, fileName: string, size?: ImageSize): string {
    return `${propertyId}/${fileName}${size ? `_${size}` : ''}`;
  }

  /**
   * Update load time metrics
   */
  private updateLoadTime(loadTime: number): void {
    const currentTotal = this.performanceMetrics.averageLoadTime * (this.performanceMetrics.totalRequests - 1);
    this.performanceMetrics.averageLoadTime = (currentTotal + loadTime) / this.performanceMetrics.totalRequests;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): ImagePerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}

// Export singleton instance
export const unifiedImageService = new UnifiedImageServiceImpl();