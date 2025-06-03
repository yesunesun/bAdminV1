// src/modules/seeker/components/PropertyDetails/PricingDetailsSection.tsx
// Version: 1.1.0
// Last Modified: 03-06-2025 15:00 IST
// Purpose: Reusable component for displaying sale/rental pricing details
// Fixed: Price Negotiation field now renders as Yes/No instead of currency

import React from 'react';
import { Card } from '@/components/ui/card';
import { formatIndianRupees, renderFieldValue, formatBoolean } from './utils/dataFormatters';

interface PricingDetailsSectionProps {
  listingType: string;
  pricingDetails: any;
  title?: string;
}

/**
 * PricingDetailsSection Component
 * Displays sale or rental pricing details with formatted currency values
 */
const PricingDetailsSection: React.FC<PricingDetailsSectionProps> = ({ 
  listingType, 
  pricingDetails, 
  title 
}) => {
  if (!pricingDetails) return null;

  const isSaleProperty = listingType.toLowerCase() === 'sale';
  const sectionTitle = title || (isSaleProperty ? 'Sale Details' : 'Rental Details');

  // Format the main price display
  const mainPrice = isSaleProperty
    ? pricingDetails.expectedPrice || pricingDetails.price
    : pricingDetails.rentAmount || pricingDetails.monthlyRent;

  // Fields to exclude from additional details (the main price fields)
  const excludedFields = isSaleProperty 
    ? ['expectedPrice', 'price']
    : ['rentAmount', 'monthlyRent'];

  // Get additional pricing details
  const additionalDetails = Object.entries(pricingDetails)
    .filter(([key]) => !excludedFields.includes(key));

  // Helper function to format field values with special handling for negotiable fields
  const formatFieldValue = (value: any, fieldKey: string): string => {
    const key = fieldKey.toLowerCase();
    
    // Special handling for negotiable fields - these should be Yes/No, not currency
    if (key.includes('negotiable')) {
      return formatBoolean(value);
    }
    
    // For all other fields, use the standard renderFieldValue function
    return renderFieldValue(value, fieldKey);
  };

  // Helper function to format field labels
  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim();
  };

  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>

      {/* Main price display */}
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-500">
          {isSaleProperty ? 'Expected Price' : 'Monthly Rent'}
        </span>
        <div className="text-2xl font-bold text-primary">
          {formatIndianRupees(mainPrice)}
          {!isSaleProperty && <span className="text-gray-500 text-base ml-1">/month</span>}
        </div>
      </div>

      {/* Additional pricing details */}
      {additionalDetails.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {additionalDetails.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {formatFieldLabel(key)}
              </span>
              <span className="text-gray-900">
                {formatFieldValue(value, key)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PricingDetailsSection;