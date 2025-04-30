// src/modules/seeker/components/PropertyDetails/PropertyGalleryCard.tsx
// Version: 1.0.0
// Last Modified: 30-04-2025 11:00 IST
// Purpose: Wrapper for property gallery to handle image display

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PropertyGallery from './PropertyGallery';
import { PropertyImage } from '../../hooks/usePropertyDetails';

interface PropertyGalleryCardProps {
  images: PropertyImage[];
}

const PropertyGalleryCard: React.FC<PropertyGalleryCardProps> = ({ images }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <PropertyGallery images={images} />
      </CardContent>
    </Card>
  );
};

export default PropertyGalleryCard;