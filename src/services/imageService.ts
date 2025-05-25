// src/services/imageService.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 14:30 IST
// Purpose: Optimized image service for fast loading

import { supabase } from '@/lib/supabase';

interface CachedImage {
  url: string;
  timestamp: number;
  blobUrl?: string;
}

class ImageService {
  private cache = new Map<string, CachedImage>();
  private pendingRequests = new Map<string, Promise<string>>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly STORAGE_BUCKET = 'property-images-v2';

  // Get image URL with caching
  async getImageUrl(propertyId: string, fileName: string): Promise<string> {
    if (!propertyId || !fileName) return '/noimage.png';

    // Handle legacy formats
    if (fileName.startsWith('data:image/')) return fileName;
    if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
      return '/noimage.png';
    }

    const cacheKey = `${propertyId}/${fileName}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.blobUrl || cached.url;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) return pending;

    // Create new request
    const promise = this.createImageUrl(propertyId, fileName, cacheKey);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const url = await promise;
      this.pendingRequests.delete(cacheKey);
      return url;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error(`Failed to load image ${cacheKey}:`, error);
      return '/noimage.png';
    }
  }

  private async createImageUrl(propertyId: string, fileName: string, cacheKey: string): Promise<string> {
    try {
      // Method 1: Try to create blob URL for best performance
      const { data, error } = await supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .download(`${propertyId}/${fileName}`);

      if (!error && data) {
        const blob = new Blob([data], { type: 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Cache with blob URL
        this.cache.set(cacheKey, {
          url: blobUrl,
          blobUrl,
          timestamp: Date.now()
        });

        return blobUrl;
      }
    } catch (error) {
      console.warn(`Blob creation failed for ${cacheKey}, falling back to public URL`);
    }

    // Method 2: Fall back to public URL
    const { data: urlData } = supabase
      .storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(`${propertyId}/${fileName}`);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    
    // Cache public URL
    this.cache.set(cacheKey, {
      url: publicUrl,
      timestamp: Date.now()
    });

    return publicUrl;
  }

  // Preload multiple images in parallel
  async preloadImages(propertyId: string, fileNames: string[]): Promise<string[]> {
    const promises = fileNames.map(fileName => 
      this.getImageUrl(propertyId, fileName)
    );

    return Promise.all(promises);
  }

  // Clean up blob URLs to prevent memory leaks
  cleanup() {
    this.cache.forEach(cached => {
      if (cached.blobUrl && cached.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cached.blobUrl);
      }
    });
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache stats for debugging
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const imageService = new ImageService();