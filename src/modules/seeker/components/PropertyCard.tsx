// src/modules/seeker/components/PropertyCard.tsx
// Version: 2.4.0
// Last Modified: 03-04-2025 10:30 IST
// Purpose: Enhanced property card with robust image handling and performance optimization

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  BedIcon, 
  BathIcon, 
  SquareIcon 
} from 'lucide-react';

import { PropertyType } from '@/modules/owner/components/property/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { togglePropertyLike } from '../services/seekerService';
import { useAuth } from '@/contexts/AuthContext';

// Optimized image selection hook
const usePropertyImage = (property: PropertyType) => {
  return useMemo(() => {
    const primaryImage = property.property_images?.find(img => img.is_primary);
    const fallbackImage = property.property_images?.[0];
    
    return primaryImage?.url || 
           fallbackImage?.url || 
           property.image || 
           '/noimage.png';
  }, [property]);
};

interface PropertyCardProps {
  property: PropertyType;
  initialIsLiked?: boolean;
  onLikeToggle?: (liked: boolean) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  initialIsLiked = false,
  onLikeToggle 
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Like state management
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Optimized image selection
  const imageSrc = usePropertyImage(property);

  // Like toggle handler with error management
  const handleLikeToggle = async () => {
    if (!user) {
      // Optionally show login prompt or toast
      return;
    }

    setIsLikeLoading(true);
    try {
      const result = await togglePropertyLike(property.id, user.id);
      setIsLiked(result.liked);
      onLikeToggle?.(result.liked);
    } catch (error) {
      console.error('Like toggle failed:', error);
      // Optionally show error toast
    } finally {
      setIsLikeLoading(false);
    }
  };

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
    <Card className={cn(
      "overflow-hidden group h-full flex flex-col transition-all duration-300",
      "hover:shadow-xl hover:translate-y-[-4px] border-none",
      theme === 'ocean' ? "bg-card" : "bg-card"
    )}>
      <div className="relative">
        <Link 
          to={`/seeker/property/${property.id}`} 
          className="block relative h-60 overflow-hidden"
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30 z-10" />
          
          {/* Property Image with Error Handling */}
          <img 
            src={imageSrc} 
            alt={property.title || 'Property'}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = '/noimage.png';
            }}
          />
          
          {/* Property Type Badge */}
          <div className={cn(
            "absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm",
            "rounded-full px-3 py-1 text-xs font-medium shadow-sm",
            theme === 'ocean' ? "text-primary" : "text-primary"
          )}>
            {property.property_details?.propertyType || 'Property'}
          </div>
        </Link>
        
        {/* Like Button with Loading State */}
        <button 
          onClick={handleLikeToggle}
          disabled={isLikeLoading || !user}
          className={cn(
            "absolute top-3 right-3 z-20 scale-110 transition-colors duration-300",
            isLiked ? "text-red-500" : "text-gray-300 hover:text-red-500",
            isLikeLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLiked ? '♥' : '♡'}
        </button>
      </div>

      {/* Property Details */}
      <div className="flex-grow p-5 flex flex-col">
        <div className="mb-auto">
          {/* Property Title */}
          <Link to={`/seeker/property/${property.id}`} className="block">
            <h3 className={cn(
              "text-lg font-semibold line-clamp-2",
              "group-hover:text-primary transition-colors"
            )}>
              {property.title}
            </h3>
          </Link>
        
          {/* Property Location */}
          <div className="flex items-center mt-2.5 text-muted-foreground">
            <MapPinIcon className="h-3.5 w-3.5 min-w-3.5 mr-1.5" />
            <p className="text-sm line-clamp-1">
              {formattedLocation || 'Location Not Specified'}
            </p>
          </div>
        </div>
        
        {/* Property Features */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5 text-sm">
                <BedIcon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{property.bedrooms} Bed</span>
              </div>
            )}
            
            {property.bathrooms && (
              <div className="flex items-center gap-1.5 text-sm ml-2">
                <BathIcon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{property.bathrooms} Bath</span>
              </div>
            )}
            
            {property.square_feet && (
              <div className="flex items-center gap-1.5 text-sm ml-2">
                <SquareIcon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{property.square_feet} sqft</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Price and View Details */}
        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
          <p className={cn(
            "text-xl font-bold flex items-center",
            theme === 'ocean' ? "text-primary" : "text-primary"
          )}>
            ₹{formatCurrency(property.price)}
            {property.property_details?.rentalFrequency && (
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /{property.property_details.rentalFrequency}
              </span>
            )}
          </p>
          
          <Link 
            to={`/seeker/property/${property.id}`} 
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
              theme === 'ocean' 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;