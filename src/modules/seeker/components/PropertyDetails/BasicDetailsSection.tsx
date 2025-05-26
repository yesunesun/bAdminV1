// src/modules/seeker/components/PropertyDetails/BasicDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 16:40 IST
// Purpose: Reusable component for displaying property basic details

import React from 'react';
import { Card } from '@/components/ui/card';
import { formatIndianRupees, renderFieldValue } from './utils/dataFormatters';

interface BasicDetailsSectionProps {
  basicDetails: any;
  price: number | string;
  listingType: string;
}

/**
 * BasicDetailsSection Component
 * Displays property basic details including price, property type, bedrooms, etc.
 */
const BasicDetailsSection: React.FC<BasicDetailsSectionProps> = ({ 
  basicDetails, 
  price, 
  listingType 
}) => {
  if (!basicDetails) return null;

  const isSaleProperty = listingType.toLowerCase() === 'sale';

  // Get property type, bedrooms, bathrooms, and area
  const propertyType = basicDetails?.propertyType || '';

  // Extract bedrooms from bhkType
  let bedrooms = 0;
  if (basicDetails?.bhkType) {
    const match = basicDetails.bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = parseInt(match[1], 10);
    }
  }

  const bathrooms = basicDetails?.bathrooms || 0;
  const builtUpArea = basicDetails?.builtUpArea || 0;
  const builtUpAreaUnit = basicDetails?.builtUpAreaUnit || 'sqft';

  // Fields to exclude from additional details display
  const excludedFields = [
    'propertyType', 
    'bhkType', 
    'bathrooms', 
    'builtUpArea', 
    'builtUpAreaUnit',
    'description'
  ];

  // Get additional basic details
  const additionalDetails = Object.entries(basicDetails)
    .filter(([key]) => !excludedFields.includes(key));

  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold">Basic Details</h2>
        <div className="mt-2 md:mt-0">
          <span className="text-2xl font-bold text-primary">
            {formatIndianRupees(price)}
          </span>
          {!isSaleProperty && <span className="text-gray-500 ml-1">/month</span>}
        </div>
      </div>

      {/* Main details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {propertyType && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Property Type</span>
            <span className="text-gray-900 capitalize">{propertyType}</span>
          </div>
        )}

        {bedrooms > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Bedrooms</span>
            <span className="text-gray-900">{bedrooms}</span>
          </div>
        )}

        {bathrooms > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Bathrooms</span>
            <span className="text-gray-900">{bathrooms}</span>
          </div>
        )}

        {builtUpArea > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Built-up Area</span>
            <span className="text-gray-900">{builtUpArea} {builtUpAreaUnit}</span>
          </div>
        )}
      </div>

      {/* Additional basic details */}
      {additionalDetails.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-4 border-t border-gray-200 pt-4">
          {additionalDetails.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-900">
                {renderFieldValue(value, key)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description if available */}
      {basicDetails.description && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <span className="text-sm font-medium text-gray-500">Description</span>
          <p className="text-gray-700 whitespace-pre-line mt-1">{basicDetails.description}</p>
        </div>
      )}
    </Card>
  );
};

export default BasicDetailsSection;