// src/modules/seeker/components/PropertyDetails/CoworkingDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 21:00 IST
// Purpose: Display Commercial Coworking specific details in property details page

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CoworkingDetailsSectionProps {
  coworkingDetails?: any; // Accept any structure since the data can be nested in different ways
}

const CoworkingDetailsSection: React.FC<CoworkingDetailsSectionProps> = ({ coworkingDetails }) => {
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
    if (!coworkingDetails) return null;

    // Check for data in both the top level and in specific step objects
    const basicDetails = coworkingDetails.com_cow_basic_details || {};
    const coworkingSpecificDetails = coworkingDetails.com_cow_coworking_details || {};
    
    // Get pricing information with fallbacks - basePrice is in coworking_details section
    const price = 
      coworkingSpecificDetails.basePrice ||
      basicDetails.expectedPrice || 
      basicDetails.rentAmount ||
      basicDetails.monthlyRent ||
      coworkingDetails.expectedPrice || 
      coworkingDetails.rentAmount ||
      coworkingDetails.monthlyRent ||
      coworkingSpecificDetails.expectedPrice ||
      coworkingSpecificDetails.rentAmount ||
      (coworkingDetails.price ? coworkingDetails.price.toString() : '0');
    
    // Determine if this is a sale or rental listing - coworking is typically rental
    const isSale = !!(basicDetails.expectedPrice || 
                     coworkingDetails.expectedPrice || 
                     coworkingSpecificDetails.expectedPrice ||
                     (basicDetails.listingType && basicDetails.listingType.toLowerCase() === 'sale'));
    
    // Combine data from all potential locations, prioritizing the most specific
    return {
      // Basic Information
      title: basicDetails.title || coworkingDetails.title || '',
      propertyType: basicDetails.propertyType || coworkingDetails.propertyType || '',
      
      // Physical Details
      builtUpArea: basicDetails.builtUpArea || coworkingDetails.builtUpArea || '',
      builtUpAreaUnit: basicDetails.builtUpAreaUnit || coworkingDetails.builtUpAreaUnit || 'sqft',
      propertyAge: basicDetails.propertyAge || coworkingDetails.propertyAge || '',
      floor: basicDetails.floor || coworkingDetails.floor || '',
      totalFloors: basicDetails.totalFloors || coworkingDetails.totalFloors || '',
      facing: basicDetails.facing || coworkingDetails.facing || '',
      
      // Pricing
      price: price,
      isSale: isSale,
      isNegotiable: basicDetails.isNegotiable || coworkingDetails.isNegotiable || false,
      securityDeposit: basicDetails.securityDeposit || coworkingDetails.securityDeposit || coworkingSpecificDetails.securityDeposit || '',
      
      // Coworking Specific Details
      workspaceType: coworkingSpecificDetails.workspaceType || coworkingDetails.workspaceType || '',
      capacity: coworkingSpecificDetails.capacity || coworkingDetails.capacity || '',
      seatingArrangement: coworkingSpecificDetails.seatingArrangement || coworkingDetails.seatingArrangement || '',
      meetingRooms: coworkingSpecificDetails.meetingRooms || coworkingDetails.meetingRooms || '',
      cabins: coworkingSpecificDetails.cabins || coworkingDetails.cabins || '',
      
      // Amenities and Services
      amenities: coworkingSpecificDetails.amenities || coworkingDetails.amenities || [],
      services: coworkingSpecificDetails.services || coworkingDetails.services || [],
      
      // Timing and Access
      operatingHours: coworkingSpecificDetails.operatingHours || coworkingDetails.operatingHours || '',
      accessType: coworkingSpecificDetails.accessType || coworkingDetails.accessType || '',
      
      // Additional Details
      description: basicDetails.description || coworkingDetails.description || coworkingSpecificDetails.description || '',
      rules: coworkingSpecificDetails.rules || coworkingDetails.rules || '',
      internetSpeed: coworkingSpecificDetails.internetSpeed || coworkingDetails.internetSpeed || '',
      parkingAvailable: coworkingSpecificDetails.parkingAvailable || coworkingDetails.parkingAvailable || false
    };
  };

  const data = extractData();

  // If no coworking details are provided or extraction failed, show a message
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Coworking Space Details</h3>
          <p className="text-muted-foreground">No coworking space details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format area with unit
  const formatArea = (area: any, unit: string = 'sqft'): string => {
    if (!area) return '-';
    return `${area} ${unit || 'sqft'}`;
  };

  // Format capacity
  const formatCapacity = (capacity: any): string => {
    if (!capacity) return '-';
    const num = Number(capacity);
    if (num === 1) return '1 Person';
    if (num > 1) return `${num} Persons`;
    return formatPropertyValue(capacity);
  };

  // Format boolean values
  const formatBoolean = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === 'yes') return 'Yes';
      if (lower === 'false' || lower === 'no') return 'No';
    }
    return formatPropertyValue(value);
  };

  // Format amenities as a grid
  const renderAmenities = (amenities: any[]) => {
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

  // Format services as a grid
  const renderServices = (services: any[]) => {
    if (!services || !Array.isArray(services) || services.length === 0) {
      return <span className="text-muted-foreground">No services listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {services.map((service, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm">{service}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header with title and pricing */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold">Coworking Space Details</h3>
          <div className="mt-2 md:mt-0">
            <span className="text-2xl font-bold text-primary">
              {formatIndianRupees(data.price)}
            </span>
            {!data.isSale && <span className="text-sm text-muted-foreground ml-1">/month</span>}
            {data.isNegotiable && (
              <span className="text-sm text-muted-foreground ml-2">(Negotiable)</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {data.title && (
            <div>
              <p className="text-sm text-muted-foreground">Property Title</p>
              <p className="font-medium">{formatPropertyValue(data.title)}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">Property Type</p>
            <p className="font-medium">{formatPropertyValue(data.propertyType, 'Coworking Space')}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Built-up Area</p>
            <p className="font-medium">{formatArea(data.builtUpArea, data.builtUpAreaUnit)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Property Age</p>
            <p className="font-medium">{formatPropertyValue(data.propertyAge)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Floor</p>
            <p className="font-medium">{formatPropertyValue(data.floor)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total Floors</p>
            <p className="font-medium">{formatPropertyValue(data.totalFloors)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Facing</p>
            <p className="font-medium">{formatPropertyValue(data.facing)}</p>
          </div>

          {data.workspaceType && (
            <div>
              <p className="text-sm text-muted-foreground">Workspace Type</p>
              <p className="font-medium">{formatPropertyValue(data.workspaceType)}</p>
            </div>
          )}

          {data.capacity && (
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="font-medium">{formatCapacity(data.capacity)}</p>
            </div>
          )}

          {data.seatingArrangement && (
            <div>
              <p className="text-sm text-muted-foreground">Seating Arrangement</p>
              <p className="font-medium">{formatPropertyValue(data.seatingArrangement)}</p>
            </div>
          )}

          {data.meetingRooms && (
            <div>
              <p className="text-sm text-muted-foreground">Meeting Rooms</p>
              <p className="font-medium">{formatPropertyValue(data.meetingRooms)}</p>
            </div>
          )}

          {data.cabins && (
            <div>
              <p className="text-sm text-muted-foreground">Cabins</p>
              <p className="font-medium">{formatPropertyValue(data.cabins)}</p>
            </div>
          )}

          {data.operatingHours && (
            <div>
              <p className="text-sm text-muted-foreground">Operating Hours</p>
              <p className="font-medium">{formatPropertyValue(data.operatingHours)}</p>
            </div>
          )}

          {data.accessType && (
            <div>
              <p className="text-sm text-muted-foreground">Access Type</p>
              <p className="font-medium">{formatPropertyValue(data.accessType)}</p>
            </div>
          )}

          {data.internetSpeed && (
            <div>
              <p className="text-sm text-muted-foreground">Internet Speed</p>
              <p className="font-medium">{formatPropertyValue(data.internetSpeed)}</p>
            </div>
          )}

          {data.securityDeposit && (
            <div>
              <p className="text-sm text-muted-foreground">Security Deposit</p>
              <p className="font-medium">{formatIndianRupees(data.securityDeposit)}</p>
            </div>
          )}

          {data.parkingAvailable !== null && data.parkingAvailable !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Parking Available</p>
              <p className="font-medium">{formatBoolean(data.parkingAvailable)}</p>
            </div>
          )}
        </div>

        {/* Amenities Section */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-2">Amenities</p>
            {renderAmenities(data.amenities)}
          </div>
        )}

        {/* Services Section */}
        {data.services && data.services.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-2">Services</p>
            {renderServices(data.services)}
          </div>
        )}

        {/* Description Section */}
        {data.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="whitespace-pre-line">{data.description}</p>
          </div>
        )}
        
        {/* Rules Section */}
        {data.rules && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Rules & Guidelines</p>
            <p className="whitespace-pre-line">{data.rules}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoworkingDetailsSection;