// src/modules/seeker/components/PropertyCard.tsx
// Version: 1.1.0
// Last Modified: 27-02-2025 12:30 IST
// Purpose: Improved card component for displaying property in grid view with better spacing and layout

import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { HeartIcon, MapPinIcon, BedIcon, BathIcon, SquareIcon } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyType;
  isLiked?: boolean;
  onLike?: (property: PropertyType) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isLiked, onLike }) => {
  // Find primary image or use first image
  const primaryImage = property.property_images?.find(img => img.is_primary) || 
                       (property.property_images && property.property_images.length > 0 ? property.property_images[0] : null);
  
  const imageSrc = primaryImage?.url || '/placeholder-property.jpg';

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(property);
    }
  };

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
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <HeartIcon className={`h-5 w-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`} />
        </button>
      </div>

      <CardContent className="flex-grow p-5">
        {/* Property type label removed as requested */}
        
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

      {/* CardFooter removed as requested */}
    </Card>
  );
};

export default PropertyCard;