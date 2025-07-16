// src/utils/imageFormatDetection.ts
// Version: 1.0.0
// Last Modified: 2025-01-16
// Purpose: Image format detection and validation utilities

import { ImageFormat, ImageValidationResult } from '@/types/imageService.types';

/**
 * Detects image format from filename extension
 */
export function detectImageFormat(fileName: string): ImageFormat {
  if (!fileName) return 'unknown';
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    default:
      return 'unknown';
  }
}

/**
 * Validates if a filename represents a valid image
 */
export function validateImageFileName(fileName: string): ImageValidationResult {
  if (!fileName || typeof fileName !== 'string') {
    return {
      isValid: false,
      format: 'unknown',
      error: 'Invalid filename'
    };
  }

  const format = detectImageFormat(fileName);
  
  if (format === 'unknown') {
    return {
      isValid: false,
      format,
      error: 'Unsupported image format'
    };
  }

  return {
    isValid: true,
    format
  };
}

/**
 * Generates alternative filenames for fallback attempts
 */
export function generateFallbackFilenames(originalFileName: string): string[] {
  const baseName = originalFileName.split('.')[0];
  const formats: ImageFormat[] = ['jpg', 'jpeg', 'png', 'webp'];
  
  return formats.map(format => `${baseName}.${format}`);
}

/**
 * Checks if a filename indicates a legacy image
 */
export function isLegacyImageName(fileName: string): boolean {
  if (!fileName) return false;
  
  // Check for legacy prefixes but don't automatically reject
  return fileName.startsWith('legacy-') || 
         fileName.startsWith('img-') ||
         fileName.includes('_old') ||
         fileName.includes('-old');
}

/**
 * Checks if a filename indicates an optimization record
 */
export function isOptimizationImageName(fileName: string): boolean {
  if (!fileName) return false;
  
  // Must start with 'optimization_' prefix
  if (!fileName.startsWith('optimization_')) return false;
  
  // Must not be a UUID (property IDs are UUIDs)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(fileName)) return false;
  
  return true;
}

/**
 * Normalizes image filename for consistent processing
 */
export function normalizeImageFileName(fileName: string): string {
  if (!fileName) return '';
  
  // Remove any path components
  const cleanName = fileName.split('/').pop() || '';
  
  // Normalize extension to lowercase
  const parts = cleanName.split('.');
  if (parts.length > 1) {
    const extension = parts.pop()?.toLowerCase();
    return `${parts.join('.')}.${extension}`;
  }
  
  return cleanName;
}

/**
 * Extracts optimization ID from optimization filename
 */
export function extractOptimizationId(fileName: string): string | null {
  if (!isOptimizationImageName(fileName)) return null;
  
  return fileName.replace('optimization_', '');
}

/**
 * Generates possible image variants for a given filename
 */
export function generateImageVariants(fileName: string): Array<{
  fileName: string;
  format: ImageFormat;
  priority: number;
}> {
  const baseName = fileName.split('.')[0];
  const originalFormat = detectImageFormat(fileName);
  
  const variants = [
    // Original format has highest priority
    { fileName, format: originalFormat, priority: 1 },
    
    // WebP is preferred for new images
    { fileName: `${baseName}.webp`, format: 'webp' as ImageFormat, priority: 2 },
    
    // JPG is widely supported
    { fileName: `${baseName}.jpg`, format: 'jpg' as ImageFormat, priority: 3 },
    
    // PNG for transparency
    { fileName: `${baseName}.png`, format: 'png' as ImageFormat, priority: 4 },
    
    // JPEG alternative
    { fileName: `${baseName}.jpeg`, format: 'jpeg' as ImageFormat, priority: 5 }
  ];
  
  // Remove duplicates and sort by priority
  const uniqueVariants = variants.filter((variant, index, self) => 
    index === self.findIndex(v => v.fileName === variant.fileName)
  );
  
  return uniqueVariants.sort((a, b) => a.priority - b.priority);
}

/**
 * Checks if two image formats are compatible
 */
export function areFormatsCompatible(format1: ImageFormat, format2: ImageFormat): boolean {
  if (format1 === format2) return true;
  
  // JPG and JPEG are the same
  if ((format1 === 'jpg' && format2 === 'jpeg') || 
      (format1 === 'jpeg' && format2 === 'jpg')) {
    return true;
  }
  
  return false;
}

/**
 * Gets the preferred format for optimization
 */
export function getPreferredOptimizationFormat(originalFormat: ImageFormat): ImageFormat {
  // WebP is preferred for optimization
  if (originalFormat === 'png' && supportsTransparency(originalFormat)) {
    return 'webp'; // WebP supports transparency
  }
  
  return 'webp'; // Default to WebP for all other cases
}

/**
 * Checks if format supports transparency
 */
export function supportsTransparency(format: ImageFormat): boolean {
  return format === 'png' || format === 'webp';
}

/**
 * Gets MIME type for image format
 */
export function getMimeType(format: ImageFormat): string {
  switch (format) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Default fallback
  }
}

/**
 * Extracts format from MIME type
 */
export function formatFromMimeType(mimeType: string): ImageFormat {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'unknown';
  }
}

/**
 * Validates image file size
 */
export function validateImageSize(sizeInBytes: number): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (sizeInBytes > maxSize) {
    return {
      isValid: false,
      error: `Image size (${Math.round(sizeInBytes / 1024 / 1024)}MB) exceeds maximum allowed size (50MB)`
    };
  }
  
  return { isValid: true };
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}