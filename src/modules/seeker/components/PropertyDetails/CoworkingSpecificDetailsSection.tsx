// src/modules/seeker/components/PropertyDetails/CoworkingSpecificDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 21:15 IST
// Purpose: Display specific coworking details like pricing, capacity, amenities, and operating hours

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CoworkingSpecificDetailsSectionProps {
  coworkingDetails?: any; // Accept any structure since the data can be nested in different ways
}

const CoworkingSpecificDetailsSection: React.FC<CoworkingSpecificDetailsSectionProps> = ({ coworkingDetails }) => {
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

  // Extract coworking-specific data
  const extractCoworkingData = () => {
    if (!coworkingDetails) return null;

    // Get coworking specific details from the dedicated step
    const coworkingSpecificDetails = coworkingDetails.com_cow_coworking_details || {};
    
    return {
      // Space Configuration
      coworkingSpaceType: coworkingSpecificDetails.coworkingSpaceType || '',
      totalCapacity: coworkingSpecificDetails.totalCapacity || '',
      availableCapacity: coworkingSpecificDetails.availableCapacity || '',
      seatingCapacity: coworkingSpecificDetails.seatingCapacity || '',
      officeSize: coworkingSpecificDetails.officeSize || '',
      
      // Pricing Structure
      basePrice: coworkingSpecificDetails.basePrice || '',
      pricingStructure: coworkingSpecificDetails.pricingStructure || '',
      leaseTerm: coworkingSpecificDetails.leaseTerm || '',
      securityDeposit: coworkingSpecificDetails.securityDeposit || '',
      
      // Booking & Operations
      bookingOption: coworkingSpecificDetails.bookingOption || '',
      openingTime: coworkingSpecificDetails.openingTime || '',
      closingTime: coworkingSpecificDetails.closingTime || '',
      operatingHours: coworkingSpecificDetails.operatingHours || '',
      operatingDays: coworkingSpecificDetails.operatingDays || [],
      
      // Technical & Services
      internetSpeed: coworkingSpecificDetails.internetSpeed || '',
      coworkingAmenities: coworkingSpecificDetails.coworkingAmenities || [],
      
      // Additional Information
      additionalInformation: coworkingSpecificDetails.additionalInformation || ''
    };
  };

  const data = extractCoworkingData();

  // If no coworking details are provided or extraction failed, show a message
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Coworking Details</h3>
          <p className="text-muted-foreground">No specific coworking details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format capacity
  const formatCapacity = (capacity: any): string => {
    if (!capacity) return '-';
    const num = Number(capacity);
    if (num === 1) return '1 Person';
    if (num > 1) return `${num} Persons`;
    return formatPropertyValue(capacity);
  };

  // Format area with unit
  const formatArea = (area: any, unit: string = 'sqft'): string => {
    if (!area) return '-';
    return `${area} ${unit || 'sqft'}`;
  };

  // Format operating days
  const formatOperatingDays = (days: string[]): string => {
    if (!days || !Array.isArray(days) || days.length === 0) {
      return 'Not specified';
    }
    
    // Check for consecutive weekdays pattern
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekend = ['Saturday', 'Sunday'];
    
    if (days.length === 5 && weekdays.every(day => days.includes(day))) {
      return 'Monday - Friday';
    }
    
    if (days.length === 7) {
      return 'All Days';
    }
    
    if (days.length === 2 && weekend.every(day => days.includes(day))) {
      return 'Saturday - Sunday';
    }
    
    return days.join(', ');
  };

  // Format amenities as a grid
  const renderAmenities = (amenities: string[]) => {
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
      return <span className="text-muted-foreground">No amenities listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm">{amenity}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header with pricing prominently displayed */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold">Coworking Details</h3>
          <div className="mt-2 md:mt-0">
            <span className="text-2xl font-bold text-primary">
              {formatIndianRupees(data.basePrice)}
            </span>
            {data.pricingStructure && (
              <span className="text-sm text-muted-foreground ml-1">
                /{data.pricingStructure.toLowerCase()}
              </span>
            )}
            {data.leaseTerm && (
              <span className="text-sm text-muted-foreground ml-1">
                ({data.leaseTerm})
              </span>
            )}
          </div>
        </div>
        
        {/* Space Configuration Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-800">Space Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Space Type</p>
              <p className="font-medium">{formatPropertyValue(data.coworkingSpaceType)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="font-medium">{formatCapacity(data.totalCapacity)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Available Capacity</p>
              <p className="font-medium">{formatCapacity(data.availableCapacity)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Seating Capacity</p>
              <p className="font-medium">{formatCapacity(data.seatingCapacity)}</p>
            </div>

            {data.officeSize && (
              <div>
                <p className="text-sm text-muted-foreground">Office Size</p>
                <p className="font-medium">{formatArea(data.officeSize)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Terms Section */}
        <div className="mb-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium mb-3 text-gray-800">Pricing & Terms</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pricing Structure</p>
              <p className="font-medium">{formatPropertyValue(data.pricingStructure)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Lease Term</p>
              <p className="font-medium">{formatPropertyValue(data.leaseTerm)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Security Deposit</p>
              <p className="font-medium">{formatIndianRupees(data.securityDeposit)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Booking Option</p>
              <p className="font-medium">{formatPropertyValue(data.bookingOption)}</p>
            </div>
          </div>
        </div>

        {/* Operating Hours Section */}
        <div className="mb-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium mb-3 text-gray-800">Operating Hours</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Hours</p>
              <p className="font-medium">{formatPropertyValue(data.operatingHours)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Operating Days</p>
              <p className="font-medium">{formatOperatingDays(data.operatingDays)}</p>
            </div>

            {data.openingTime && data.closingTime && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Opening Time</p>
                  <p className="font-medium">{formatPropertyValue(data.openingTime)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Closing Time</p>
                  <p className="font-medium">{formatPropertyValue(data.closingTime)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Technical Details Section */}
        {data.internetSpeed && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium mb-3 text-gray-800">Technical Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Internet Speed</p>
                <p className="font-medium">{formatPropertyValue(data.internetSpeed)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Amenities Section */}
        {data.coworkingAmenities && data.coworkingAmenities.length > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium mb-3 text-gray-800">Coworking Amenities</h4>
            {renderAmenities(data.coworkingAmenities)}
          </div>
        )}

        {/* Additional Information Section */}
        {data.additionalInformation && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium mb-3 text-gray-800">Additional Information</h4>
            <p className="text-gray-700 whitespace-pre-line">{data.additionalInformation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoworkingSpecificDetailsSection;