// src/modules/seeker/components/PropertyDetails/PropertyInfo.tsx
// Version: 3.5.0
// Last Modified: 03-04-2025 17:20 IST
// Purpose: Enhanced property information display with improved visual hierarchy, spacing, and responsive design

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { 
  MapPinIcon, 
  BedIcon, 
  BathIcon, 
  SquareIcon, 
  TagIcon, 
  CalendarIcon,
  HomeIcon,
  CompassIcon,
  ClockIcon,
  CheckSquareIcon,
  BuildingIcon,
  LandmarkIcon,
  IndianRupeeIcon,
  InfoIcon,
  CheckIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyType } from '@/modules/owner/components/property/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface PropertyInfoProps {
  property: PropertyType;
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  const { theme } = useTheme();
  const propertyDetails = property.property_details || {};
  const amenities = propertyDetails.amenities || [];
  
  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Generate Google Maps URL for the address
  const getGoogleMapsUrl = () => {
    const address = [
      property.address,
      property.city,
      property.state,
      property.zip_code
    ].filter(Boolean).join(', ');
    
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };
  
  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    const destination = [
      property.address,
      property.city,
      property.state,
      property.zip_code
    ].filter(Boolean).join(', ');
    
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  };

  return (
    <div className="space-y-8">
      {/* Property Title & Price Section with Enhanced Gradient Background */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 shadow-lg border border-primary/10">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-60 background-mesh"></div>
        
        <div className="relative z-10">          
          <div className="flex flex-col gap-5">
            {/* Title and Address */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-1">
                {property.tags && property.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{property.title}</h1>
              
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <p className="text-base leading-relaxed">
                  {[property.address, property.city, property.state, property.zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
            
            {/* Price section */}
            <div className="w-full max-w-full">
              <div className="inline-flex items-center bg-background/60 backdrop-blur-sm py-4 px-6 rounded-xl border border-primary/20 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-muted-foreground">Price:</span>
                  <div className="flex items-baseline gap-1.5">
                    <IndianRupeeIcon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-3xl font-extrabold">
                      {formatCurrency(property.price)}
                    </span>
                    
                    {propertyDetails.rentalFrequency && (
                      <span className="text-sm text-muted-foreground ml-1">
                        /{propertyDetails.rentalFrequency}
                      </span>
                    )}
                  </div>
                  
                  {propertyDetails.rentNegotiable && (
                    <Badge className="bg-success/20 text-success border-0 ml-2 px-3 py-1 rounded-full">
                      Negotiable
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Stats - Enhanced with animation and better visual hierarchy */}
      <div className="relative z-10 -mt-10 bg-background shadow-xl rounded-2xl border border-primary/10 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          {property.bedrooms && (
            <div className="flex flex-col items-center justify-center py-6 px-4 group hover:bg-primary/5 transition-colors duration-300">
              <div className="rounded-full w-14 h-14 bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <BedIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-bold">{property.bedrooms}</div>
              <div className="text-sm text-muted-foreground">{property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</div>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex flex-col items-center justify-center py-6 px-4 group hover:bg-primary/5 transition-colors duration-300">
              <div className="rounded-full w-14 h-14 bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <BathIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-bold">{property.bathrooms}</div>
              <div className="text-sm text-muted-foreground">{property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</div>
            </div>
          )}
          
          {property.square_feet && (
            <div className="flex flex-col items-center justify-center py-6 px-4 group hover:bg-primary/5 transition-colors duration-300">
              <div className="rounded-full w-14 h-14 bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <SquareIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-bold">{property.square_feet}</div>
              <div className="text-sm text-muted-foreground">Square Feet</div>
            </div>
          )}
        </div>
      </div>

      {/* Description - Enhanced with subtle gradient background */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent p-8 backdrop-blur-sm shadow-sm border border-primary/10">
        <h2 className="text-2xl font-semibold mb-5 flex items-center">
          <InfoIcon className="h-6 w-6 mr-3 text-primary" />
          About this Property
        </h2>
        <div className="text-foreground/90 whitespace-pre-line prose max-w-none leading-relaxed text-base">
          {property.description || 'No description provided for this property.'}
        </div>
      </div>
      
      {/* Property Specifications - Enhanced styling and organization */}
      <div className="rounded-2xl border border-primary/20 overflow-hidden shadow-md">
        <div className={cn(
          "py-4 px-6",
          theme === 'ocean' ? "bg-primary/10" : "bg-primary/10"
        )}>
          <h2 className="text-xl font-semibold flex items-center">
            <LandmarkIcon className="h-5 w-5 mr-2.5 text-primary" />
            Property Details
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {propertyDetails.propertyAge && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <ClockIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property Age</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.propertyAge}</div>
                </div>
              </div>
            )}
            
            {propertyDetails.floor && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <HomeIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Floor</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.floor}</div>
                </div>
              </div>
            )}
            
            {propertyDetails.totalFloors && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <BuildingIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Floors</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.totalFloors}</div>
                </div>
              </div>
            )}
            
            {propertyDetails.facing && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <CompassIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Facing</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.facing}</div>
                </div>
              </div>
            )}
            
            {propertyDetails.furnishing && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <HomeIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Furnishing</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.furnishing}</div>
                </div>
              </div>
            )}
            
            {propertyDetails.availableFrom && (
              <div className="flex items-center p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-md">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available From</div>
                  <div className="font-semibold text-foreground mt-1">{propertyDetails.availableFrom}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Additional features with enhanced styling */}
          {propertyDetails.additional_features && Object.keys(propertyDetails.additional_features).length > 0 && (
            <>
              <div className="my-8 h-px w-full bg-border/50"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                {Object.entries(propertyDetails.additional_features).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center border-b border-border/30 pb-3 group hover:border-primary/30 transition-colors">
                    <span className="font-medium capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                    <span className="text-primary font-medium text-sm bg-primary/5 px-3 py-1 rounded-full group-hover:bg-primary/10 transition-colors">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amenities & Features - Enhanced with animation and better organization */}
      {amenities.length > 0 && (
        <div className="rounded-2xl border border-primary/20 overflow-hidden shadow-md">
          <div className={cn(
            "py-4 px-6",
            theme === 'ocean' ? "bg-primary/10" : "bg-primary/10"
          )}>
            <h2 className="text-xl font-semibold flex items-center">
              <CheckSquareIcon className="h-5 w-5 mr-2.5 text-primary" />
              Amenities & Features
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-muted/30 p-3.5 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-md group hover:-translate-y-1"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                    <CheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInfo;