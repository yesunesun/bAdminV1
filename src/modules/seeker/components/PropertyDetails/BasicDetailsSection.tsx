// src/modules/seeker/components/PropertyDetails/BasicDetailsSection.tsx
// Version: 2.1.0
// Last Modified: 27-01-2025 12:05 IST
// Purpose: Working enhanced component with simplified imports and Indian formatting

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Bed, 
  Bath, 
  Square, 
  IndianRupee,
  Building,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatIndianRupees, 
  renderFieldValue,
  formatFieldLabel
} from './utils/dataFormatters';

interface BasicDetailsSectionProps {
  basicDetails: any;
  price: number | string;
  listingType: string;
}

/**
 * BasicDetailsSection Component
 * Displays property basic details with enhanced design system and Indian formatting
 */
const BasicDetailsSection: React.FC<BasicDetailsSectionProps> = ({ 
  basicDetails, 
  price, 
  listingType 
}) => {
  if (!basicDetails) return null;

  const isRentalProperty = listingType.toLowerCase() === 'rent';

  // Extract main property information
  const propertyType = basicDetails?.propertyType || '';
  const bhkType = basicDetails?.bhkType || '';
  const bathrooms = basicDetails?.bathrooms || 0;
  const builtUpArea = basicDetails?.builtUpArea || 0;
  const builtUpAreaUnit = basicDetails?.builtUpAreaUnit || 'sqft';
  const description = basicDetails?.description || '';

  // Extract bedrooms from bhkType
  let bedrooms = 0;
  if (bhkType) {
    const match = bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = parseInt(match[1], 10);
    }
  }

  // Format area with unit
  const formatArea = (area: any, unit: string = 'sqft'): string => {
    if (!area || area === 0) return '-';
    const numArea = typeof area === 'number' ? area : Number(area);
    if (isNaN(numArea)) return '-';
    const formatted = new Intl.NumberFormat('en-IN').format(numArea);
    return `${formatted} ${unit}`;
  };

  // Check if value should be displayed
  const shouldDisplayValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  };

  // Fields to exclude from additional details display
  const excludedFields = [
    'propertyType', 
    'bhkType', 
    'bathrooms', 
    'builtUpArea', 
    'builtUpAreaUnit',
    'description',
    'title'
  ];

  // Get additional basic details
  const additionalDetails = Object.entries(basicDetails)
    .filter(([key, value]) => 
      !excludedFields.includes(key) && 
      shouldDisplayValue(value)
    );

  return (
    <Card className={cn("overflow-hidden shadow-sm border-border/50 transition-colors duration-200")}>
      <CardContent className="p-4 md:p-6">
        {/* Header Section with Price */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold">Basic Details</h2>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 rounded-xl border border-primary/20">
            <IndianRupee className="h-5 w-5 text-primary" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl md:text-2xl font-bold text-primary">
                {formatIndianRupees(price)}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isRentalProperty && <span>/month</span>}
                {basicDetails?.isNegotiable && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Negotiable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Property Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {propertyType && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property Type</span>
              <span className="font-semibold text-center text-sm mt-1 capitalize">
                {propertyType}
              </span>
            </div>
          )}

          {bedrooms > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <Bed className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bedrooms</span>
              <span className="font-semibold text-sm mt-1">
                {bedrooms}
              </span>
            </div>
          )}

          {bathrooms > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                <Bath className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bathrooms</span>
              <span className="font-semibold text-sm mt-1">
                {bathrooms}
              </span>
            </div>
          )}

          {builtUpArea > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-orange-500/10 mb-3">
                <Square className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Built-up Area</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatArea(builtUpArea, builtUpAreaUnit)}
              </span>
            </div>
          )}
        </div>

        {/* Additional Details Section */}
        {additionalDetails.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Additional Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {additionalDetails.map(([key, value]) => (
                <div key={key} className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatFieldLabel(key)}
                  </span>
                  <span className="font-medium text-foreground">
                    {renderFieldValue(value, key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description Section */}
        {description && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Description</h4>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Summary for Mobile */}
        <div className="lg:hidden mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-center">
            {bedrooms > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{bedrooms}</span>
                <span className="text-xs text-muted-foreground">Beds</span>
              </div>
            )}
            {bathrooms > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{bathrooms}</span>
                <span className="text-xs text-muted-foreground">Baths</span>
              </div>
            )}
            {builtUpArea > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{builtUpArea}</span>
                <span className="text-xs text-muted-foreground">{builtUpAreaUnit}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicDetailsSection;