// src/modules/admin/pages/PropertyMapView/services/propertyMapService.ts
// Version: 1.0.0
// Last Modified: 01-03-2025 11:30 IST
// Purpose: Service for fetching and processing property map data

import { supabase } from '@/lib/supabase';
import { Property } from '@/modules/owner/components/property/PropertyFormTypes';

export interface PropertyWithImages extends Property {
  images: {
    id: string;
    url: string;
    type: string;
  }[];
}

export const fetchPublishedProperties = async (): Promise<{
  data: PropertyWithImages[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('status', 'published');

    if (error) throw error;
    
    console.log(`Found ${data?.length || 0} published properties`);
    
    // Format the properties data
    const formattedProperties = (data || []).map(property => {
      // Process images
      const images = property.property_images
        ? property.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            type: img.is_primary ? 'primary' : 'additional',
          }))
        : [];
      
      return {
        ...property,
        images
      };
    });
    
    return { data: formattedProperties, error: null };
  } catch (err) {
    console.error('Error fetching properties:', err);
    return { data: null, error: err as Error };
  }
};

// Helper function to get property coordinates
export const getPropertyPosition = (property: Property, defaultCenter: {lat: number, lng: number}) => {
  // Use property's coordinates if available
  if (property.property_details?.latitude && property.property_details?.longitude) {
    return {
      lat: property.property_details.latitude,
      lng: property.property_details.longitude
    };
  }
  
  // Default to a position near the center with a slight offset
  return {
    lat: defaultCenter.lat + (Math.random() * 0.1 - 0.05),
    lng: defaultCenter.lng + (Math.random() * 0.1 - 0.05)
  };
};