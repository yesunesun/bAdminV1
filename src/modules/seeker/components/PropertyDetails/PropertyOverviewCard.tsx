// src/modules/seeker/components/PropertyDetails/PropertyOverviewCard.tsx
// Version: 2.0.0
// Last Modified: 01-05-2025 17:15 IST
// Purpose: Fixed v2 property data extraction for overview card

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BedIcon, BathIcon, SquareIcon } from 'lucide-react';

interface PropertyOverviewCardProps {
  price: number;
  listingType?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
}

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
  price,
  listingType = 'rent',
  bedrooms = 0,
  bathrooms = 0,
  squareFeet = 0
}) => {
  // Output debug info for this component
  console.log('[PropertyOverviewCard] Received props:', {
    price, listingType, bedrooms, bathrooms, squareFeet,
    typeOfPrice: typeof price,
    typeOfBedrooms: typeof bedrooms,
    typeOfBathrooms: typeof bathrooms,
    typeOfSquareFeet: typeof squareFeet
  });
  
  // Format price with commas
  const formatPrice = (value: number) => {
    // Make sure we have a valid number
    const numValue = Number(value) || 0;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numValue);
  };
  
  // Determine if this is a rental or sale
  const isRental = listingType?.toLowerCase() === 'rent';
  
  // Ensure numeric values
  const numBedrooms = Number(bedrooms) || 0;
  const numBathrooms = Number(bathrooms) || 0;
  const numSquareFeet = Number(squareFeet) || 0;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
            {isRental && <span className="text-muted-foreground">/ month</span>}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                <BedIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{numBedrooms}</span>
              <span className="text-xs text-muted-foreground">Beds</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                <BathIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{numBathrooms}</span>
              <span className="text-xs text-muted-foreground">Baths</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                <SquareIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{numSquareFeet}</span>
              <span className="text-xs text-muted-foreground">Sq.ft</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverviewCard;