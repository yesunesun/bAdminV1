// src/modules/seeker/components/PropertyDetails/SaleDetailsCard.tsx
// Version: 1.0.0
// Last Modified: 09-05-2025 14:30 IST
// Purpose: Extracted sale details card component

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from './utils/propertyDataUtils';

interface SaleDetailsCardProps {
  saleInfo: any;
}

const SaleDetailsCard: React.FC<SaleDetailsCardProps> = ({ saleInfo }) => {
  if (!saleInfo || Object.keys(saleInfo).length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sale Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {saleInfo.expectedPrice !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Expected Price:</p>
              <p className="font-medium">
                {formatCurrency(saleInfo.expectedPrice)}
              </p>
            </div>
          )}
          
          {saleInfo.maintenanceCost !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Maintenance Cost:</p>
              <p className="font-medium">
                {saleInfo.maintenanceCost
                  ? formatCurrency(saleInfo.maintenanceCost)
                  : '-'}
              </p>
            </div>
          )}
          
          {saleInfo.kitchenType && (
            <div>
              <p className="text-sm text-muted-foreground">Kitchen Type:</p>
              <p className="font-medium">{saleInfo.kitchenType}</p>
            </div>
          )}
          
          {saleInfo.possessionDate && (
            <div>
              <p className="text-sm text-muted-foreground">Available From:</p>
              <p className="font-medium">
                {formatDate(saleInfo.possessionDate)}
              </p>
            </div>
          )}
          
          {saleInfo.priceNegotiable !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Price Negotiable:</p>
              <p className="font-medium">
                {saleInfo.priceNegotiable === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleDetailsCard;