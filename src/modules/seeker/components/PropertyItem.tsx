// src/modules/seeker/components/PropertyItem.tsx
// Version: 1.1.0
// Last Modified: 10-05-2025 17:15 IST
// Purpose: Reusable property item component with added listing type (Rent/Sale)

import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Share2, ChevronRight, MapPin, Bed, Bath, Square } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { formatPrice } from '../services/seekerService';

interface PropertyItemProps {
  property: PropertyType;
  isLiked: boolean;
  isHovered: boolean;
  propertyImage: string;
  onHover: (propertyId: string, isHovering: boolean) => void;
  onSelect: (property: PropertyType) => void;
  onFavoriteToggle: (propertyId: string, isLiked: boolean) => Promise<boolean>;
  onShare: (e: React.MouseEvent, property: PropertyType) => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({
  property,
  isLiked,
  isHovered,
  propertyImage,
  onHover,
  onSelect,
  onFavoriteToggle,
  onShare
}) => {
  // Extract property details with fallbacks
  const propertyType = property.property_details?.propertyType || 'Apartment';
  const propertyName = property.bedrooms 
    ? `${property.bedrooms} BHK Apartment`
    : property.title || 'Apartment';
  const locality = property.property_details?.locality || property.city || '';
  
  // Extract listing type (Rent/Sale)
  const listingType = property.property_details?.listingType || 
                      (property.property_details?.for === 'rent' ? 'Rent' : 
                       property.property_details?.for === 'sale' ? 'Sale' : 
                       property.price > 10000000 ? 'Sale' : 'Rent');

  return (
    <div 
      key={`property-${property.id}`}
      className={`relative transition hover:bg-muted/40 ${isHovered ? 'bg-muted/40' : ''}`}
    >
      <div className="p-3"
        onMouseEnter={() => onHover(property.id, true)}
        onMouseLeave={() => onHover(property.id, false)}
        onClick={() => onSelect(property)}
      >
        {/* Property Name at the top with blue text */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to={`/seeker/property/${property.id}`}
            className="text-sm font-medium text-blue-500 hover:underline truncate max-w-[70%]"
          >
            {propertyName}
          </Link>
          
          {/* Share and Favorite buttons - horizontal layout */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => onShare(e, property)}
              className="text-gray-400 hover:text-blue-500"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            <FavoriteButton
              initialIsLiked={isLiked}
              onToggle={(newLikedState) => onFavoriteToggle(property.id, newLikedState)}
              className="text-gray-400 hover:text-primary" 
            />
          </div>
        </div>
        
        <Link 
          to={`/seeker/property/${property.id}`} 
          className="flex gap-2"
        >
          {/* Property image */}
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={propertyImage}
              alt={property.title || 'Property'}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/noimage.png';
              }}
            />
          </div>
          
          {/* Property details */}
          <div className="flex-1 min-w-0">
            {/* Location with icon */}
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {locality || property.address || 'Location unavailable'}
              </span>
            </div>
            
            {/* Price */}
            <p className="text-sm font-semibold mb-2">
              {formatPrice(property.price)}
            </p>
            
            {/* Property specs */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {property.bedrooms && (
                <span className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms}</span>
                </span>
              )}
              
              {property.bathrooms && (
                <span className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms}</span>
                </span>
              )}
              
              {property.square_feet && (
                <span className="flex items-center">
                  <Square className="h-3 w-3 mr-1" />
                  <span className="whitespace-nowrap">{property.square_feet} sq.ft</span>
                </span>
              )}
            </div>
            
            {/* Property Type and Listing Type Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Property Type Badge */}
              <div className="inline-block bg-gray-100 text-xs text-gray-600 px-2 py-0.5 rounded">
                {propertyType}
              </div>
              
              {/* Listing Type Badge (Rent/Sale) */}
              <div className={`inline-block text-xs text-white px-2 py-0.5 rounded ${
                listingType === 'Rent' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                For {listingType}
              </div>
            </div>
          </div>
          
          {/* Chevron icon */}
          <div className="self-center flex-shrink-0">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PropertyItem;