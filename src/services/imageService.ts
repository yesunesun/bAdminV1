// src/services/imageService.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 19:30 IST
// Purpose: Simplified image service for immediate bug fix

import { supabase } from '@/lib/supabase';

interface CachedImage {
  url: string;
  timestamp: number;
}

class ImageService {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly STORAGE_BUCKET = 'property-images-v2';

  // Get image URL with basic caching
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
      return cached.url;
    }

    try {
      // Try to get public URL
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
    } catch (error) {
      console.error(`Failed to load image ${cacheKey}:`, error);
      return '/noimage.png';
    }
  }

  // Preload multiple images in parallel
  async preloadImages(propertyId: string, fileNames: string[]): Promise<string[]> {
    const promises = fileNames.map(fileName => 
      this.getImageUrl(propertyId, fileName)
    );

    return Promise.all(promises);
  }

  // Clean up cache
  cleanup() {
    this.cache.clear();
  }
}

export const imageService = new ImageService();