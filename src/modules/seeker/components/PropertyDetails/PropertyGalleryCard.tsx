// src/modules/seeker/components/PropertyDetails/PropertyGalleryCard.tsx
// Version: 4.0.0
// Last Modified: 09-05-2025 20:30 IST
// Purpose: Fixed syntax error in PropertyGalleryCard

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PropertyGallery from './PropertyGallery';
import { PropertyImage } from '../../hooks/usePropertyDetails';

interface PropertyGalleryCardProps {
  images: PropertyImage[];
}

const PropertyGalleryCard: React.FC<PropertyGalleryCardProps> = ({ images }) => {
  // Log received images for debugging
  console.log('[PropertyGalleryCard] Received images count:', images?.length || 0);
  
  if (images && images.length > 0) {
    const firstImage = images[0];
    console.log('[PropertyGalleryCard] First image has dataUrl:', !!firstImage.dataUrl);
    console.log('[PropertyGalleryCard] First image has url:', !!firstImage.url);
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <PropertyGallery images={images} />
      </CardContent>
    </Card>
  );
};

export default PropertyGalleryCard;