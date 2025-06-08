// src/modules/seeker/components/PropertyDetails/FlatmatesDetailsSection.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 14:45 IST
// Purpose: Enhanced flatmates details with Phase 1 design system, Indian formatting, and responsive layout

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users,
  Bed,
  Bath,
  Square,
  IndianRupee,
  CheckCircle2,
  UserCheck,
  Calendar,
  Shield,
  Home,
  Settings,
  Coffee,
  Wifi,
  Car,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatIndianRupees, 
  renderFieldValue,
  formatFieldLabel,
  formatCapacity,
  formatBoolean,
  shouldDisplayValue,
  formatIndianDate
} from './utils/dataFormatters';

interface FlatmatesDetailsSectionProps {
  flatmatesDetails?: any; // Accept any structure since the data can be nested in different ways
}

const FlatmatesDetailsSection: React.FC<FlatmatesDetailsSectionProps> = ({ flatmatesDetails }) => {
  // Format a property value safely with fallback
  const formatPropertyValue = (value: any, defaultValue: string = '-'): string => {
    if (value === null || value === undefined) return defaultValue;
    if (value === '') return defaultValue;
    if (value === 0 && defaultValue !== '0') return defaultValue;
    return String(value);
  };

  // Extract data from potentially different locations in the property data
  const extractData = () => {
    if (!flatmatesDetails) return null;

    // Check for data in both the top level and in specific step objects
    const basicDetails = flatmatesDetails.res_flat_basic_details || {};
    const flatmateSpecificDetails = flatmatesDetails.res_flat_flatmate_details || {};
    
    // Get expected rent with fallbacks
    const expectedRent = 
      basicDetails.expectedRent || 
      flatmatesDetails.expectedRent || 
      basicDetails.rentAmount ||
      flatmatesDetails.rentAmount ||
      (flatmatesDetails.price ? flatmatesDetails.price.toString() : '0');
    
    // Get expected deposit with fallbacks
    const expectedDeposit = 
      basicDetails.expectedDeposit || 
      flatmatesDetails.expectedDeposit || 
      basicDetails.securityDeposit ||
      flatmatesDetails.securityDeposit ||
      '0';
    
    // Combine data from all potential locations, prioritizing the most specific
    return {
      // Rent and pricing
      expectedRent: expectedRent,
      expectedDeposit: expectedDeposit,
      isNegotiable: basicDetails.isNegotiable || flatmatesDetails.isNegotiable || false,
      
      // Room details
      roomType: basicDetails.roomType || flatmatesDetails.roomType || '',
      roomCapacity: basicDetails.roomCapacity || flatmatesDetails.roomCapacity || '',
      roomSize: basicDetails.roomSize || flatmatesDetails.roomSize || '',
      bathroomType: basicDetails.bathroomType || flatmatesDetails.bathroomType || '',
      
      // Flatmate-specific details
      mealOption: basicDetails.mealOption || flatmatesDetails.mealOption || flatmateSpecificDetails.mealOption || '',
      preferredGender: flatmateSpecificDetails.preferredGender || flatmatesDetails.preferredGender || '',
      tenantType: flatmateSpecificDetails.tenantType || flatmatesDetails.tenantType || '',
      ageRange: flatmateSpecificDetails.ageRange || flatmatesDetails.ageRange || '',
      occupation: flatmateSpecificDetails.occupation || flatmatesDetails.occupation || '',
      
      // Room features/amenities
      roomFeatures: basicDetails.roomFeatures || flatmatesDetails.roomFeatures || flatmateSpecificDetails.amenities || [],
      
      // Additional details
      description: basicDetails.description || flatmatesDetails.description || flatmateSpecificDetails.description || '',
      rules: flatmateSpecificDetails.rules || flatmatesDetails.rules || '',
      preferences: flatmateSpecificDetails.preferences || flatmatesDetails.preferences || '',
      availableFrom: flatmateSpecificDetails.availableFrom || flatmatesDetails.availableFrom || basicDetails.availableFrom || ''
    };
  };

  const data = extractData();

  // If no flatmates details are provided or extraction failed, show a message
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Flatmates Details</h3>
          <p className="text-muted-foreground">No flatmates details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format room size with unit
  const formatRoomSize = (size: any): string => {
    if (!size) return '-';
    const numSize = typeof size === 'number' ? size : Number(size);
    if (isNaN(numSize)) return `${size}`;
    const formatted = new Intl.NumberFormat('en-IN').format(numSize);
    return `${formatted} sqft`;
  };

  // Get icon for room feature type
  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('wifi') || featureLower.includes('internet')) return Wifi;
    if (featureLower.includes('parking') || featureLower.includes('car')) return Car;
    if (featureLower.includes('coffee') || featureLower.includes('tea') || featureLower.includes('kitchen')) return Coffee;
    if (featureLower.includes('bathroom') || featureLower.includes('bath')) return Bath;
    if (featureLower.includes('bed') || featureLower.includes('furniture')) return Bed;
    if (featureLower.includes('security') || featureLower.includes('guard')) return Shield;
    if (featureLower.includes('room') || featureLower.includes('space')) return Home;
    return CheckCircle2;
  };

  // Render room features as color-coded cards
  const renderRoomFeatures = (features: any[]) => {
    if (!features || !Array.isArray(features) || features.length === 0) {
      return <span className="text-muted-foreground">No features listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((feature, index) => {
          const IconComponent = getFeatureIcon(feature);
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
                "transition-all hover:-translate-y-1 hover:shadow-md"
              )}
            >
              <div className="p-1.5 rounded-full bg-green-500/10">
                <IconComponent className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-900">{feature}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Fields to exclude from additional details display
  const excludedFields = [
    'expectedRent', 'expectedDeposit', 'isNegotiable', 'roomType', 'roomCapacity',
    'roomSize', 'bathroomType', 'mealOption', 'preferredGender', 'tenantType',
    'ageRange', 'occupation', 'roomFeatures', 'description', 'rules', 'preferences',
    'availableFrom'
  ];

  // Get additional details
  const additionalDetails = Object.entries(data)
    .filter(([key, value]) => 
      !excludedFields.includes(key) && 
      shouldDisplayValue(value)
    );

  return (
    <Card className={cn("overflow-hidden shadow-sm border-border/50 transition-colors duration-200")}>
      <CardContent className="p-4 md:p-6">
        {/* Header Section with Pricing */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold">Flatmates Details</h2>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 rounded-xl border border-primary/20">
            <IndianRupee className="h-5 w-5 text-primary" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl md:text-2xl font-bold text-primary">
                {formatIndianRupees(data.expectedRent)}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>/month</span>
                {data.isNegotiable && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Negotiable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Room & Flatmate Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {data.roomType && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Room Type</span>
              <span className="font-semibold text-center text-sm mt-1 capitalize">
                {data.roomType}
              </span>
            </div>
          )}

          {data.roomCapacity && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Room Capacity</span>
              <span className="font-semibold text-sm mt-1">
                {formatCapacity(data.roomCapacity)}
              </span>
            </div>
          )}

          {data.roomSize && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-orange-500/10 mb-3">
                <Square className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Room Size</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatRoomSize(data.roomSize)}
              </span>
            </div>
          )}

          {data.bathroomType && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                <Bath className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bathroom Type</span>
              <span className="font-semibold text-center text-sm mt-1 capitalize">
                {data.bathroomType}
              </span>
            </div>
          )}
        </div>

        {/* Flatmate Preferences Grid */}
        {(data.preferredGender || data.tenantType || data.ageRange || data.occupation) && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Flatmate Preferences</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {data.preferredGender && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Preferred Gender</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground capitalize">{data.preferredGender}</span>
                  </div>
                </div>
              )}

              {data.tenantType && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Tenant Type</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground capitalize">{data.tenantType}</span>
                  </div>
                </div>
              )}

              {data.ageRange && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Age Range</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{data.ageRange}</span>
                  </div>
                </div>
              )}

              {data.occupation && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Preferred Occupation</span>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground capitalize">{data.occupation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Details Section */}
        {(data.mealOption || data.expectedDeposit || data.availableFrom || additionalDetails.length > 0) && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Additional Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {data.mealOption && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Meal Option</span>
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground capitalize">{data.mealOption}</span>
                  </div>
                </div>
              )}

              {data.expectedDeposit && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Security Deposit</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{formatIndianRupees(data.expectedDeposit)}</span>
                  </div>
                </div>
              )}

              {data.availableFrom && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Available From</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{formatIndianDate(data.availableFrom)}</span>
                  </div>
                </div>
              )}

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

        {/* Room Features Section */}
        {data.roomFeatures && data.roomFeatures.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Room Features & Amenities</h4>
            </div>
            {renderRoomFeatures(data.roomFeatures)}
          </div>
        )}

        {/* Description Section */}
        {data.description && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Description</h4>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                {data.description}
              </p>
            </div>
          </div>
        )}
        
        {/* Preferences Section */}
        {data.preferences && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Flatmate Preferences</h4>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                {data.preferences}
              </p>
            </div>
          </div>
        )}

        {/* Rules Section */}
        {data.rules && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">House Rules</h4>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <p className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                {data.rules}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlatmatesDetailsSection;