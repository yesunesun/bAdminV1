// src/modules/seeker/components/PropertyItem.tsx
// Version: 5.1.0
// Last Modified: 31-05-2025 18:30 IST
// Purpose: Fixed image display using primary_image field and fastImageService

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { 
  ChevronRight, MapPin, Bed, Bath, Square, Users, 
  Coffee, Building, Home, Calendar, Utensils, Briefcase, FileText, Map
} from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { formatPrice } from '../services/seekerService';
import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';
import { 
  formatDetailedLocation,
  detectPropertyFlowType
} from '../utils/propertyTitleUtils';
import { fastImageService } from './PropertyItem/services/fastImageService';

interface PropertyItemProps {
  property: PropertyType;
  isLiked: boolean;
  isHovered: boolean;
  propertyImage?: string; // Legacy prop - ignored now
  onHover: (propertyId: string, isHovering: boolean) => void;
  onSelect: (property: PropertyType) => void;
  onFavoriteToggle: (propertyId: string, isLiked: boolean) => Promise<boolean>;
  onShare: (e: React.MouseEvent, property: PropertyType) => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({
  property,
  isLiked,
  isHovered,
  propertyImage, // Ignored - we generate our own
  onHover,
  onSelect,
  onFavoriteToggle,
  onShare
}) => {
  // State for favorite button loading
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Extract details from property
  const details = property.property_details || {};
  
  // Use utility functions to determine flow type
  const flowType = detectPropertyFlowType(property);
  
  // Use title directly from flow.title only
  const title = details.flow?.title || 'Property Listing';
  const detailedLocation = formatDetailedLocation(property);
  
  // Get display data specific to the flow type
  const displayData = getFlowSpecificDisplayData(property, flowType, details);
  
  // FIXED: Simple image URL logic using primary_image from search results with detailed debugging
  const imageUrl = useMemo(() => {
    try {
      console.log(`[PropertyItem] =======DEBUG START for Property ${property.id}=======`);
      console.log(`[PropertyItem] Full property object keys:`, Object.keys(property));
      console.log(`[PropertyItem] property.primary_image:`, property.primary_image);
      console.log(`[PropertyItem] property.property_images:`, property.property_images);
      console.log(`[PropertyItem] property.property_details:`, property.property_details);
      
      // Method 1: Use primary_image field from search results (NEW - from SQL function)
      if (property.primary_image && property.primary_image.trim()) {
        const constructedUrl = fastImageService.getPublicImageUrl(property.id, property.primary_image);
        console.log(`[PropertyItem] ✓ Using primary_image '${property.primary_image}'`);
        console.log(`[PropertyItem] ✓ Constructed URL:`, constructedUrl);
        console.log(`[PropertyItem] =======DEBUG END=======`);
        return constructedUrl;
      }
      
      // Method 2: Use property_images array (set by propertyService - for compatibility)
      if (property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
        console.log(`[PropertyItem] ✓ Found property_images array with ${property.property_images.length} images`);
        const primaryImage = property.property_images.find(img => img.is_primary);
        const imageToUse = primaryImage || property.property_images[0];
        console.log(`[PropertyItem] ✓ Using image:`, imageToUse);
        
        if (imageToUse.url && imageToUse.url.startsWith('http')) {
          console.log(`[PropertyItem] ✓ Using full URL:`, imageToUse.url);
          console.log(`[PropertyItem] =======DEBUG END=======`);
          return imageToUse.url;
        }
        
        if (imageToUse.fileName) {
          const constructedUrl = fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
          console.log(`[PropertyItem] ✓ Constructed URL from fileName '${imageToUse.fileName}':`, constructedUrl);
          console.log(`[PropertyItem] =======DEBUG END=======`);
          return constructedUrl;
        }
      }
      
      // Method 3: Use primaryImage from property_details (legacy support)
      if (details.primaryImage) {
        console.log(`[PropertyItem] ✓ Found details.primaryImage:`, details.primaryImage);
        if (details.primaryImage.startsWith('http') || details.primaryImage.startsWith('/')) {
          console.log(`[PropertyItem] ✓ Using details.primaryImage as URL:`, details.primaryImage);
          console.log(`[PropertyItem] =======DEBUG END=======`);
          return details.primaryImage;
        }
        const constructedUrl = fastImageService.getPublicImageUrl(property.id, details.primaryImage);
        console.log(`[PropertyItem] ✓ Constructed URL from details.primaryImage:`, constructedUrl);
        console.log(`[PropertyItem] =======DEBUG END=======`);
        return constructedUrl;
      }
      
      // Debug: Check if we're missing any image fields
      console.log(`[PropertyItem] ❌ NO IMAGES FOUND!`);
      console.log(`[PropertyItem] ❌ property.primary_image: ${property.primary_image}`);
      console.log(`[PropertyItem] ❌ property.property_images: ${property.property_images}`);
      console.log(`[PropertyItem] ❌ details.primaryImage: ${details.primaryImage}`);
      console.log(`[PropertyItem] =======DEBUG END=======`);
      
      // Fallback to no image
      return '/noimage.png';
    } catch (error) {
      console.error(`[PropertyItem] Error getting image for property ${property.id}:`, error);
      console.log(`[PropertyItem] =======DEBUG END=======`);
      return '/noimage.png';
    }
  }, [property.id, property.primary_image, property.property_images, details]);
  
  // Handle favorite toggle with loading state
  const handleFavoriteToggle = async (isLiked: boolean) => {
    setIsFavoriteLoading(true);
    
    try {
      const success = await onFavoriteToggle(property.id, isLiked);
      return success;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  
  return (
    <div 
      key={`property-${property.id}`}
      className={`relative transition hover:bg-muted/40 ${isHovered ? 'bg-muted/40' : ''}`}
    >
      {/* Favorite Button - Top Right Corner of Card */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          initialIsLiked={isLiked}
          onToggle={handleFavoriteToggle}
          isLoading={isFavoriteLoading}
          className="w-8 h-8"
        />
      </div>

      <div className="p-3"
        onMouseEnter={() => onHover(property.id, true)}
        onMouseLeave={() => onHover(property.id, false)}
        onClick={() => onSelect(property)}
      >
        {/* Property Name at the top with blue text */}
        <div className="mb-2">
          <Link
            to={`/seeker/property/${property.id}`}
            className="text-sm font-medium text-blue-500 hover:underline truncate block"
          >
            {title}
          </Link>
        </div>
        
        <Link 
          to={`/seeker/property/${property.id}`} 
          className="flex gap-2"
        >
          {/* Property image - using fastImageService with proper URL construction */}
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={title || 'Property'}
              className="h-full w-full object-cover"
              loading="lazy"
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
                {detailedLocation}
              </span>
            </div>
            
            {/* Price */}
            <p className="text-sm font-semibold mb-2">
              {displayData.price}
            </p>
            
            {/* Property specs - flow-specific icons */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {displayData.icons.map((icon, index) => (
                <span key={index} className="flex items-center">
                  {icon.icon}
                  <span className="whitespace-nowrap">{icon.text}</span>
                </span>
              ))}
            </div>
            
            {/* Property Type and Listing Type Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Property Type Badge */}
              <div className="inline-block text-xs text-white px-2 py-0.5 rounded bg-gray-500">
                {displayData.propertyType}
              </div>
              
              {/* Listing Type Badge */}
              <div className={`inline-block text-xs text-white px-2 py-0.5 rounded ${
                displayData.listingDisplay.toLowerCase().includes('rent') 
                  ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {displayData.listingDisplay}
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

// Keep the existing helper function (same as before)
function getFlowSpecificDisplayData(property: PropertyType, flowType: string, details: any) {
  const basicDetails = details.basicDetails || {};
  const saleInfo = details.saleInfo || {};
  const rentalInfo = details.rentalInfo || {};
  
  // Default values
  let price = formatPrice(property.price || 0);
  let icons = [];
  let propertyType = basicDetails.propertyType || property.property_type || 'Apartment';
  let listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  
  // Flow-specific logic
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      price = `${formatPrice(rentalInfo.rentAmount || property.price || 0)} per month`;
      icons = [
        { icon: <Bed className="h-3 w-3 mr-1" />, text: basicDetails.bhkType?.charAt(0) || property.bedrooms || 0 },
        { icon: <Bath className="h-3 w-3 mr-1" />, text: basicDetails.bathrooms || property.bathrooms || 0 },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` }
      ];
      if (rentalInfo.furnishingStatus) {
        icons.push({ icon: <Home className="h-3 w-3 mr-1" />, text: rentalInfo.furnishingStatus });
      }
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_SALE:
      price = formatPrice(saleInfo.expectedPrice || property.price || 0);
      icons = [
        { icon: <Bed className="h-3 w-3 mr-1" />, text: basicDetails.bhkType?.charAt(0) || property.bedrooms || 0 },
        { icon: <Bath className="h-3 w-3 mr-1" />, text: basicDetails.bathrooms || property.bathrooms || 0 },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` }
      ];
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      const flatmateInfo = details.flatmateInfo || {};
      price = `${formatPrice(flatmateInfo.rent || property.price || 0)} per month`;
      icons = [
        { icon: <Users className="h-3 w-3 mr-1" />, text: `${flatmateInfo.totalFlatmates || 2} flatmates` },
        { icon: <Bed className="h-3 w-3 mr-1" />, text: flatmateInfo.roomType || 'Shared' },
        { icon: <Utensils className="h-3 w-3 mr-1" />, text: flatmateInfo.foodPreference || 'Any' }
      ];
      listingDisplay = "Flatmates";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      const pgInfo = details.pgInfo || {};
      price = `${formatPrice(pgInfo.rent || property.price || 0)} per month`;
      icons = [
        { icon: <Users className="h-3 w-3 mr-1" />, text: pgInfo.genderPreference || 'Any' },
        { icon: <Bed className="h-3 w-3 mr-1" />, text: pgInfo.roomType || 'Shared' },
        { icon: <Utensils className="h-3 w-3 mr-1" />, text: pgInfo.foodIncluded ? 'Food Included' : 'No Food' }
      ];
      listingDisplay = "PG/Hostel";
      break;
      
    case FLOW_TYPES.COMMERCIAL_RENT:
      const commercialRentalInfo = details.commercialRentalInfo || {};
      price = `${formatPrice(commercialRentalInfo.rentAmount || property.price || 0)} per month`;
      icons = [
        { icon: <Building className="h-3 w-3 mr-1" />, text: basicDetails.commercialType || 'Office' },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${basicDetails.area || property.square_feet || 0} sq.ft` },
        { icon: <Briefcase className="h-3 w-3 mr-1" />, text: commercialRentalInfo.suitableFor || 'Business' }
      ];
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.COMMERCIAL_SALE:
      const commercialSaleInfo = details.commercialSaleInfo || {};
      price = formatPrice(commercialSaleInfo.salePrice || property.price || 0);
      icons = [
        { icon: <Building className="h-3 w-3 mr-1" />, text: basicDetails.commercialType || 'Office' },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${basicDetails.area || property.square_feet || 0} sq.ft` },
        { icon: <FileText className="h-3 w-3 mr-1" />, text: commercialSaleInfo.ownershipType || 'Freehold' }
      ];
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      const coworkingInfo = details.coworkingInfo || {};
      price = `${formatPrice(coworkingInfo.seatPrice || property.price || 0)} per seat/month`;
      icons = [
        { icon: <Coffee className="h-3 w-3 mr-1" />, text: `${coworkingInfo.totalSeats || 0} seats` },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${basicDetails.area || property.square_feet || 0} sq.ft` },
        { icon: <Building className="h-3 w-3 mr-1" />, text: coworkingInfo.workspaceType || 'Open Desk' }
      ];
      listingDisplay = "Coworking";
      break;
      
    case FLOW_TYPES.LAND_SALE:
      const landInfo = details.landInfo || {};
      price = formatPrice(landInfo.price || property.price || 0);
      icons = [
        { icon: <Map className="h-3 w-3 mr-1" />, text: `${landInfo.area || property.square_feet || 0} ${landInfo.areaUnit || 'sq.ft'}` },
        { icon: <FileText className="h-3 w-3 mr-1" />, text: landInfo.landType || 'Residential' },
        { icon: <Building className="h-3 w-3 mr-1" />, text: landInfo.ownershipType || 'Freehold' }
      ];
      listingDisplay = "Land for Sale";
      break;
      
    default:
      // Fallback for unknown flow types
      icons = [
        { icon: <Building className="h-3 w-3 mr-1" />, text: propertyType },
        { icon: <Square className="h-3 w-3 mr-1" />, text: `${property.square_feet || 0} sq.ft` }
      ];
      break;
  }
  
  // Handle price edge cases
  if (property.price === 0) {
    price = 'Price on request';
  } else if (property.price === 1) {
    price = 'Contact for price';
  }
  
  return {
    price,
    icons,
    propertyType,
    listingDisplay
  };
}

export default PropertyItem;