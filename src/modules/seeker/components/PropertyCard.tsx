// src/modules/seeker/components/PropertyCard.tsx
// Version: 1.2.0
// Last Modified: 27-02-2025 13:30 IST
// Purpose: Improved card component with fixed favorite functionality

import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MapPinIcon, BedIcon, BathIcon, SquareIcon } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface PropertyCardProps {
  property: PropertyType;
  isLiked?: boolean;
  onLike?: (property: PropertyType) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isLiked = false, onLike }) => {
  // Find primary image or use first image
  const primaryImage = property.property_images?.find(img => img.is_primary) || 
                       (property.property_images && property.property_images.length > 0 ? property.property_images[0] : null);
  
  const imageSrc = primaryImage?.url || '/placeholder-property.jpg';

  // Removed handleLikeClick as it's now handled in the FavoriteButton component

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative">
        <Link to={`/seeker/property/${property.id}`} className="block relative h-56 overflow-hidden">
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        <FavoriteButton 
          initialIsLiked={isLiked}
          onToggle={(newLikedState) => {
            if (onLike) {
              onLike(property);
            }
          }}
          className="absolute top-3 right-3 z-20"
        />
      </div>

      <CardContent className="flex-grow p-5">
        <Link to={`/seeker/property/${property.id}`} className="block">
          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <p className="text-2xl font-bold mt-3 text-primary">
          ₹{formatCurrency(property.price)}
        </p>
        
        <div className="flex items-center mt-3 text-muted-foreground">
          <MapPinIcon className="h-4 w-4 min-w-4 mr-2" />
          <p className="text-sm line-clamp-1">
            {[property.address, property.city, property.state]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4 gap-2">
          {property.bedrooms && (
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
              <BedIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
              <BathIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
          )}
          
          {property.square_feet && (
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
              <SquareIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{property.square_feet}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;