// src/services/simpleImageService.ts
// Version: 2.0.0
// Last Modified: 17-07-2025 22:25 IST
// Purpose: Simple image service for direct URL display (bypasses optimization tables)

import { supabase } from '@/lib/supabase';

interface CachedImage {
  url: string;
  timestamp: number;
}

class SimpleImageService {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly STORAGE_BUCKET = 'property-images-v2';

  /**
   * Gets image URL directly from property_details.imageFiles array (async)
   * This bypasses all optimization tables and services
   */
  async getPropertyImageUrlAsync(propertyId: string, fileName?: string, preferPrimary: boolean = true): Promise<string> {
    if (!propertyId) return '/noimage.png';

    const cacheKey = `property_${propertyId}_${fileName || 'primary'}_${preferPrimary}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }

    try {
      console.log(`[SimpleImageService] Getting image for property: ${propertyId}, fileName: ${fileName}, preferPrimary: ${preferPrimary}`);
      
      // Fetch property data to get imageFiles array
      const { data: property, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        console.log(`[SimpleImageService] Property not found: ${propertyId}`);
        return '/noimage.png';
      }

      const imageFiles = property.property_details?.imageFiles;
      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        console.log(`[SimpleImageService] No images found for property: ${propertyId}`);
        return '/noimage.png';
      }

      let selectedImage;

      if (fileName) {
        // Find specific image by fileName
        selectedImage = imageFiles.find(img => img.fileName === fileName);
        if (!selectedImage) {
          console.log(`[SimpleImageService] Image not found by fileName: ${fileName}`);
          return '/noimage.png';
        }
      } else if (preferPrimary) {
        // Find primary image
        selectedImage = imageFiles.find(img => img.isPrimary);
        if (!selectedImage) {
          // Fallback to first image
          selectedImage = imageFiles[0];
        }
      } else {
        // Just get first image
        selectedImage = imageFiles[0];
      }

      if (!selectedImage || !selectedImage.url) {
        console.log(`[SimpleImageService] No valid image found for property: ${propertyId}`);
        return '/noimage.png';
      }

      const imageUrl = selectedImage.url;
      console.log(`[SimpleImageService] Found image URL: ${imageUrl}`);

      // Cache the result
      this.cache.set(cacheKey, {
        url: imageUrl,
        timestamp: Date.now()
      });

      return imageUrl;

    } catch (error) {
      console.error(`[SimpleImageService] Error getting image for property ${propertyId}:`, error);
      return '/noimage.png';
    }
  }

  /**
   * Gets all image URLs for a property from imageFiles array (async)
   */
  async getPropertyImageUrlsAsync(propertyId: string): Promise<string[]> {
    if (!propertyId) return [];

    const cacheKey = `property_${propertyId}_all_images`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return JSON.parse(cached.url); // Store array as JSON string in cache
    }

    try {
      console.log(`[SimpleImageService] Getting all images for property: ${propertyId}`);
      
      const { data: property, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        console.log(`[SimpleImageService] Property not found: ${propertyId}`);
        return [];
      }

      const imageFiles = property.property_details?.imageFiles;
      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        console.log(`[SimpleImageService] No images found for property: ${propertyId}`);
        return [];
      }

      // Sort by display order and extract URLs
      const urls = imageFiles
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(img => img.url)
        .filter(url => url && url !== '');

      console.log(`[SimpleImageService] Found ${urls.length} images for property: ${propertyId}`);

      // Cache the result
      this.cache.set(cacheKey, {
        url: JSON.stringify(urls),
        timestamp: Date.now()
      });

      return urls;

    } catch (error) {
      console.error(`[SimpleImageService] Error getting images for property ${propertyId}:`, error);
      return [];
    }
  }

  /**
   * Direct file URL from Supabase storage (for legacy support) (async)
   * This is for backwards compatibility with old image handling
   */
  async getDirectImageUrlAsync(propertyId: string, fileName: string): Promise<string> {
    if (!propertyId || !fileName) return '/noimage.png';

    const cacheKey = `direct_${propertyId}_${fileName}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }

    try {
      // Construct public URL directly
      const { data } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(`${propertyId}/${fileName}`);

      if (data.publicUrl) {
        const finalUrl = `${data.publicUrl}?t=${Date.now()}`;
        
        // Cache the result
        this.cache.set(cacheKey, {
          url: finalUrl,
          timestamp: Date.now()
        });

        return finalUrl;
      }

      return '/noimage.png';
    } catch (error) {
      console.error(`[SimpleImageService] Error getting direct image URL for ${propertyId}/${fileName}:`, error);
      return '/noimage.png';
    }
  }

  /**
   * Preload multiple property images
   */
  async preloadPropertyImages(propertyId: string): Promise<string[]> {
    return await this.getPropertyImageUrlsAsync(propertyId);
  }

  /**
   * Clear cache for specific property or all
   */
  clearCache(propertyId?: string) {
    if (propertyId) {
      // Clear cache for specific property
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(`property_${propertyId}`) || key.includes(`direct_${propertyId}`)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }

  // Synchronous methods for backward compatibility
  /**
   * Gets image URL synchronously from cache or returns placeholder
   * This is for components that need immediate response
   */
  getPropertyImageUrl(propertyId: string, imageId?: string): string | null {
    if (!propertyId) return null;
    
    const cacheKey = `property_${propertyId}_${imageId || 'primary'}_true`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }
    
    // Return null so component can handle async loading
    return null;
  }

  /**
   * Gets all image URLs synchronously from cache or returns empty array
   */
  getPropertyImageUrls(propertyId: string): string[] {
    if (!propertyId) return [];
    
    const cacheKey = `property_${propertyId}_all_images`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return JSON.parse(cached.url);
    }
    
    return [];
  }

  /**
   * Gets direct image URL synchronously
   */
  getDirectImageUrl(propertyId: string, filename: string): string {
    if (!propertyId || !filename) return '/noimage.png';
    
    const cacheKey = `direct_${propertyId}_${filename}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }
    
    // Construct URL directly without async
    const { data } = supabase.storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(`${propertyId}/${filename}`);
    
    return data.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : '/noimage.png';
  }

  /**
   * Cleanup method for backward compatibility (clears cache)
   */
  cleanup() {
    this.clearCache();
  }
}

export const simpleImageService = new SimpleImageService();

// End of file