// src/modules/seeker/components/PropertyDetails/RentalDetailsCard.tsx
// Version: 1.0.0
// Last Modified: 09-05-2025 14:30 IST
// Purpose: Extracted rental details card component

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from './utils/propertyDataUtils';

interface RentalDetailsCardProps {
  rentalInfo: any;
}

const RentalDetailsCard: React.FC<RentalDetailsCardProps> = ({ rentalInfo }) => {
  if (!rentalInfo || Object.keys(rentalInfo).length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rental Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {rentalInfo.rentAmount !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent:</p>
              <p className="font-medium">
                {formatCurrency(rentalInfo.rentAmount)}
              </p>
            </div>
          )}
          
          {rentalInfo.securityDeposit !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Security Deposit:</p>
              <p className="font-medium">
                {formatCurrency(rentalInfo.securityDeposit)}
              </p>
            </div>
          )}
          
          {rentalInfo.maintenanceCharges !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Maintenance Charges:</p>
              <p className="font-medium">
                {rentalInfo.maintenanceCharges
                  ? formatCurrency(rentalInfo.maintenanceCharges)
                  : '-'}
              </p>
            </div>
          )}
          
          {rentalInfo.availableFrom && (
            <div>
              <p className="text-sm text-muted-foreground">Available From:</p>
              <p className="font-medium">
                {formatDate(rentalInfo.availableFrom)}
              </p>
            </div>
          )}
          
          {rentalInfo.furnishingStatus && (
            <div>
              <p className="text-sm text-muted-foreground">Furnishing Status:</p>
              <p className="font-medium">{rentalInfo.furnishingStatus}</p>
            </div>
          )}
          
          {rentalInfo.leaseDuration && (
            <div>
              <p className="text-sm text-muted-foreground">Lease Duration:</p>
              <p className="font-medium">{rentalInfo.leaseDuration}</p>
            </div>
          )}
          
          {rentalInfo.rentNegotiable !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Rent Negotiable:</p>
              <p className="font-medium">
                {rentalInfo.rentNegotiable === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {rentalInfo.preferredTenants && rentalInfo.preferredTenants.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Preferred Tenants:</p>
              <p className="font-medium">{rentalInfo.preferredTenants.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalDetailsCard;