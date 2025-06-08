// src/modules/seeker/components/PropertyCardContent.tsx
// Version: 1.0.0
// Last Modified: 10-05-2025 12:00 IST

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  BedIcon, 
  BathIcon, 
  SquareIcon 
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { PropertyType } from '@/modules/owner/components/property/types';

interface PropertyCardContentProps {
  property: PropertyType;
  theme: string;
}

const PropertyCardContent: React.FC<PropertyCardContentProps> = ({ 
  property, 
  theme 
}) => {
  // Location formatting with fallback
  const formattedLocation = useMemo(() => {
    const locationParts = [
      property.address, 
      property.city, 
      property.state
    ].filter(Boolean);
    
    return locationParts.join(', ');
  }, [property.address, property.city, property.state]);

  return (
    <div className="flex-grow p-6 flex flex-col">
      {/* Property Details Section */}
      <div className="mb-auto">
        {/* Property Title */}
        <Link to={`/seeker/property/${property.id}`} className="block">
          <h3 className={cn(
            "text-lg font-semibold line-clamp-2 mb-2",
            "group-hover:text-primary transition-colors"
          )}>
            {property.title}
          </h3>
        </Link>
      
        {/* Property Location */}
        <div className="flex items-center mt-1 text-muted-foreground">
          <div className="w-5 h-5 flex items-center justify-center mr-1.5">
            <MapPinIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm line-clamp-1">
            {formattedLocation || 'Location Not Specified'}
          </p>
        </div>
      </div>
      
      {/* Property Features Section */}
      <div className="mt-5 flex justify-between items-center">
        <div className="grid grid-cols-3 gap-2 w-full">
          {property.bedrooms ? (
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <BedIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          ) : null}
          
          {property.bathrooms ? (
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <BathIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          ) : null}
          
          {property.square_feet ? (
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <SquareIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{property.square_feet} sqft</span>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Price and View Details Section */}
      <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
        <div>
          <p className={cn(
            "text-xl font-bold flex items-center",
            theme === 'ocean' ? "text-primary" : "text-primary"
          )}>
            ₹{formatCurrency(property.price)}
          </p>
          {property.property_details?.rentalFrequency && (
            <span className="text-xs text-muted-foreground">
              per {property.property_details.rentalFrequency}
            </span>
          )}
        </div>
        
        <Link 
          to={`/seeker/property/${property.id}`} 
          className={cn(
            "text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
            "hover:shadow-md hover:-translate-y-0.5",
            theme === 'ocean' 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCardContent;