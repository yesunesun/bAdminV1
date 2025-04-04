// src/modules/seeker/hooks/usePropertyDetails.ts
// Version: 4.4.0
// Last Modified: 05-04-2025 20:00 IST
// Purpose: Fixed property data loading with URL parameter debugging

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyImage {
  id: string;
  url: string;
  is_primary?: boolean;
  display_order?: number;
}

export interface PropertyDetails {
  id: string;
  title: string;
  description: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  property_details: any;
  owner_id: string;
  property_images: PropertyImage[];
  ownerInfo: {
    id: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const usePropertyDetails = () => {
  const params = useParams();
  const location = useLocation();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  // Extract property ID from URL manually to ensure we're getting the right value
  const propertyId = params.id || location.pathname.split('/').pop();

  useEffect(() => {
    // Debug all possible parameter sources
    console.log('[DEBUG] URL Path:', location.pathname);
    console.log('[DEBUG] URL Params:', params);
    console.log('[DEBUG] Property ID extracted:', propertyId);
    
    if (!propertyId) {
      console.error('[usePropertyDetails] No property ID found in URL');
      setLoading(false);
      setError('No property ID found');
      return;
    }

    const fetchPropertyDetails = async () => {
      setLoading(true);
      
      try {
        console.log(`[usePropertyDetails] Fetching property with ID: ${propertyId}`);
        
        // Make a direct query to debug SQL results
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId);
        
        console.log('[usePropertyDetails] Raw query result:', data);
        
        if (fetchError) {
          console.error('[usePropertyDetails] Error fetching property:', fetchError);
          throw new Error(`Failed to load property: ${fetchError.message}`);
        }
        
        if (!data || data.length === 0) {
          console.error('[usePropertyDetails] Property not found');
          throw new Error('Property not found');
        }
        
        // Get the property data (first result)
        const propertyData = data[0];
        console.log('[usePropertyDetails] Property data found:', propertyData);
        
        // Fetch images in a separate query
        const { data: imagesData } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', propertyId);
        
        console.log('[usePropertyDetails] Images found:', imagesData?.length || 0);
        
        // Fetch owner info
        let ownerInfo = null;
        if (propertyData.owner_id) {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('id, email, phone')
            .eq('id', propertyData.owner_id)
            .maybeSingle();
            
          ownerInfo = ownerData;
        }
        
        // Check if the user has liked this property
        if (user) {
          const { data: likeData } = await supabase
            .from('property_likes')
            .select('id')
            .eq('property_id', propertyId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          setIsLiked(!!likeData);
        }
        
        // Create the final property object
        const completeProperty: PropertyDetails = {
          ...propertyData,
          property_images: imagesData || [],
          ownerInfo: ownerInfo
        };
        
        console.log('[usePropertyDetails] Final property object:', completeProperty);
        
        setProperty(completeProperty);
        setError(null);
        
      } catch (err) {
        console.error('[usePropertyDetails] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property details');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, user]);

  // Toggle property like function remains the same
  const toggleLike = async () => {
    if (!propertyId || !user) {
      return { success: false, message: 'You need to be logged in to save properties' };
    }
    
    try {
      if (isLiked) {
        await supabase
          .from('property_likes')
          .delete()
          .eq('property_id', propertyId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('property_likes')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
      }
      
      setIsLiked(!isLiked);
      return {
        success: true,
        message: isLiked ? 'Property removed from saved items' : 'Property saved successfully'
      };
    } catch (err) {
      console.error('[usePropertyDetails] Toggle like error:', err);
      return {
        success: false,
        message: 'Failed to update saved status. Please try again.'
      };
    }
  };

  return {
    property,
    loading,
    error,
    isLiked,
    toggleLike
  };
};