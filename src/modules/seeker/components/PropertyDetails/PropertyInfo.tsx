// src/modules/seeker/components/PropertyDetails/PropertyInfo.tsx
// Version: 2.0.0
// Last Modified: 01-03-2025 11:15 IST
// Purpose: Enhanced property info with Google Maps integration and additional details

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
  CheckSquareIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';

interface PropertyInfoProps {
  property: PropertyType;
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
        
        <div className="flex items-center mt-2">
          <MapPinIcon className="h-5 w-5 text-muted-foreground mr-1" />
          <p className="text-muted-foreground">
            {[property.address, property.city, property.state, property.zip_code]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-3xl md:text-4xl font-bold text-primary">
          ₹{formatCurrency(property.price)}
          {propertyDetails.rentNegotiable && (
            <Badge className="ml-2 bg-success/10 text-success border-success/20">Negotiable</Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {property.tags && property.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
          
          <Badge variant="outline" className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Listed on {formatDate(property.created_at)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        {property.bedrooms && (
          <div className="flex flex-col items-center justify-center p-2">
            <BedIcon className="h-6 w-6 mb-1" />
            <div className="text-lg font-semibold">{property.bedrooms}</div>
            <div className="text-xs text-muted-foreground">{property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</div>
          </div>
        )}
        
        {property.bathrooms && (
          <div className="flex flex-col items-center justify-center p-2">
            <BathIcon className="h-6 w-6 mb-1" />
            <div className="text-lg font-semibold">{property.bathrooms}</div>
            <div className="text-xs text-muted-foreground">{property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</div>
          </div>
        )}
        
        {property.square_feet && (
          <div className="flex flex-col items-center justify-center p-2">
            <SquareIcon className="h-6 w-6 mb-1" />
            <div className="text-lg font-semibold">{property.square_feet}</div>
            <div className="text-xs text-muted-foreground">Square Feet</div>
          </div>
        )}
        
        {propertyDetails.type && (
          <div className="flex flex-col items-center justify-center p-2">
            <TagIcon className="h-6 w-6 mb-1" />
            <div className="text-lg font-semibold capitalize">{propertyDetails.type}</div>
            <div className="text-xs text-muted-foreground">Property Type</div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <div className="text-muted-foreground whitespace-pre-line">
          {property.description || 'No description provided.'}
        </div>
      </div>
      
      {/* Property Specifications */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Property Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
          {propertyDetails.propertyAge && (
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Property Age</div>
                <div className="font-medium">{propertyDetails.propertyAge}</div>
              </div>
            </div>
          )}
          
          {propertyDetails.floor && (
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Floor</div>
                <div className="font-medium">{propertyDetails.floor}</div>
              </div>
            </div>
          )}
          
          {propertyDetails.totalFloors && (
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Total Floors</div>
                <div className="font-medium">{propertyDetails.totalFloors}</div>
              </div>
            </div>
          )}
          
          {propertyDetails.facing && (
            <div className="flex items-center">
              <CompassIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Facing</div>
                <div className="font-medium">{propertyDetails.facing}</div>
              </div>
            </div>
          )}
          
          {propertyDetails.furnishing && (
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Furnishing</div>
                <div className="font-medium">{propertyDetails.furnishing}</div>
              </div>
            </div>
          )}
          
          {propertyDetails.availableFrom && (
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <div className="text-sm text-muted-foreground">Available From</div>
                <div className="font-medium">{propertyDetails.availableFrom}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Amenities & Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center">
                <CheckSquareIcon className="h-4 w-4 text-primary mr-2" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {propertyDetails.additional_features && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(propertyDetails.additional_features).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-muted-foreground">{value as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Google Maps Integration */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Location</h2>
        <div className="rounded-lg overflow-hidden border border-border mb-3">
          <iframe
            title="Property Location"
            width="100%"
            height="300"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
              [property.address, property.city, property.state, property.zip_code].filter(Boolean).join(', ')
            )}`}
            allowFullScreen
          ></iframe>
        </div>
        <div className="flex flex-wrap gap-2">
          <a 
            href={getGoogleMapsUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MapPinIcon className="h-4 w-4 mr-1.5" />
            View on Google Maps
          </a>
          <a 
            href={getDirectionsUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <MapPinIcon className="h-4 w-4 mr-1.5" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfo;