// src/modules/seeker/components/NewPropertyCard.tsx
// Version: 1.0.0
// Last Modified: 02-06-2025 15:30 IST
// Purpose: New property card component with modern design for ExploreProperties page

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { SearchResult } from '@/components/Search/types/search.types';
import { 
  Heart, Share2, MapPin, Bed, Bath, Square, Users, 
  Coffee, Building, Home, Calendar, Utensils, Briefcase, FileText, Map,
  Eye, Phone, MessageCircle, Star
} from 'lucide-react';
import { formatPrice } from '../services/seekerService';
import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';
import { 
  formatDetailedLocation,
  detectPropertyFlowType
} from '../utils/propertyTitleUtils';
import { fastImageService } from './PropertyItem/services/fastImageService';

// Union type to handle both formats
type PropertyCardData = PropertyType | SearchResult;

interface NewPropertyCardProps {
  property: PropertyCardData;
  isLiked?: boolean;
  onFavoriteToggle?: (propertyId: string, isLiked: boolean) => Promise<boolean>;
  onShare?: (e: React.MouseEvent, property: PropertyCardData) => void;
  className?: string;
}

// Type guard to check if property is SearchResult
const isSearchResult = (property: PropertyCardData): property is SearchResult => {
  return 'transactionType' in property && !('property_details' in property);
};

const NewPropertyCard: React.FC<NewPropertyCardProps> = ({
  property,
  isLiked = false,
  onFavoriteToggle,
  onShare,
  className = ''
}) => {
  // State for favorite button loading
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        status: (property as any).status || 'active',
        code: (property as any).code || null
      };
    } else {
      // Handle PropertyType format
      const details = property.property_details || {};
      const flowType = detectPropertyFlowType(property);
      
      return {
        id: property.id,
        title: details.flow?.title || property.title || 'Property Listing',
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
        status: property.status || 'active',
        code: details.meta?.code || null
      };
    }
  }, [property]);

  // Generate image URL
  const imageUrl = useMemo(() => {
    try {
      // Method 1: Use primary_image field if available
      if (propertyData.primary_image && propertyData.primary_image.trim()) {
        return fastImageService.getPublicImageUrl(propertyData.id, propertyData.primary_image);
      }
      
      // Method 2: Check if it's PropertyType and has property_images
      if (!isSearchResult(property) && property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
        const primaryImage = property.property_images.find(img => img.isPrimary);
        const imageToUse = primaryImage || property.property_images[0];
        
        if (imageToUse.url && imageToUse.url.startsWith('http')) {
          return imageToUse.url;
        }
        
        if ((imageToUse as any).fileName) {
          return fastImageService.getPublicImageUrl(propertyData.id, (imageToUse as any).fileName);
        }
      }
      
      return '/noimage.png';
    } catch (error) {
      console.error(`Error getting image for property ${propertyData.id}:`, error);
      return '/noimage.png';
    }
  }, [propertyData.id, propertyData.primary_image, property]);

  // Generate display data
  const displayData = useMemo(() => {
    if (isSearchResult(property)) {
      // For SearchResult, create simplified display data
      const formattedPrice = propertyData.transactionType === 'rent' 
        ? `₹${formatPrice(propertyData.price)}/month`
        : `₹${formatPrice(propertyData.price)}`;

      const specs = [];
      
      // Add BHK info if available
      if (propertyData.bhk) {
        const bhkNumber = propertyData.bhk.replace(/\D/g, '');
        if (bhkNumber) {
          specs.push({ icon: Bed, text: `${bhkNumber} BHK` });
        }
      }
      
      // Add area info if available
      if (propertyData.area && propertyData.area > 0) {
        specs.push({ icon: Square, text: `${propertyData.area} sq ft` });
      }
      
      // Add bathrooms if available
      if ((property as any).bathrooms) {
        specs.push({ icon: Bath, text: `${(property as any).bathrooms} Bath` });
      }

      return {
        price: formattedPrice,
        specs,
        propertyType: propertyData.subType || propertyData.propertyType || 'Property',
        transactionType: propertyData.transactionType,
        isForRent: propertyData.transactionType === 'rent'
      };
    } else {
      // Use existing logic for PropertyType
      return getFlowSpecificDisplayData(property, detectPropertyFlowType(property), property.property_details || {});
    }
  }, [property, propertyData]);
  
  // Handle favorite toggle with loading state
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onFavoriteToggle) return;
    
    setIsFavoriteLoading(true);
    
    try {
      await onFavoriteToggle(propertyData.id, isLiked);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Handle share
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onShare) {
      onShare(e, property);
    }
  };

  // Get property link
  const propertyLink = `/properties/${propertyData.id}`;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative">
        <Link to={propertyLink}>
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={propertyData.title || 'Property'}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-105' : ''
              }`}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/noimage.png';
              }}
            />
          </div>
        </Link>
        
        {/* Overlay Elements */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
            displayData.isForRent ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {displayData.isForRent ? 'For Rent' : 'For Sale'}
          </span>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={isFavoriteLoading}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
            />
          </button>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-gray-800 backdrop-blur-sm transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Property Code Badge */}
        {propertyData.code && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
              #{propertyData.code}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {displayData.price}
          </h3>
        </div>

        {/* Title */}
        <Link to={propertyLink}>
          <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {propertyData.title}
          </h4>
        </Link>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{propertyData.location}</span>
        </div>

        {/* Specifications */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {displayData.specs.map((spec, index) => (
            <div key={index} className="flex items-center">
              <spec.icon className="h-4 w-4 mr-1" />
              <span>{spec.text}</span>
            </div>
          ))}
        </div>

        {/* Property Type */}
        <div className="mb-4">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {displayData.propertyType}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            to={propertyLink}
            className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-center"
          >
            View Details
          </Link>
          <button className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Phone className="h-4 w-4 text-gray-600" />
          </button>
          <button className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for PropertyType format (reused from PropertyItem)
function getFlowSpecificDisplayData(property: PropertyType, flowType: string, details: any) {
  const basicDetails = details.basicDetails || {};
  const saleInfo = details.saleInfo || {};
  const rentalInfo = details.rentalInfo || {};
  
  // Default values
  let price = `₹${formatPrice(property.price || 0)}`;
  let specs = [];
  let propertyType = basicDetails.propertyType || property.property_type || 'Apartment';
  let isForRent = flowType.includes('rent');
  
  // Flow-specific logic
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      price = `₹${formatPrice(rentalInfo.rentAmount || property.price || 0)}/month`;
      specs = [
        { icon: Bed, text: `${basicDetails.bhkType?.charAt(0) || property.bedrooms || 0} BHK` },
        { icon: Bath, text: `${basicDetails.bathrooms || property.bathrooms || 0} Bath` },
        { icon: Square, text: `${basicDetails.builtUpArea || property.square_feet || 0} sq ft` }
      ].filter(spec => spec.text !== '0 BHK' && spec.text !== '0 Bath' && spec.text !== '0 sq ft');
      break;
      
    case FLOW_TYPES.RESIDENTIAL_SALE:
      price = `₹${formatPrice(saleInfo.expectedPrice || property.price || 0)}`;
      specs = [
        { icon: Bed, text: `${basicDetails.bhkType?.charAt(0) || property.bedrooms || 0} BHK` },
        { icon: Bath, text: `${basicDetails.bathrooms || property.bathrooms || 0} Bath` },
        { icon: Square, text: `${basicDetails.builtUpArea || property.square_feet || 0} sq ft` }
      ].filter(spec => spec.text !== '0 BHK' && spec.text !== '0 Bath' && spec.text !== '0 sq ft');
      break;
      
    case FLOW_TYPES.COMMERCIAL_RENT:
      const commercialRentalInfo = details.commercialRentalInfo || {};
      price = `₹${formatPrice(commercialRentalInfo.rentAmount || property.price || 0)}/month`;
      specs = [
        { icon: Building, text: basicDetails.commercialType || 'Office' },
        { icon: Square, text: `${basicDetails.area || property.square_feet || 0} sq ft` }
      ];
      break;
      
    case FLOW_TYPES.COMMERCIAL_SALE:
      const commercialSaleInfo = details.commercialSaleInfo || {};
      price = `₹${formatPrice(commercialSaleInfo.salePrice || property.price || 0)}`;
      specs = [
        { icon: Building, text: basicDetails.commercialType || 'Office' },
        { icon: Square, text: `${basicDetails.area || property.square_feet || 0} sq ft` }
      ];
      break;
      
    default:
      specs = [
        { icon: Building, text: propertyType },
        { icon: Square, text: `${property.square_feet || 0} sq ft` }
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
    specs: specs.filter(spec => spec.text && spec.text !== '0 sq ft'),
    propertyType,
    isForRent
  };
}

export default NewPropertyCard;