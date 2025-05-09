// src/modules/seeker/components/PropertyDetails/PropertyGalleryCard.tsx
// Version: 4.3.0
// Last Modified: 10-05-2025 16:00 IST
// Purpose: Added extraction of image files from property_details

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PropertyGallery from './PropertyGallery';
import { PropertyImage } from '../../hooks/usePropertyDetails';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface PropertyGalleryCardProps {
  images: PropertyImage[];
  propertyId?: string;
}

const PropertyGalleryCard: React.FC<PropertyGalleryCardProps> = ({ images: propImages, propertyId: propId }) => {
  // Get the property ID from URL params as backup
  const { id: urlParamId } = useParams();
  const location = useLocation();
  
  // Use property ID from props, or fall back to URL params, or extract from pathname
  const propertyId = propId || urlParamId || location.pathname.split('/').pop();
  
  const [processedImages, setProcessedImages] = useState<PropertyImage[]>(propImages || []);
  
  // Fetch property details directly to ensure we have the image file names
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;
      
      console.log('[PropertyGalleryCard] Fetching property details for ID:', propertyId);
      
      try {
        // Try properties_v2 table first
        let { data, error } = await supabase
          .from('properties_v2')
          .select('*')
          .eq('id', propertyId)
          .single();
          
        // If not found, try original properties table
        if (error || !data) {
          const result = await supabase
            .from('properties')
            .select('*')
            .eq('id', propertyId)
            .single();
            
          data = result.data;
          error = result.error;
        }
        
        if (error || !data) {
          console.error('[PropertyGalleryCard] Error fetching property:', error);
          return;
        }
        
        // Extract image files from property_details
        const details = data.property_details || {};
        
        if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
          console.log('[PropertyGalleryCard] Found imageFiles in property details:', details.imageFiles.length);
          
          // Convert to standard format with fileName
          const formattedImages = details.imageFiles.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            fileName: img.fileName,
            is_primary: !!img.isPrimary,
            isPrimary: !!img.isPrimary,
            display_order: idx
          }));
          
          setProcessedImages(formattedImages);
          return;
        }
        
        // If no imageFiles, check if we have the original propImages with dataUrl
        if (propImages && propImages.length > 0 && propImages[0].dataUrl) {
          console.log('[PropertyGalleryCard] Using original images with dataUrl');
          setProcessedImages(propImages);
          return;
        }
        
        console.log('[PropertyGalleryCard] No valid images found in property details');
      } catch (err) {
        console.error('[PropertyGalleryCard] Error processing property details:', err);
      }
    };
    
    fetchPropertyDetails();
  }, [propertyId, propImages]);
  
  // Log received images for debugging
  console.log('[PropertyGalleryCard] Property ID:', propertyId);
  console.log('[PropertyGalleryCard] Original images count:', propImages?.length || 0);
  console.log('[PropertyGalleryCard] Processed images count:', processedImages?.length || 0);
  
  if (processedImages && processedImages.length > 0) {
    const firstImage = processedImages[0];
    console.log('[PropertyGalleryCard] First processed image details:', {
      id: firstImage.id || 'none',
      url: firstImage.url ? 'exists' : 'none',
      dataUrl: firstImage.dataUrl ? 'exists' : 'none',
      fileName: firstImage.fileName || 'none',
      is_primary: !!firstImage.is_primary,
      isPrimary: !!firstImage.isPrimary
    });
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <PropertyGallery images={processedImages} propertyId={propertyId} />
      </CardContent>
    </Card>
  );
};

export default PropertyGalleryCard;