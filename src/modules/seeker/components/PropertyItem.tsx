// src/modules/seeker/components/PropertyItem.tsx
// Version: 6.0.0
// Last Modified: 01-06-2025 23:00 IST
// Purpose: Updated to handle both PropertyType and SearchResult formats

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { SearchResult } from '@/components/Search/types/search.types';
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

// Union type to handle both formats
type PropertyItemData = PropertyType | SearchResult;

interface PropertyItemProps {
  property: PropertyItemData;
  isLiked: boolean;
  isHovered: boolean;
  propertyImage?: string; // Legacy prop - ignored now
  onHover: (propertyId: string, isHovering: boolean) => void;
  onSelect: (property: PropertyItemData) => void;
  onFavoriteToggle: (propertyId: string, isLiked: boolean) => Promise<boolean>;
  onShare: (e: React.MouseEvent, property: PropertyItemData) => void;
}

// Type guard to check if property is SearchResult
const isSearchResult = (property: PropertyItemData): property is SearchResult => {
  return 'transactionType' in property && !('property_details' in property);
};

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

  // Extract data based on property type
  const propertyData = useMemo(() => {
    if (isSearchResult(property)) {
      // Handle SearchResult format
      return {
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        propertyType: property.propertyType,
        transactionType: property.transactionType,
        subType: (property as any).subType || '',
        bhk: (property as any).bhk || '',
        area: (property as any).area || 0,
        ownerName: (property as any).ownerName || 'Property Owner',
        primary_image: (property as any).primary_image || null,
        createdAt: (property as any).createdAt || '',
        status: (property as any).status || 'active'
      };
    } else {
      // Handle PropertyType format (legacy)
      const details = property.property_details || {};
      const flowType = detectPropertyFlowType(property);
      
      return {
        id: property.id,
        title: details.flow?.title || 'Property Listing',
        location: formatDetailedLocation(property),
        price: property.price || 0,
        propertyType: property.property_type || 'residential',
        transactionType: flowType.includes('sale') ? 'buy' : 'rent',
        subType: details.basicDetails?.propertyType || '',
        bhk: details.basicDetails?.bhkType || '',
        area: details.basicDetails?.builtUpArea || property.square_feet || 0,
        ownerName: 'Property Owner',
        primary_image: property.primary_image || null,
        createdAt: property.created_at || '',
        status: property.status || 'active'
      };
    }
  }, [property]);

  // Generate image URL
  const imageUrl = useMemo(() => {
    try {
      console.log(`[PropertyItem] Processing image for property ${propertyData.id}`);
      
      // Method 1: Use primary_image field if available
      if (propertyData.primary_image && propertyData.primary_image.trim()) {
        const constructedUrl = fastImageService.getPublicImageUrl(propertyData.id, propertyData.primary_image);
        console.log(`[PropertyItem] ✓ Using primary_image '${propertyData.primary_image}' -> ${constructedUrl}`);
        return constructedUrl;
      }
      
      // Method 2: Check if it's PropertyType and has property_images
      if (!isSearchResult(property) && property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
        console.log(`[PropertyItem] ✓ Found property_images array with ${property.property_images.length} images`);
        const primaryImage = property.property_images.find(img => img.is_primary);
        const imageToUse = primaryImage || property.property_images[0];
        
        if (imageToUse.url && imageToUse.url.startsWith('http')) {
          console.log(`[PropertyItem] ✓ Using full URL:`, imageToUse.url);
          return imageToUse.url;
        }
        
        if (imageToUse.fileName) {
          const constructedUrl = fastImageService.getPublicImageUrl(propertyData.id, imageToUse.fileName);
          console.log(`[PropertyItem] ✓ Constructed URL from fileName '${imageToUse.fileName}':`, constructedUrl);
          return constructedUrl;
        }
      }
      
      // Method 3: Legacy property_details support
      if (!isSearchResult(property)) {
        const details = property.property_details || {};
        if (details.primaryImage) {
          console.log(`[PropertyItem] ✓ Found details.primaryImage:`, details.primaryImage);
          if (details.primaryImage.startsWith('http') || details.primaryImage.startsWith('/')) {
            return details.primaryImage;
          }
          return fastImageService.getPublicImageUrl(propertyData.id, details.primaryImage);
        }
      }
      
      console.log(`[PropertyItem] ❌ No image found, using fallback`);
      return '/noimage.png';
    } catch (error) {
      console.error(`[PropertyItem] Error getting image for property ${propertyData.id}:`, error);
      return '/noimage.png';
    }
  }, [propertyData.id, propertyData.primary_image, property]);

  // Generate display data for SearchResult
  const displayData = useMemo(() => {
    if (isSearchResult(property)) {
      // For SearchResult, create simplified display data
      const formattedPrice = propertyData.transactionType === 'rent' 
        ? `${formatPrice(propertyData.price)} per month`
        : formatPrice(propertyData.price);

      const icons = [];
      
      // Add BHK info if available
      if (propertyData.bhk) {
        const bhkNumber = propertyData.bhk.replace(/\D/g, '');
        if (bhkNumber) {
          icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: `${bhkNumber} BHK` });
        }
      }
      
      // Add area info if available
      if (propertyData.area && propertyData.area > 0) {
        icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: `${propertyData.area} sq.ft` });
      }
      
      // Add property type icon
      const propertyTypeIcon = propertyData.propertyType === 'commercial' ? Building : Home;
      icons.push({ icon: React.createElement(propertyTypeIcon, { className: "h-3 w-3 mr-1" }), text: propertyData.subType || propertyData.propertyType });

      return {
        price: formattedPrice,
        icons,
        propertyType: propertyData.subType || propertyData.propertyType || 'Property',
        listingDisplay: propertyData.transactionType === 'buy' ? 'For Sale' : 'For Rent'
      };
    } else {
      // Use existing logic for PropertyType
      return getFlowSpecificDisplayData(property, detectPropertyFlowType(property), property.property_details || {});
    }
  }, [property, propertyData]);
  
  // Handle favorite toggle with loading state
  const handleFavoriteToggle = async (isLiked: boolean) => {
    setIsFavoriteLoading(true);
    
    try {
      const success = await onFavoriteToggle(propertyData.id, isLiked);
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
      key={`property-${propertyData.id}`}
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
        onMouseEnter={() => onHover(propertyData.id, true)}
        onMouseLeave={() => onHover(propertyData.id, false)}
        onClick={() => onSelect(property)}
      >
        {/* Property Name at the top with blue text */}
        <div className="mb-2">
          <Link
            to={`/seeker/property/${propertyData.id}`}
            className="text-sm font-medium text-blue-500 hover:underline truncate block"
          >
            {propertyData.title}
          </Link>
        </div>
        
        <Link 
          to={`/seeker/property/${propertyData.id}`} 
          className="flex gap-2"
        >
          {/* Property image */}
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={propertyData.title || 'Property'}
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
                {propertyData.location}
              </span>
            </div>
            
            {/* Price */}
            <p className="text-sm font-semibold mb-2">
              {displayData.price}
            </p>
            
            {/* Property specs */}
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

// Keep the existing helper function for PropertyType format
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