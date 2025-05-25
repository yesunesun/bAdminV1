// src/modules/seeker/components/PropertyDetails/FlatmatesDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 20:45 IST
// Purpose: Display Flatmates specific details in property details page

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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

  // Format currency in Indian Rupees
  const formatIndianRupees = (amount: number | string): string => {
    const numValue = typeof amount === 'number' ? amount : Number(parseFloat(amount));
    
    if (isNaN(numValue)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numValue);
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
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Flatmates Details</h3>
          <p className="text-muted-foreground">No flatmates details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format room size with unit
  const formatRoomSize = (size: any): string => {
    if (!size) return '-';
    return `${size} sqft`;
  };

  // Format room capacity
  const formatRoomCapacity = (capacity: any): string => {
    if (!capacity) return '-';
    const num = Number(capacity);
    if (num === 1) return '1 Person';
    if (num > 1) return `${num} Persons`;
    return formatPropertyValue(capacity);
  };

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

  // Format room features as a grid
  const renderRoomFeatures = (features: any[]) => {
    if (!features || !Array.isArray(features) || features.length === 0) {
      return <span className="text-muted-foreground">No features listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header with title and rent */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold">Flatmates Details</h3>
          <div className="mt-2 md:mt-0">
            <span className="text-2xl font-bold text-primary">
              {formatIndianRupees(data.expectedRent)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">/month</span>
            {data.isNegotiable && (
              <span className="text-sm text-muted-foreground ml-2">(Negotiable)</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Room Type</p>
            <p className="font-medium">{formatPropertyValue(data.roomType)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Room Capacity</p>
            <p className="font-medium">{formatRoomCapacity(data.roomCapacity)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Room Size</p>
            <p className="font-medium">{formatRoomSize(data.roomSize)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Bathroom Type</p>
            <p className="font-medium">{formatPropertyValue(data.bathroomType)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Meal Option</p>
            <p className="font-medium">{formatPropertyValue(data.mealOption)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Security Deposit</p>
            <p className="font-medium">{formatIndianRupees(data.expectedDeposit)}</p>
          </div>

          {data.preferredGender && (
            <div>
              <p className="text-sm text-muted-foreground">Preferred Gender</p>
              <p className="font-medium">{formatPropertyValue(data.preferredGender)}</p>
            </div>
          )}

          {data.tenantType && (
            <div>
              <p className="text-sm text-muted-foreground">Tenant Type</p>
              <p className="font-medium">{formatPropertyValue(data.tenantType)}</p>
            </div>
          )}

          {data.ageRange && (
            <div>
              <p className="text-sm text-muted-foreground">Age Range</p>
              <p className="font-medium">{formatPropertyValue(data.ageRange)}</p>
            </div>
          )}

          {data.occupation && (
            <div>
              <p className="text-sm text-muted-foreground">Preferred Occupation</p>
              <p className="font-medium">{formatPropertyValue(data.occupation)}</p>
            </div>
          )}

          {data.availableFrom && (
            <div>
              <p className="text-sm text-muted-foreground">Available From</p>
              <p className="font-medium">{formatDate(data.availableFrom)}</p>
            </div>
          )}
        </div>

        {/* Room Features Section */}
        {data.roomFeatures && data.roomFeatures.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-2">Room Features & Amenities</p>
            {renderRoomFeatures(data.roomFeatures)}
          </div>
        )}

        {/* Description Section */}
        {data.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="whitespace-pre-line">{data.description}</p>
          </div>
        )}
        
        {/* Preferences Section */}
        {data.preferences && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Flatmate Preferences</p>
            <p className="whitespace-pre-line">{data.preferences}</p>
          </div>
        )}

        {/* Rules Section */}
        {data.rules && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">House Rules</p>
            <p className="whitespace-pre-line">{data.rules}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlatmatesDetailsSection;