// src/modules/seeker/components/PropertyItem.tsx
// Version: 6.2.0
// Last Modified: 02-06-2025 16:20 IST
// Purpose: Implemented comprehensive conditional rendering for all fields

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
import { 
  isValidStringField, 
  isValidNumberField, 
  formatArea, 
  formatRoomCount, 
  formatLocation 
} from '../services/utilityService';
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
        title: isValidStringField(property.title) ? property.title : '',
        location: isValidStringField(property.location) ? property.location : '',
        price: isValidNumberField(property.price) ? property.price : null,
        propertyType: isValidStringField(property.propertyType) ? property.propertyType : '',
        transactionType: isValidStringField(property.transactionType) ? property.transactionType : '',
        subType: isValidStringField((property as any).subType) ? (property as any).subType : '',
        bhk: isValidStringField((property as any).bhk) ? (property as any).bhk : '',
        area: isValidNumberField((property as any).area) ? (property as any).area : null,
        ownerName: isValidStringField((property as any).ownerName) ? (property as any).ownerName : '',
        primary_image: isValidStringField((property as any).primary_image) ? (property as any).primary_image : null,
        createdAt: isValidStringField((property as any).createdAt) ? (property as any).createdAt : '',
        status: isValidStringField((property as any).status) ? (property as any).status : 'active'
      };
    } else {
      // Handle PropertyType format (legacy)
      const details = property.property_details || {};
      const flowType = detectPropertyFlowType(property);
      
      return {
        id: property.id,
        title: isValidStringField(details.flow?.title) ? details.flow.title : 'Property Listing',
        location: formatDetailedLocation(property),
        price: isValidNumberField(property.price) ? property.price : null,
        propertyType: isValidStringField(property.property_type) ? property.property_type : 'residential',
        transactionType: flowType.includes('sale') ? 'buy' : 'rent',
        subType: isValidStringField(details.basicDetails?.propertyType) ? details.basicDetails.propertyType : '',
        bhk: isValidStringField(details.basicDetails?.bhkType) ? details.basicDetails.bhkType : '',
        area: isValidNumberField(details.basicDetails?.builtUpArea || property.square_feet) ? 
               (details.basicDetails?.builtUpArea || property.square_feet) : null,
        ownerName: 'Property Owner',
        primary_image: isValidStringField(property.primary_image) ? property.primary_image : null,
        createdAt: isValidStringField(property.created_at) ? property.created_at : '',
        status: isValidStringField(property.status) ? property.status : 'active'
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
      // For SearchResult, create simplified display data with conditional rendering
      const formattedPrice = propertyData.price ? 
        (propertyData.transactionType === 'rent' 
          ? `${formatPrice(propertyData.price)} per month`
          : formatPrice(propertyData.price)) : '';

      const icons = [];
      
      // Add BHK info if available
      if (propertyData.bhk) {
        const bhkNumber = propertyData.bhk.replace(/\D/g, '');
        if (bhkNumber) {
          icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: `${bhkNumber} BHK` });
        }
      }
      
      // Add area info if available
      if (propertyData.area) {
        const areaText = formatArea(propertyData.area);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      // Add property type icon
      if (propertyData.propertyType || propertyData.subType) {
        const propertyTypeIcon = propertyData.propertyType === 'commercial' ? Building : Home;
        const typeText = propertyData.subType || propertyData.propertyType;
        if (typeText) {
          icons.push({ 
            icon: React.createElement(propertyTypeIcon, { className: "h-3 w-3 mr-1" }), 
            text: typeText 
          });
        }
      }

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
      className={`
        relative transition-all duration-300 
        ${isHovered ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 shadow-md' : 'hover:bg-muted/30'}
        hover:shadow-lg rounded-xl mx-2 my-1
      `}
    >
      {/* Enhanced Favorite Button - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          initialIsLiked={isLiked}
          onToggle={handleFavoriteToggle}
          isLoading={isFavoriteLoading}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
        />
      </div>

      <div className="p-4"
        onMouseEnter={() => onHover(propertyData.id, true)}
        onMouseLeave={() => onHover(propertyData.id, false)}
        onClick={() => onSelect(property)}
      >
        {/* Enhanced Property Name with conditional rendering */}
        {propertyData.title && (
          <div className="mb-3">
            <Link
              to={`/seeker/property/${propertyData.id}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate block transition-colors duration-200"
            >
              {propertyData.title}
            </Link>
          </div>
        )}
        
        <Link 
          to={`/seeker/property/${propertyData.id}`} 
          className="flex gap-3 group"
        >
          {/* Enhanced Property image with better styling */}
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <img
              src={imageUrl}
              alt={propertyData.title || 'Property'}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/noimage.png';
              }}
            />
            {/* Enhanced image overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-xl"></div>
          </div>
          
          {/* Enhanced Property details with improved spacing */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Enhanced Location with conditional rendering */}
            {propertyData.location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0 text-blue-500" />
                <span className="truncate font-medium">
                  {propertyData.location}
                </span>
              </div>
            )}
            
            {/* Enhanced Price with conditional rendering */}
            {displayData.price && (
              <p className="text-sm font-bold text-foreground">
                {displayData.price}
              </p>
            )}
            
            {/* Enhanced Property specs with conditional rendering */}
            {displayData.icons.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {displayData.icons.map((icon, index) => (
                  <span key={index} className="flex items-center hover:text-foreground transition-colors duration-200">
                    <span className="text-blue-500">{icon.icon}</span>
                    <span className="whitespace-nowrap font-medium">{icon.text}</span>
                  </span>
                ))}
              </div>
            )}
            
            {/* Enhanced Property Type and Listing Type Badges with conditional rendering */}
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Enhanced Property Type Badge */}
              {displayData.propertyType && (
                <div className="inline-flex items-center text-xs text-white px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 font-medium shadow-sm">
                  {displayData.propertyType}
                </div>
              )}
              
              {/* Enhanced Listing Type Badge */}
              {displayData.listingDisplay && (
                <div className={`
                  inline-flex items-center text-xs text-white px-2.5 py-1 rounded-full font-medium shadow-sm
                  ${displayData.listingDisplay.toLowerCase().includes('rent') 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                  }
                `}>
                  {displayData.listingDisplay}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Chevron icon with hover animation */}
          <div className="self-center flex-shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </Link>
      </div>
    </div>
  );
};

// Enhanced helper function for PropertyType format with conditional rendering
function getFlowSpecificDisplayData(property: PropertyType, flowType: string, details: any) {
  const basicDetails = details.basicDetails || {};
  const saleInfo = details.saleInfo || {};
  const rentalInfo = details.rentalInfo || {};
  
  // Default values with conditional checks
  let price = '';
  let icons = [];
  let propertyType = '';
  let listingDisplay = '';
  
  // Only set if valid
  if (isValidNumberField(property.price)) {
    price = formatPrice(property.price);
  }
  
  if (isValidStringField(basicDetails.propertyType) || isValidStringField(property.property_type)) {
    propertyType = basicDetails.propertyType || property.property_type;
  }
  
  if (flowType) {
    listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  }
  
  // Flow-specific logic with conditional rendering
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      if (isValidNumberField(rentalInfo.rentAmount || property.price)) {
        price = `${formatPrice(rentalInfo.rentAmount || property.price)} per month`;
      }
      
      // Only add icons if data exists
      if (isValidStringField(basicDetails.bhkType) || isValidNumberField(property.bedrooms)) {
        const bhkText = basicDetails.bhkType?.charAt(0) || property.bedrooms;
        if (bhkText) {
          icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: bhkText });
        }
      }
      
      if (isValidNumberField(basicDetails.bathrooms || property.bathrooms)) {
        icons.push({ icon: <Bath className="h-3 w-3 mr-1" />, text: basicDetails.bathrooms || property.bathrooms });
      }
      
      if (isValidNumberField(basicDetails.builtUpArea || property.square_feet)) {
        const areaText = formatArea(basicDetails.builtUpArea || property.square_feet, basicDetails.builtUpAreaUnit);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      if (isValidStringField(rentalInfo.furnishingStatus)) {
        icons.push({ icon: <Home className="h-3 w-3 mr-1" />, text: rentalInfo.furnishingStatus });
      }
      
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_SALE:
      if (isValidNumberField(saleInfo.expectedPrice || property.price)) {
        price = formatPrice(saleInfo.expectedPrice || property.price);
      }
      
      // Only add icons if data exists
      if (isValidStringField(basicDetails.bhkType) || isValidNumberField(property.bedrooms)) {
        const bhkText = basicDetails.bhkType?.charAt(0) || property.bedrooms;
        if (bhkText) {
          icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: bhkText });
        }
      }
      
      if (isValidNumberField(basicDetails.bathrooms || property.bathrooms)) {
        icons.push({ icon: <Bath className="h-3 w-3 mr-1" />, text: basicDetails.bathrooms || property.bathrooms });
      }
      
      if (isValidNumberField(basicDetails.builtUpArea || property.square_feet)) {
        const areaText = formatArea(basicDetails.builtUpArea || property.square_feet, basicDetails.builtUpAreaUnit);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      const flatmateInfo = details.flatmateInfo || {};
      if (isValidNumberField(flatmateInfo.rent || property.price)) {
        price = `${formatPrice(flatmateInfo.rent || property.price)} per month`;
      }
      
      if (isValidNumberField(flatmateInfo.totalFlatmates)) {
        icons.push({ icon: <Users className="h-3 w-3 mr-1" />, text: `${flatmateInfo.totalFlatmates} flatmates` });
      }
      
      if (isValidStringField(flatmateInfo.roomType)) {
        icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: flatmateInfo.roomType });
      }
      
      if (isValidStringField(flatmateInfo.foodPreference)) {
        icons.push({ icon: <Utensils className="h-3 w-3 mr-1" />, text: flatmateInfo.foodPreference });
      }
      
      listingDisplay = "Flatmates";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      const pgInfo = details.pgInfo || {};
      if (isValidNumberField(pgInfo.rent || property.price)) {
        price = `${formatPrice(pgInfo.rent || property.price)} per month`;
      }
      
      if (isValidStringField(pgInfo.genderPreference)) {
        icons.push({ icon: <Users className="h-3 w-3 mr-1" />, text: pgInfo.genderPreference });
      }
      
      if (isValidStringField(pgInfo.roomType)) {
        icons.push({ icon: <Bed className="h-3 w-3 mr-1" />, text: pgInfo.roomType });
      }
      
      if (pgInfo.foodIncluded !== undefined) {
        icons.push({ icon: <Utensils className="h-3 w-3 mr-1" />, text: pgInfo.foodIncluded ? 'Food Included' : 'No Food' });
      }
      
      listingDisplay = "PG/Hostel";
      break;
      
    case FLOW_TYPES.COMMERCIAL_RENT:
      const commercialRentalInfo = details.commercialRentalInfo || {};
      if (isValidNumberField(commercialRentalInfo.rentAmount || property.price)) {
        price = `${formatPrice(commercialRentalInfo.rentAmount || property.price)} per month`;
      }
      
      if (isValidStringField(basicDetails.commercialType)) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: basicDetails.commercialType });
      }
      
      if (isValidNumberField(basicDetails.area || property.square_feet)) {
        const areaText = formatArea(basicDetails.area || property.square_feet);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      if (isValidStringField(commercialRentalInfo.suitableFor)) {
        icons.push({ icon: <Briefcase className="h-3 w-3 mr-1" />, text: commercialRentalInfo.suitableFor });
      }
      
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.COMMERCIAL_SALE:
      const commercialSaleInfo = details.commercialSaleInfo || {};
      if (isValidNumberField(commercialSaleInfo.salePrice || property.price)) {
        price = formatPrice(commercialSaleInfo.salePrice || property.price);
      }
      
      if (isValidStringField(basicDetails.commercialType)) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: basicDetails.commercialType });
      }
      
      if (isValidNumberField(basicDetails.area || property.square_feet)) {
        const areaText = formatArea(basicDetails.area || property.square_feet);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      if (isValidStringField(commercialSaleInfo.ownershipType)) {
        icons.push({ icon: <FileText className="h-3 w-3 mr-1" />, text: commercialSaleInfo.ownershipType });
      }
      
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      const coworkingInfo = details.coworkingInfo || {};
      if (isValidNumberField(coworkingInfo.seatPrice || property.price)) {
        price = `${formatPrice(coworkingInfo.seatPrice || property.price)} per seat/month`;
      }
      
      if (isValidNumberField(coworkingInfo.totalSeats)) {
        icons.push({ icon: <Coffee className="h-3 w-3 mr-1" />, text: `${coworkingInfo.totalSeats} seats` });
      }
      
      if (isValidNumberField(basicDetails.area || property.square_feet)) {
        const areaText = formatArea(basicDetails.area || property.square_feet);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      if (isValidStringField(coworkingInfo.workspaceType)) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: coworkingInfo.workspaceType });
      }
      
      listingDisplay = "Coworking";
      break;
      
    case FLOW_TYPES.LAND_SALE:
      const landInfo = details.landInfo || {};
      if (isValidNumberField(landInfo.price || property.price)) {
        price = formatPrice(landInfo.price || property.price);
      }
      
      if (isValidNumberField(landInfo.area || property.square_feet)) {
        const areaText = formatArea(landInfo.area || property.square_feet, landInfo.areaUnit);
        if (areaText) {
          icons.push({ icon: <Map className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      
      if (isValidStringField(landInfo.landType)) {
        icons.push({ icon: <FileText className="h-3 w-3 mr-1" />, text: landInfo.landType });
      }
      
      if (isValidStringField(landInfo.ownershipType)) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: landInfo.ownershipType });
      }
      
      listingDisplay = "Land for Sale";
      break;
      
    default:
      // Fallback for unknown flow types - only show if data exists
      if (propertyType) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: propertyType });
      }
      
      if (isValidNumberField(property.square_feet)) {
        const areaText = formatArea(property.square_feet);
        if (areaText) {
          icons.push({ icon: <Square className="h-3 w-3 mr-1" />, text: areaText });
        }
      }
      break;
  }
  
  // Handle special price cases - only show if there's meaningful data
  if (!price) {
    if (property.price === 0) {
      price = 'Price on request';
    } else if (property.price === 1) {
      price = 'Contact for price';
    }
  }
  
  return {
    price,
    icons,
    propertyType,
    listingDisplay
  };
}

export default PropertyItem;