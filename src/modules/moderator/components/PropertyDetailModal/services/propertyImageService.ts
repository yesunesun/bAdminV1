// src/modules/moderator/components/PropertyDetailModal/services/propertyImageService.ts
// Version: 3.0.0
// Last Modified: 17-07-2025 12:30 IST
// Purpose: Service for managing property images with permanent deletion from storage and database

import { supabase } from '@/lib/supabase';

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary?: boolean;
  display_order?: number;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export const propertyImageService = {
  /**
   * Permanently delete an image from both properties_v2 table and Supabase Storage
   * Updates the property_details.imageFiles array and removes the actual file
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      console.log(`[PropertyImageService] Attempting to permanently delete image: ${imageId}`);
      
      // First, find the property that contains this image
      const { data: properties, error: fetchError } = await supabase
        .from('properties_v2')
        .select('id, property_details')
        .not('property_details', 'is', null);
      
      if (fetchError) {
        console.error('[PropertyImageService] Error fetching properties:', fetchError);
        return false;
      }
      
      // Find the property containing this image and get image details
      let targetProperty = null;
      let imageToDelete = null;
      
      for (const property of properties || []) {
        const imageFiles = property.property_details?.imageFiles || [];
        const foundImage = imageFiles.find((img: any) => img.id === imageId);
        if (foundImage) {
          targetProperty = property;
          imageToDelete = foundImage;
          break;
        }
      }
      
      if (!targetProperty || !imageToDelete) {
        console.log('[PropertyImageService] Image not found in any property');
        return false;
      }
      
      console.log(`[PropertyImageService] Found image to delete:`, imageToDelete);
      
      // Step 1: Delete from Supabase Storage
      let storageDeleted = false;
      if (imageToDelete.fileName) {
        try {
          // Extract the storage path from the filename
          const storagePath = `${targetProperty.id}/${imageToDelete.fileName}`;
          console.log(`[PropertyImageService] Deleting from storage: ${storagePath}`);
          
          const { error: storageError } = await supabase.storage
            .from('property-images-v2')
            .remove([storagePath]);
          
          if (storageError) {
            console.error('[PropertyImageService] Storage deletion error:', storageError);
            // Continue with database deletion even if storage deletion fails
          } else {
            console.log('[PropertyImageService] Successfully deleted from storage');
            storageDeleted = true;
          }
        } catch (storageErr) {
          console.error('[PropertyImageService] Storage deletion failed:', storageErr);
          // Continue with database deletion even if storage deletion fails
        }
      }
      
      // Step 2: Remove from database (always attempt this)
      const currentImageFiles = targetProperty.property_details?.imageFiles || [];
      const updatedImageFiles = currentImageFiles.filter((img: any) => img.id !== imageId);
      
      // Update the property with the new imageFiles array
      const updatedPropertyDetails = {
        ...targetProperty.property_details,
        imageFiles: updatedImageFiles
      };
      
      const { error: updateError } = await supabase
        .from('properties_v2')
        .update({
          property_details: updatedPropertyDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetProperty.id);
      
      if (updateError) {
        console.error('[PropertyImageService] Error updating property:', updateError);
        return false;
      }
      
      console.log('[PropertyImageService] Successfully removed image from database');
      
      // Report success if database deletion worked, regardless of storage deletion
      if (storageDeleted) {
        console.log('[PropertyImageService] Image permanently deleted from both database and storage');
      } else {
        console.log('[PropertyImageService] Image removed from database (storage deletion may have failed)');
      }
      
      return true;
    } catch (err) {
      console.error('[PropertyImageService] Error in permanent deletion:', err);
      return false;
    }
  },
  
  /**
   * Get all images for a property from properties_v2 table
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      console.log(`[PropertyImageService] Fetching images for property: ${propertyId}`);
      
      const { data: property, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('[PropertyImageService] Error fetching property:', error);
        return [];
      }
      
      const imageFiles = property?.property_details?.imageFiles || [];
      
      // Transform the imageFiles array to match the PropertyImage interface
      const images: PropertyImage[] = imageFiles.map((img: any, index: number) => ({
        id: img.id,
        property_id: propertyId,
        url: img.url,
        is_primary: img.isPrimary || false,
        display_order: img.displayOrder !== undefined ? img.displayOrder : index,
        fileName: img.fileName,
        fileSize: img.fileSize,
        uploadedAt: img.uploadedAt
      }));
      
      // Sort by display order
      images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      
      console.log(`[PropertyImageService] Found ${images.length} images`);
      return images;
    } catch (err) {
      console.error('[PropertyImageService] Failed to fetch images:', err);
      return [];
    }
  }
};