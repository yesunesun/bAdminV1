// src/modules/seeker/components/PropertyItem.tsx
// Version: 4.0.0
// Last Modified: 21-05-2025 10:15 IST
// Purpose: Updated to use the propertyTitleUtils for consistent title generation

import React from 'react';
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
  cleanupPropertyTitle, 
  formatDetailedLocation,
  detectPropertyFlowType
} from '../utils/propertyTitleUtils';

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
  // Extract details from property
  const details = property.property_details || {};
  
  // Use utility functions to determine flow type and generate title
  const flowType = detectPropertyFlowType(property);
  const title = cleanupPropertyTitle(property);
  const detailedLocation = formatDetailedLocation(property);
  
  // Get display data specific to the flow type
  const displayData = getFlowSpecificDisplayData(property, flowType, details);
  
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
        {/* Property Name at the top with blue text - using standardized template */}
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
          {/* Property image */}
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={propertyImage}
              alt={title || 'Property'}
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
            {/* Location with icon - showing flat/plot number here instead of in title */}
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
              {/* Property Type Badge - Using a lighter color (gray-500) */}
              <div className="inline-block text-xs text-white px-2 py-0.5 rounded bg-gray-500">
                {displayData.propertyType}
              </div>
              
              {/* Listing Type Badge (Rent/Sale) */}
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

// Helper function to get flow-specific display data using exact field names
function getFlowSpecificDisplayData(property: PropertyType, flowType: string, details: any) {
  const basicDetails = details.basicDetails || {};
  const saleInfo = details.saleInfo || {};
  const rentalInfo = details.rentalInfo || {};
  
  // Default values
  let price = formatPrice(property.price || 0);
  let icons = [];
  let propertyType = basicDetails.propertyType || property.property_type || 'Apartment';
  let listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  
  // Flow-specific customizations
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      // Price: ₹25,000 per month
      price = `${formatPrice(rentalInfo.rentAmount || property.price || 0)} per month`;
      
      // Icons
      icons = [
        { 
          icon: <Bed className="h-3 w-3 mr-1" />, 
          text: basicDetails.bhkType?.charAt(0) || property.bedrooms || 0 
        },
        { 
          icon: <Bath className="h-3 w-3 mr-1" />, 
          text: basicDetails.bathrooms || property.bathrooms || 0 
        },
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add furnishing status if available
      if (rentalInfo.furnishingStatus) {
        icons.push({ 
          icon: <Home className="h-3 w-3 mr-1" />, 
          text: rentalInfo.furnishingStatus 
        });
      }
      
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_SALE:
      // Price: ₹1.2 Cr
      price = formatPrice(saleInfo.expectedPrice || property.price || 0);
      
      // Icons
      icons = [
        { 
          icon: <Bed className="h-3 w-3 mr-1" />, 
          text: basicDetails.bhkType?.charAt(0) || property.bedrooms || 0 
        },
        { 
          icon: <Bath className="h-3 w-3 mr-1" />, 
          text: basicDetails.bathrooms || property.bathrooms || 0 
        },
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add property age if available
      if (basicDetails.propertyAge) {
        icons.push({ 
          icon: <Calendar className="h-3 w-3 mr-1" />, 
          text: basicDetails.propertyAge 
        });
      }
      
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      // Price: ₹8,500 per month
      price = `${formatPrice(rentalInfo.rentAmount || property.price || 0)} per month`;
      
      // Icons
      icons = [
        { 
          icon: <Users className="h-3 w-3 mr-1" />, 
          text: details.flatmateDetails?.currentFlatmates || '2 roommates' 
        },
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add gender preference if available
      if (details.flatmateDetails?.preferredGender) {
        icons.push({ 
          icon: <Users className="h-3 w-3 mr-1" />, 
          text: details.flatmateDetails.preferredGender 
        });
      }
      
      propertyType = "Shared Room";
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      // Price: ₹12,000 per month
      price = `${formatPrice(details.pgDetails?.rentAmount || property.price || 0)} per month`;
      
      // Icons
      icons = [
        { 
          icon: <Bed className="h-3 w-3 mr-1" />, 
          text: details.pgDetails?.roomType || 'Single Sharing' 
        }
      ];
      
      // Add food included if available
      if (details.pgDetails?.foodIncluded) {
        icons.push({ 
          icon: <Utensils className="h-3 w-3 mr-1" />, 
          text: 'Food Included' 
        });
      }
      
      // Add tenant preference if available
      if (details.pgDetails?.preferredTenants) {
        icons.push({ 
          icon: <Users className="h-3 w-3 mr-1" />, 
          text: details.pgDetails.preferredTenants 
        });
      }
      
      propertyType = "PG/Hostel";
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.COMMERCIAL_RENT:
      // Price: ₹85,000 per month
      price = `${formatPrice(rentalInfo.rentAmount || property.price || 0)} per month`;
      
      // Icons
      icons = [
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add property usage if available
      if (details.commercialDetails?.propertyUsage) {
        icons.push({ 
          icon: <Building className="h-3 w-3 mr-1" />, 
          text: details.commercialDetails.propertyUsage 
        });
      }
      
      // Add furnishing status if available
      if (rentalInfo.furnishingStatus) {
        icons.push({ 
          icon: <Home className="h-3 w-3 mr-1" />, 
          text: rentalInfo.furnishingStatus 
        });
      }
      
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.COMMERCIAL_SALE:
      // Price: ₹2.5 Cr
      price = formatPrice(saleInfo.expectedPrice || property.price || 0);
      
      // Icons
      icons = [
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add property age if available
      if (basicDetails.propertyAge) {
        icons.push({ 
          icon: <Calendar className="h-3 w-3 mr-1" />, 
          text: basicDetails.propertyAge 
        });
      }
      
      // Add floor information if available
      if (details.commercialDetails?.floorNumber) {
        icons.push({ 
          icon: <Building className="h-3 w-3 mr-1" />, 
          text: `Floor ${details.commercialDetails.floorNumber}` 
        });
      }
      
      listingDisplay = "For Sale";
      break;
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      // Price: ₹7,500 per seat/month
      price = `${formatPrice(details.coworkingDetails?.seatPrice || property.price || 0)} per seat/month`;
      
      // Icons
      const seatsCount = details.coworkingDetails?.totalWorkstations || 'Multiple';
      icons = [
        { 
          icon: <Users className="h-3 w-3 mr-1" />, 
          text: `${seatsCount} seats` 
        },
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${basicDetails.builtUpArea || property.square_feet || 0} ${basicDetails.builtUpAreaUnit || 'sq.ft'}` 
        }
      ];
      
      // Add amenities if available
      if (details.coworkingDetails?.amenities?.length > 0) {
        icons.push({ 
          icon: <Coffee className="h-3 w-3 mr-1" />, 
          text: 'Amenities' 
        });
      }
      
      propertyType = "Coworking Space";
      listingDisplay = "For Rent";
      break;
      
    case FLOW_TYPES.LAND_SALE:
      // Price: ₹55,00,000
      price = formatPrice(saleInfo.expectedPrice || property.price || 0);
      
      // Icons
      const landArea = details.landDetails?.plotArea || basicDetails.builtUpArea || property.square_feet || 0;
      const landUnit = details.landDetails?.plotAreaUnit || basicDetails.builtUpAreaUnit || 'sq.ft';
      icons = [
        { 
          icon: <Square className="h-3 w-3 mr-1" />, 
          text: `${landArea} ${landUnit}` 
        }
      ];
      
      // Add approvals if available
      if (details.landDetails?.approvals?.length > 0) {
        icons.push({ 
          icon: <FileText className="h-3 w-3 mr-1" />, 
          text: Array.isArray(details.landDetails.approvals) ? 
                details.landDetails.approvals[0] : 'Approved' 
        });
      }
      
      // Add land type if available
      if (details.landDetails?.landType) {
        icons.push({ 
          icon: <Map className="h-3 w-3 mr-1" />, 
          text: details.landDetails.landType 
        });
      }
      
      propertyType = details.landDetails?.landType || "Land/Plot";
      listingDisplay = "For Sale";
      break;
  }
  
  // If the price is 0 or 1, it's likely a test/placeholder property
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