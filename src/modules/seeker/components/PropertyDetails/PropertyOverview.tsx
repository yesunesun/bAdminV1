// src/modules/seeker/components/PropertyDetails/PropertyOverview.tsx
// Version: 1.0.0
// Last Modified: 09-05-2025 14:30 IST
// Purpose: Extracted property overview component

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, safeParseInt } from './utils/propertyDataUtils';

interface PropertyOverviewProps {
  propertyData: any;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ 
  propertyData, 
  listingType, 
  bedrooms, 
  bathrooms, 
  squareFeet 
}) => {
  const isSaleProperty = listingType === 'sale';
  const priceNegotiable = isSaleProperty 
    ? propertyData.saleInfo?.priceNegotiable 
    : propertyData.rentalInfo?.rentNegotiable;
  
  const price = isSaleProperty 
    ? safeParseInt(propertyData.saleInfo?.expectedPrice || 0) 
    : safeParseInt(propertyData.rentalInfo?.rentAmount || 0);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">
              {isSaleProperty ? 'Sale Price' : 'Monthly Rent'}
            </h3>
            <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
            {priceNegotiable && (
              <p className="text-sm text-green-600 mt-1">
                {isSaleProperty ? 'Price Negotiable' : 'Rent Negotiable'}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
              <span className="text-xl font-semibold">{bedrooms}</span>
              <span className="text-sm text-muted-foreground">Beds</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
              <span className="text-xl font-semibold">{bathrooms}</span>
              <span className="text-sm text-muted-foreground">Baths</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
              <span className="text-xl font-semibold">{squareFeet}</span>
              <span className="text-sm text-muted-foreground">Sq.ft</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverview;