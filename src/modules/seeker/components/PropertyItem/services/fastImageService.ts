// src/modules/seeker/components/PropertyItem/services/fastImageService.ts
// Version: 1.0.0
// Last Modified: 26-05-2025 15:30 IST
// Purpose: Ultra-fast image loading using public URLs - zero API calls

import { supabase } from '@/lib/supabase';

class FastImageService {
  private cache = new Map<string, string>();
  private optimizationCache = new Map<string, string>();
  private readonly STORAGE_BUCKET = 'property-images-v2';
  private readonly DEFAULT_IMAGE = '/noimage.png';
  
  // Get the base public URL for the storage bucket
  private getBasePublicUrl(): string {
    const { data } = supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl('');
    return data.publicUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // Get optimization image URL
  async getOptimizationImageUrl(fileName: string): Promise<string> {
    if (!fileName.startsWith('optimization_')) {
      return this.DEFAULT_IMAGE;
    }
    
    const optimizationId = fileName.replace('optimization_', '');
    const cacheKey = `opt_${optimizationId}`;
    
    // Check cache first
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }
    
    try {
      const { data: optRecord, error } = await supabase
        .from('image_optimizations')
        .select('medium_path, full_path, thumbnail_path')
        .eq('id', optimizationId)
        .single();
        
      if (error || !optRecord) {
        console.warn('[FastImageService] Optimization record not found:', optimizationId);
        this.optimizationCache.set(cacheKey, this.DEFAULT_IMAGE);
        return this.DEFAULT_IMAGE;
      }
      
      // Use medium variant for best balance of quality and loading speed
      let imageUrl = this.DEFAULT_IMAGE;
      if (optRecord.medium_path) {
        const { data } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(optRecord.medium_path);
        
        if (data?.publicUrl) {
          imageUrl = data.publicUrl;
        }
      } else if (optRecord.full_path) {
        const { data } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(optRecord.full_path);
        if (data?.publicUrl) imageUrl = data.publicUrl;
      } else if (optRecord.thumbnail_path) {
        const { data } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(optRecord.thumbnail_path);
        if (data?.publicUrl) imageUrl = data.publicUrl;
      }
      
      // Cache the URL
      this.optimizationCache.set(cacheKey, imageUrl);
      return imageUrl;
      
    } catch (err) {
      console.error('[FastImageService] Error loading optimization image:', err);
      this.optimizationCache.set(cacheKey, this.DEFAULT_IMAGE);
      return this.DEFAULT_IMAGE;
    }
  }

  // Get direct public URL - supports optimization format
  getPublicImageUrl(propertyId: string, fileName: string): string {
    if (!propertyId || !fileName) return this.DEFAULT_IMAGE;
    
    // Handle legacy formats
    if (fileName.startsWith('data:image/')) return fileName;
    if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
      return this.DEFAULT_IMAGE;
    }
    
    // Handle optimization format - return placeholder and load async
    if (fileName.startsWith('optimization_')) {
      // For optimization images, we need to do async loading
      // Return default image initially, caller should handle async loading
      return this.DEFAULT_IMAGE;
    }
    
    const cacheKey = `${propertyId}/${fileName}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Build direct public URL
    const baseUrl = this.getBasePublicUrl();
    const publicUrl = `${baseUrl}/${propertyId}/${fileName}`;
    
    // Cache the URL
    this.cache.set(cacheKey, publicUrl);
    
    return publicUrl;
  }
  
  // Try to find first available image (only when needed)
  async findFirstImageUrl(propertyId: string): Promise<string> {
    try {
      // Only make API call when absolutely necessary
      const { data: files, error } = await supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .list(`${propertyId}/`, {
          limit: 1,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error || !files || files.length === 0) {
        return this.DEFAULT_IMAGE;
      }
      
      // Find first image file
      const imageFile = files.find(file => 
        file.name && 
        !file.name.endsWith('/') &&
        (file.metadata?.mimetype?.startsWith('image/') || 
         file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      );
      
      if (imageFile) {
        return this.getPublicImageUrl(propertyId, imageFile.name);
      }
      
      return this.DEFAULT_IMAGE;
      
    } catch (error) {
      console.error(`Error finding images for property ${propertyId}:`, error);
      return this.DEFAULT_IMAGE;
    }
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
  
  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.entries())
    };
  }
}

// Export singleton
export const fastImageService = new FastImageService();