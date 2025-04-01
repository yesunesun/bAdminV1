// src/modules/properties/components/PropertyCard.tsx
// Version: 1.0.1
// Last Modified: 02-04-2025 21:30 IST
// Purpose: Fixed property image loading and rendering

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bed, Bath, Square, MapPin } from 'lucide-react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { formatPrice } from '../services/propertyMapService';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFavorite, checkIsFavorite } from '@/modules/seeker/services/seekerService';

interface PropertyCardProps {
  property: PropertyType;
  onFavorite: (propertyId: string) => boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavorite }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Check if property is favorited on component mount
  React.useEffect(() => {
    if (user) {
      const checkFavorite = async () => {
        try {
          const isFav = await checkIsFavorite(property.id);
          setIsFavorite(isFav);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      };
      
      checkFavorite();
    }
  }, [property.id, user]);
  
  // Handle toggle favorite
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user can perform favorite action (may show login prompt)
    if (!onFavorite(property.id)) {
      return;
    }
    
    setIsLoadingFavorite(true);
    try {
      const newStatus = await toggleFavorite(property.id);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  
  // Property status badge
  const getStatusBadge = () => {
    const status = property.status?.toLowerCase() || 'active';
    
    if (status === 'pending') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    } else if (status === 'sold' || status === 'rented') {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
  };
  
  // Get property image URL
  const getPropertyImage = () => {
    // First check if property_images array exists and has items
    if (property.property_images && 
        Array.isArray(property.property_images) && 
        property.property_images.length > 0) {
      // Find primary image first
      const primaryImage = property.property_images.find(img => img.is_primary);
      if (primaryImage && primaryImage.url) {
        return primaryImage.url;
      }
      
      // If no primary image, use the first image
      if (property.property_images[0].url) {
        return property.property_images[0].url;
      }
    }
    
    // Try property_details.primaryImage as fallback
    if (property.property_details?.primaryImage) {
      return property.property_details.primaryImage;
    }
    
    // Final fallback
    return '/noimage.png';
  };
  
  return (
    <Card className="overflow-hidden border hover:shadow-md transition-shadow">
      <div className="relative">
        {/* Property image */}
        <Link to={`/seeker/property/${property.id}`} className="block aspect-video">
          <img
            src={imageError ? '/apartment.jpg' : getPropertyImage()}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Link>
        
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 ${
            isFavorite ? 'text-red-500 hover:text-red-600' : 'text-foreground hover:text-foreground'
          }`}
          onClick={handleToggleFavorite}
          disabled={isLoadingFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''} ${isLoadingFavorite ? 'animate-pulse' : ''}`} />
        </Button>
        
        {/* Property status badge */}
        <div className="absolute bottom-2 left-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <CardContent className="p-3 pb-4">
        <Link to={`/seeker/property/${property.id}`}>
          {/* Property price */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">
              {formatPrice(property.price || 0)}
            </h3>
            
            {/* Property type badge */}
            <Badge variant="secondary" className="text-xs">
              {property.property_details?.propertyType || 'Residential'}
            </Badge>
          </div>
          
          {/* Property title */}
          <h4 className="font-medium text-sm line-clamp-1 mb-1">
            {property.title}
          </h4>
          
          {/* Property location */}
          <p className="text-xs text-muted-foreground flex items-start mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {property.address || property.city || 'Address not specified'}
            </span>
          </p>
          
          {/* Property features */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-3.5 w-3.5 mr-1" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-3.5 w-3.5 mr-1" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            
            {property.square_feet && (
              <div className="flex items-center">
                <Square className="h-3.5 w-3.5 mr-1" />
                <span>{property.square_feet} sq.ft</span>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;