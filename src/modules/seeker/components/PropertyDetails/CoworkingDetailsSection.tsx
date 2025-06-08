// src/modules/seeker/components/PropertyDetails/CoworkingDetailsSection.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 14:30 IST
// Purpose: Enhanced coworking details with Phase 1 design system, Indian formatting, and responsive layout

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2,
  Users,
  Clock,
  Wifi,
  Car,
  Coffee,
  Monitor,
  MapPin,
  IndianRupee,
  CheckCircle2,
  Briefcase,
  Calendar,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatIndianRupees, 
  renderFieldValue,
  formatFieldLabel,
  formatCapacity,
  formatBoolean,
  shouldDisplayValue
} from './utils/dataFormatters';

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
        <CardContent className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Coworking Space Details</h3>
          <p className="text-muted-foreground">No coworking space details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format area with unit
  const formatArea = (area: any, unit: string = 'sqft'): string => {
    if (!area) return '-';
    const numArea = typeof area === 'number' ? area : Number(area);
    if (isNaN(numArea)) return '-';
    const formatted = new Intl.NumberFormat('en-IN').format(numArea);
    return `${formatted} ${unit || 'sqft'}`;
  };

  // Get icon for amenity type
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
    if (amenityLower.includes('coffee') || amenityLower.includes('tea') || amenityLower.includes('cafeteria')) return Coffee;
    if (amenityLower.includes('meeting') || amenityLower.includes('conference')) return Monitor;
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return Shield;
    return CheckCircle2;
  };

  // Get icon for service type
  const getServiceIcon = (service: string) => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('reception') || serviceLower.includes('front desk')) return Users;
    if (serviceLower.includes('cleaning') || serviceLower.includes('housekeeping')) return Settings;
    if (serviceLower.includes('mail') || serviceLower.includes('courier')) return MapPin;
    if (serviceLower.includes('business') || serviceLower.includes('support')) return Briefcase;
    return CheckCircle2;
  };

  // Render amenities as color-coded cards
  const renderAmenities = (amenities: any[]) => {
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
      return <span className="text-muted-foreground">No amenities listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {amenities.map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity);
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
                "transition-all hover:-translate-y-1 hover:shadow-md"
              )}
            >
              <div className="p-1.5 rounded-full bg-blue-500/10">
                <IconComponent className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-900">{amenity}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render services as color-coded cards
  const renderServices = (services: any[]) => {
    if (!services || !Array.isArray(services) || services.length === 0) {
      return <span className="text-muted-foreground">No services listed</span>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {services.map((service, index) => {
          const IconComponent = getServiceIcon(service);
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
              <span className="text-sm font-medium text-green-900">{service}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Fields to exclude from additional details display
  const excludedFields = [
    'title', 'propertyType', 'price', 'isSale', 'isNegotiable', 'amenities', 'services',
    'description', 'rules', 'workspaceType', 'capacity', 'seatingArrangement',
    'meetingRooms', 'cabins', 'operatingHours', 'accessType', 'internetSpeed',
    'securityDeposit', 'parkingAvailable', 'builtUpArea', 'builtUpAreaUnit'
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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold">Coworking Space Details</h2>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 rounded-xl border border-primary/20">
            <IndianRupee className="h-5 w-5 text-primary" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl md:text-2xl font-bold text-primary">
                {formatIndianRupees(data.price)}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {!data.isSale && <span>/month</span>}
                {data.isNegotiable && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Negotiable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Coworking Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {data.workspaceType && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workspace Type</span>
              <span className="font-semibold text-center text-sm mt-1 capitalize">
                {data.workspaceType}
              </span>
            </div>
          )}

          {data.capacity && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacity</span>
              <span className="font-semibold text-sm mt-1">
                {formatCapacity(data.capacity)}
              </span>
            </div>
          )}

          {data.builtUpArea && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-orange-500/10 mb-3">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Built-up Area</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatArea(data.builtUpArea, data.builtUpAreaUnit)}
              </span>
            </div>
          )}

          {data.operatingHours && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Operating Hours</span>
              <span className="font-semibold text-center text-sm mt-1">
                {data.operatingHours}
              </span>
            </div>
          )}
        </div>

        {/* Additional Details Section */}
        {additionalDetails.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Additional Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {additionalDetails.map(([key, value]) => (
                <div key={key} className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatFieldLabel(key)}
                  </span>
                  <span className="font-medium text-foreground">
                    {key === 'securityDeposit' ? formatIndianRupees(value) : 
                     key === 'parkingAvailable' ? formatBoolean(value) :
                     renderFieldValue(value, key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenities Section */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Amenities</h4>
            </div>
            {renderAmenities(data.amenities)}
          </div>
        )}

        {/* Services Section */}
        {data.services && data.services.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Services</h4>
            </div>
            {renderServices(data.services)}
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
        
        {/* Rules Section */}
        {data.rules && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Rules & Guidelines</h4>
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

export default CoworkingDetailsSection;