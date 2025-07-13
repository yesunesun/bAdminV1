import imageCompression from 'browser-image-compression';

export interface ImageVariant {
  file: File;
  size: 'thumbnail' | 'medium' | 'full';
  width: number;
  height: number;
  sizeBytes: number;
}

export interface OptimizedImageResult {
  original: {
    file: File;
    sizeBytes: number;
  };
  variants: ImageVariant[];
  optimizationTimeMs: number;
  totalSavings: number; // bytes saved
}

export interface ImageSizeConfig {
  thumbnail: { width: number; height: number; quality: number };
  medium: { width: number; height: number; quality: number };
  full: { width: number; height: number; quality: number };
}

// Default size configurations
export const DEFAULT_IMAGE_SIZES: ImageSizeConfig = {
  thumbnail: { width: 300, height: 200, quality: 0.8 },
  medium: { width: 800, height: 600, quality: 0.85 },
  full: { width: 1200, height: 900, quality: 0.9 }
};

/**
 * Optimizes a single image into multiple variants (thumbnail, medium, full)
 * @param file Original image file
 * @param config Size configuration for variants
 * @returns Promise with optimization results
 */
export async function optimizeImageToVariants(
  file: File,
  config: ImageSizeConfig = DEFAULT_IMAGE_SIZES
): Promise<OptimizedImageResult> {
  const startTime = performance.now();
  
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const originalSizeBytes = file.size;
  const variants: ImageVariant[] = [];

  try {
    // Generate thumbnail variant
    const thumbnailFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(config.thumbnail.width, config.thumbnail.height),
      quality: config.thumbnail.quality,
      fileType: 'image/webp',
      preserveExif: false,
      initialQuality: 1
    });

    variants.push({
      file: thumbnailFile,
      size: 'thumbnail',
      width: config.thumbnail.width,
      height: config.thumbnail.height,
      sizeBytes: thumbnailFile.size
    });

    // Generate medium variant
    const mediumFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(config.medium.width, config.medium.height),
      quality: config.medium.quality,
      fileType: 'image/webp',
      preserveExif: false,
      initialQuality: 1
    });

    variants.push({
      file: mediumFile,
      size: 'medium',
      width: config.medium.width,
      height: config.medium.height,
      sizeBytes: mediumFile.size
    });

    // Generate full variant
    const fullFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(config.full.width, config.full.height),
      quality: config.full.quality,
      fileType: 'image/webp',
      preserveExif: false,
      initialQuality: 1
    });

    variants.push({
      file: fullFile,
      size: 'full',
      width: config.full.width,
      height: config.full.height,
      sizeBytes: fullFile.size
    });

    const endTime = performance.now();
    const optimizationTimeMs = Math.round(endTime - startTime);
    
    const totalOptimizedSize = variants.reduce((sum, variant) => sum + variant.sizeBytes, 0);
    const totalSavings = originalSizeBytes - totalOptimizedSize;

    return {
      original: {
        file,
        sizeBytes: originalSizeBytes
      },
      variants,
      optimizationTimeMs,
      totalSavings
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error(`Image optimization failed: ${error.message}`);
  }
}

/**
 * Generates a filename for an optimized image variant
 * @param originalFilename Original filename
 * @param variant Size variant
 * @param propertyId Property ID for unique naming
 * @param index Image index for multiple images
 * @returns Optimized filename
 */
export function generateOptimizedFilename(
  originalFilename: string,
  variant: 'thumbnail' | 'medium' | 'full',
  propertyId: string,
  index: number = 0
): string {
  const extension = '.webp';
  const baseName = originalFilename.split('.')[0];
  return `property_${propertyId}_image_${index}_${variant}${extension}`;
}

/**
 * Generates storage paths for Supabase storage
 * @param propertyId Property ID
 * @param filename Filename
 * @returns Storage path
 */
export function generateStoragePath(propertyId: string, filename: string): string {
  return `properties/${propertyId}/images/${filename}`;
}

/**
 * Validates image file before processing
 * @param file File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be JPEG, PNG, or WebP format'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB'
    };
  }

  return { valid: true };
}

/**
 * Formats file size in human readable format
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculates compression percentage
 * @param originalSize Original file size in bytes
 * @param compressedSize Compressed file size in bytes
 * @returns Compression percentage
 */
export function calculateCompressionPercentage(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}