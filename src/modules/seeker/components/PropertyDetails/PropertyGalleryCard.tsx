// src/modules/seeker/components/PropertyDetails/PropertyGalleryCard.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 15:17 IST
// Purpose: Gallery card component wrapper

import React from 'react';
import { Card } from '@/components/ui/card';
import PropertyGallery from './PropertyGallery';

interface PropertyGalleryCardProps {
  images: Array<{ id: string; url: string; is_primary?: boolean }>;
}

const PropertyGalleryCard: React.FC<PropertyGalleryCardProps> = ({ images }) => {
  return (
    <Card className="overflow-hidden border-border/40 shadow-md">
      <PropertyGallery images={images} />
    </Card>
  );
};

export default PropertyGalleryCard;