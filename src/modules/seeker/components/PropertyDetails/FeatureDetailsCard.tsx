// src/modules/seeker/components/PropertyDetails/FeatureDetailsCard.tsx
// Version: 1.0.0
// Last Modified: 09-05-2025 14:30 IST
// Purpose: Extracted feature details card component

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureDetailsCardProps {
  features: any;
}

const FeatureDetailsCard: React.FC<FeatureDetailsCardProps> = ({ features }) => {
  if (!features || Object.keys(features).length === 0) return null;
  
  const amenities = features.amenities || [];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
        <div className="grid grid-cols-2 gap-4">
          {features.parking && (
            <div>
              <p className="text-sm text-muted-foreground">Parking:</p>
              <p className="font-medium">{features.parking}</p>
            </div>
          )}
          
          {features.gatedSecurity !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Gated Security:</p>
              <p className="font-medium">
                {features.gatedSecurity === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.nonVegAllowed !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Non-Veg Allowed:</p>
              <p className="font-medium">
                {features.nonVegAllowed === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.petFriendly !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Pet Friendly:</p>
              <p className="font-medium">
                {features.petFriendly === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.powerBackup && (
            <div>
              <p className="text-sm text-muted-foreground">Power Backup:</p>
              <p className="font-medium">{features.powerBackup}</p>
            </div>
          )}
          
          {features.waterSupply && (
            <div>
              <p className="text-sm text-muted-foreground">Water Supply:</p>
              <p className="font-medium">{features.waterSupply}</p>
            </div>
          )}
          
          {amenities.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Amenities:</p>
              <p className="font-medium">{amenities.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureDetailsCard;