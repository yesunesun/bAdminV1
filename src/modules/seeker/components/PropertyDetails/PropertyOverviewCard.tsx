// src/modules/seeker/components/PropertyDetails/PropertyOverviewCard.tsx
// Version: 1.2.0
// Last Modified: 08-04-2025 17:10 IST
// Purpose: Redesign to match the provided mockup with clear section layout

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BedDouble, Bath, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyOverviewCardProps {
  price: number;
  listingType?: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
  price,
  listingType,
  bedrooms,
  bathrooms,
  squareFeet
}) => {
  // Format price with Indian notation (₹)
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">
              {formatPrice(price)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </p>
          </div>
          
          <div className="flex space-x-8">
            <div className="flex flex-col items-center">
              <BedDouble className="h-6 w-6 text-primary mb-1" />
              <span className="font-medium">{bedrooms}</span>
              <span className="text-xs text-muted-foreground">Beds</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Bath className="h-6 w-6 text-primary mb-1" />
              <span className="font-medium">{bathrooms}</span>
              <span className="text-xs text-muted-foreground">Baths</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Square className="h-6 w-6 text-primary mb-1" />
              <span className="font-medium">{squareFeet}</span>
              <span className="text-xs text-muted-foreground">Sq.ft</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverviewCard;