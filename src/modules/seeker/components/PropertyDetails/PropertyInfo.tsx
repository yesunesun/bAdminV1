// src/modules/seeker/components/PropertyDetails/PropertyInfo.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 15:35 IST
// Purpose: Display detailed property information

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { 
  MapPinIcon, 
  BedIcon, 
  BathIcon, 
  SquareIcon, 
  TagIcon, 
  CalendarIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PropertyType } from '@/modules/owner/components/property/types';

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

      {amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Amenities & Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
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
    </div>
  );
};

export default PropertyInfo;