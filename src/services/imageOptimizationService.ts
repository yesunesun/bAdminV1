import { supabase } from '../lib/supabase';
import { 
  optimizeImageToVariants, 
  generateOptimizedFilename, 
  generateStoragePath,
  validateImageFile,
  type OptimizedImageResult,
  type ImageVariant
} from '../utils/imageOptimization';

export interface ImageOptimizationRecord {
  id?: string;
  property_id: string;
  original_filename: string;
  original_size_bytes: number;
  thumbnail_filename?: string;
  thumbnail_size_bytes?: number;
  medium_filename?: string;
  medium_size_bytes?: number;
  full_filename?: string;
  full_size_bytes?: number;
  optimization_time_ms: number;
  storage_bucket: string;
  original_path?: string;
  thumbnail_path?: string;
  medium_path?: string;
  full_path?: string;
  image_type?: string;
  optimization_version: string;
}

export interface UploadResult {
  optimizationRecord: ImageOptimizationRecord;
  urls: {
    original?: string;
    thumbnail?: string;
    medium?: string;
    full?: string;
  };
  success: boolean;
  error?: string;
}

class ImageOptimizationService {
  private readonly STORAGE_BUCKET = 'property-images-v2';
  private readonly OPTIMIZATION_VERSION = 'v1';

  /**
   * Uploads and optimizes an image, creating multiple variants
   * @param file Original image file
   * @param propertyId Property ID
   * @param imageIndex Index of the image (for multiple images)
   * @param imageType Type of image ('main', 'gallery', 'floor_plan', etc.)
   * @returns Upload result with optimization data
   */
  async uploadAndOptimizeImage(
    file: File,
    propertyId: string,
    imageIndex: number = 0,
    imageType: string = 'gallery'
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return {
          optimizationRecord: {} as ImageOptimizationRecord,
          urls: {},
          success: false,
          error: validation.error
        };
      }

      // Optimize image to multiple variants
      const optimizationResult = await optimizeImageToVariants(file);
      
      // Upload original and all variants
      const uploadPromises = await this.uploadAllVariants(
        optimizationResult,
        propertyId,
        imageIndex
      );

      // Create optimization record
      const optimizationRecord = await this.createOptimizationRecord(
        optimizationResult,
        propertyId,
        imageIndex,
        imageType,
        uploadPromises
      );

      // Get public URLs
      const urls = await this.getPublicUrls(uploadPromises);

      return {
        optimizationRecord,
        urls,
        success: true
      };
    } catch (error) {
      console.error('Image upload and optimization failed:', error);
      return {
        optimizationRecord: {} as ImageOptimizationRecord,
        urls: {},
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Uploads original file and all optimized variants to Supabase storage
   */
  private async uploadAllVariants(
    optimizationResult: OptimizedImageResult,
    propertyId: string,
    imageIndex: number
  ) {
    const uploads = {
      original: null as any,
      thumbnail: null as any,
      medium: null as any,
      full: null as any
    };

    // Upload original file
    const originalPath = generateStoragePath(
      propertyId, 
      `original_${imageIndex}.${optimizationResult.original.file.name.split('.').pop()}`
    );
    
    const originalUpload = await supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(originalPath, optimizationResult.original.file, {
        cacheControl: '3600',
        upsert: true
      });

    uploads.original = { ...originalUpload, path: originalPath };

    // Upload all variants
    for (const variant of optimizationResult.variants) {
      const filename = generateOptimizedFilename(
        optimizationResult.original.file.name,
        variant.size,
        propertyId,
        imageIndex
      );
      
      const path = generateStoragePath(propertyId, filename);
      
      const upload = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(path, variant.file, {
          cacheControl: '3600',
          upsert: true
        });

      uploads[variant.size] = { 
        ...upload, 
        path, 
        filename,
        sizeBytes: variant.sizeBytes 
      };
    }

    return uploads;
  }

  /**
   * Creates optimization record in database
   */
  private async createOptimizationRecord(
    optimizationResult: OptimizedImageResult,
    propertyId: string,
    imageIndex: number,
    imageType: string,
    uploadResults: any
  ): Promise<ImageOptimizationRecord> {
    const record: Omit<ImageOptimizationRecord, 'id'> = {
      property_id: propertyId,
      original_filename: optimizationResult.original.file.name,
      original_size_bytes: optimizationResult.original.sizeBytes,
      optimization_time_ms: optimizationResult.optimizationTimeMs,
      storage_bucket: this.STORAGE_BUCKET,
      image_type: imageType,
      optimization_version: this.OPTIMIZATION_VERSION,
      original_path: uploadResults.original?.path
    };

    // Add variant data
    const thumbnail = optimizationResult.variants.find(v => v.size === 'thumbnail');
    const medium = optimizationResult.variants.find(v => v.size === 'medium');
    const full = optimizationResult.variants.find(v => v.size === 'full');

    if (thumbnail && uploadResults.thumbnail?.data) {
      record.thumbnail_filename = uploadResults.thumbnail.filename;
      record.thumbnail_size_bytes = thumbnail.sizeBytes;
      record.thumbnail_path = uploadResults.thumbnail.path;
    }

    if (medium && uploadResults.medium?.data) {
      record.medium_filename = uploadResults.medium.filename;
      record.medium_size_bytes = medium.sizeBytes;
      record.medium_path = uploadResults.medium.path;
    }

    if (full && uploadResults.full?.data) {
      record.full_filename = uploadResults.full.filename;
      record.full_size_bytes = full.sizeBytes;
      record.full_path = uploadResults.full.path;
    }

    const { data, error } = await supabase
      .from('image_optimizations')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Failed to create optimization record:', error);
      throw new Error('Failed to save optimization data');
    }

    return data;
  }

  /**
   * Gets public URLs for all uploaded variants
   */
  private async getPublicUrls(uploadResults: any) {
    const urls: any = {};

    for (const [variant, upload] of Object.entries(uploadResults)) {
      if (upload && upload.data) {
        const { data } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(upload.path);
        
        urls[variant] = data.publicUrl;
      }
    }

    return urls;
  }

  /**
   * Gets optimization records for a property
   */
  async getPropertyOptimizations(propertyId: string): Promise<ImageOptimizationRecord[]> {
    const { data, error } = await supabase
      .from('image_optimizations')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch optimization records:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gets the appropriate image URL based on required size
   */
  async getOptimizedImageUrl(
    propertyId: string,
    imageType: string,
    size: 'thumbnail' | 'medium' | 'full' = 'medium'
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('image_optimizations')
      .select(`${size}_path`)
      .eq('property_id', propertyId)
      .eq('image_type', imageType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    const path = data[`${size}_path`];
    if (!path) return null;

    const { data: urlData } = supabase.storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  /**
   * Gets all optimized image URLs for a property
   */
  async getPropertyImageUrls(
    propertyId: string,
    size: 'thumbnail' | 'medium' | 'full' = 'medium'
  ): Promise<string[]> {
    const optimizations = await this.getPropertyOptimizations(propertyId);
    const urls: string[] = [];

    for (const opt of optimizations) {
      const path = opt[`${size}_path`];
      if (path) {
        const { data } = supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }

    return urls;
  }

  /**
   * Deletes optimization records and files when property is deleted
   */
  async deletePropertyOptimizations(propertyId: string): Promise<boolean> {
    try {
      // Get all optimization records
      const optimizations = await this.getPropertyOptimizations(propertyId);
      
      // Delete files from storage
      const filesToDelete: string[] = [];
      optimizations.forEach(opt => {
        if (opt.original_path) filesToDelete.push(opt.original_path);
        if (opt.thumbnail_path) filesToDelete.push(opt.thumbnail_path);
        if (opt.medium_path) filesToDelete.push(opt.medium_path);
        if (opt.full_path) filesToDelete.push(opt.full_path);
      });

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove(filesToDelete);
      }

      // Delete optimization records
      const { error } = await supabase
        .from('image_optimizations')
        .delete()
        .eq('property_id', propertyId);

      if (error) {
        console.error('Failed to delete optimization records:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete property optimizations:', error);
      return false;
    }
  }
}

export const imageOptimizationService = new ImageOptimizationService();