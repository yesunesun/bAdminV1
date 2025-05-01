// src/modules/seeker/components/PropertyDetails/BasicDetailsSection.tsx
// Version: 1.4.0
// Last Modified: 02-05-2025 00:00 IST
// Purpose: Removed all debug information and code

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BasicDetailsSectionProps {
  basicDetails?: {
    propertyType?: string;
    bhkType?: string;
    bathrooms?: string | number;
    balconies?: string | number;
    floor?: string | number;
    totalFloors?: string | number;
    builtUpArea?: string | number;
    builtUpAreaUnit?: string;
    facing?: string;
    propertyAge?: string;
    possessionDate?: string;
  };
}

const BasicDetailsSection: React.FC<BasicDetailsSectionProps> = ({ basicDetails }) => {
  // Format date values (DD-MM-YYYY)
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format a property value safely with fallback
  const formatPropertyValue = (value: any, defaultValue: string = '-'): string => {
    if (value === null || value === undefined) return defaultValue;
    if (value === '') return defaultValue;
    if (value === 0 && defaultValue !== '0') return defaultValue;
    return String(value);
  };

  // If no basic details are provided, show a message
  if (!basicDetails) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
          <p className="text-muted-foreground">No basic details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Property Type:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.propertyType, 'Residential')}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">BHK Type:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.bhkType)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Bathrooms:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.bathrooms)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Balconies:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.balconies)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Floor:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.floor)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total Floors:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.totalFloors)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Built-up Area:</p>
            <p className="font-medium">
              {basicDetails.builtUpArea 
                ? `${basicDetails.builtUpArea} ${basicDetails.builtUpAreaUnit || 'sqft'}` 
                : '-'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Facing:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.facing)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Property Age:</p>
            <p className="font-medium">{formatPropertyValue(basicDetails.propertyAge)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Possession Date:</p>
            <p className="font-medium">
              {basicDetails.possessionDate 
                ? formatDate(basicDetails.possessionDate) 
                : 'Not specified'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicDetailsSection;