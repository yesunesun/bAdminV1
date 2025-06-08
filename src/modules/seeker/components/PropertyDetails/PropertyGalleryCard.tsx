// src/modules/seeker/components/PropertyDetails/PropertyGalleryCard.tsx
// Version: 4.4.0
// Last Modified: 14-05-2025 11:15 IST
// Purpose: Added support for direct blob URLs and removed debug information

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PropertyGallery from './PropertyGallery';
import { PropertyImage } from '../../hooks/usePropertyDetails';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface PropertyGalleryCardProps {
  images: PropertyImage[];
  propertyId?: string;
  directUrls?: string[];
}

const PropertyGalleryCard: React.FC<PropertyGalleryCardProps> = ({ 
  images: propImages, 
  propertyId: propId,
  directUrls
}) => {
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
          console.error('Error fetching property:', error);
          return;
        }
        
        // Extract image files from property_details
        const details = data.property_details || {};
        
        if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {          
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
          setProcessedImages(propImages);
          return;
        }
      } catch (err) {
        console.error('Error processing property details:', err);
      }
    };
    
    fetchPropertyDetails();
  }, [propertyId, propImages]);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <PropertyGallery 
          images={processedImages} 
          propertyId={propertyId} 
          directUrls={directUrls}
        />
      </CardContent>
    </Card>
  );
};

export default PropertyGalleryCard;