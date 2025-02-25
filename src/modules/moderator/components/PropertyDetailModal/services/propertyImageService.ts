// src/modules/moderator/components/PropertyDetailModal/services/propertyImageService.ts
// Version: 2.0.0
// Last Modified: 26-02-2025 13:00 IST
// Purpose: Service for managing property images (simplified for client-side deletion)

import { supabase } from '@/lib/supabase';

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary?: boolean;
  display_order?: number;
}

export const propertyImageService = {
  /**
   * Attempt to delete an image - may fail due to permissions but that's okay
   * as we're handling deletion client-side
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      console.log(`[PropertyImageService] Attempting to delete image: ${imageId}`);
      
      // Try server-side deletion (will likely fail)
      const { error: deleteError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);
      
      if (deleteError) {
        console.log('[PropertyImageService] Server-side deletion failed (expected):', deleteError);
        return false;
      }
      
      console.log('[PropertyImageService] Server-side deletion succeeded (unexpected)');
      return true;
    } catch (err) {
      console.error('[PropertyImageService] Error in deletion attempt:', err);
      return false;
    }
  },
  
  /**
   * Get all images for a property
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      console.log(`[PropertyImageService] Fetching images for property: ${propertyId}`);
      
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('[PropertyImageService] Error fetching images:', error);
        return [];
      }
      
      console.log(`[PropertyImageService] Found ${data?.length || 0} images`);
      return data || [];
    } catch (err) {
      console.error('[PropertyImageService] Failed to fetch images:', err);
      return [];
    }
  }
};