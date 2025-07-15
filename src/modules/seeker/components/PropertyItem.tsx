// src/modules/seeker/components/PropertyItem.tsx
// Version: 6.4.0
// Last Modified: 08-06-2025 18:45 IST
// Purpose: FIXED real-time favorites count update - now uses FavoritesContext directly

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { SearchResult } from '@/components/Search/types/search.types';
import { 
  MapPin, Bed, Bath, Square, Users, 
  Coffee, Building, Home, Calendar, Utensils, Briefcase, FileText, Map,
  Clock, CheckCircle, AlertCircle, Star, Wifi, Car
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
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Union type to handle both formats
type PropertyItemData = PropertyType | SearchResult;

interface PropertyItemProps {
  property: PropertyItemData;
  isLiked?: boolean; // Made optional since we'll get this from context
  isHovered: boolean;
  propertyImage?: string; // Legacy prop - ignored now
  onHover: (propertyId: string, isHovering: boolean) => void;
  onSelect: (property: PropertyItemData) => void;
  onFavoriteToggle?: (propertyId: string, isLiked: boolean) => Promise<boolean>; // Made optional
  onShare: (e: React.MouseEvent, property: PropertyItemData) => void;
}

// Type guard to check if property is SearchResult
const isSearchResult = (property: PropertyItemData): property is SearchResult => {
  return 'transactionType' in property && !('property_details' in property);
};

// Helper function to format property age
const formatPropertyAge = (createdAt: string): string => {
  if (!createdAt) return '';
  
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Posted today';
  if (diffInDays === 1) return 'Posted yesterday';
  if (diffInDays < 7) return `Posted ${diffInDays} days ago`;
  if (diffInDays < 30) return `Posted ${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `Posted ${Math.floor(diffInDays / 30)} months ago`;
  return `Posted ${Math.floor(diffInDays / 365)} years ago`;
};

// Helper function to get property status
const getPropertyStatus = (property: PropertyItemData): { status: string; icon: React.ReactNode; color: string } => {
  const status = isSearchResult(property) ? property.status : property.status;
  
  switch (status?.toLowerCase()) {
    case 'active':
      return { status: 'Available', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' };
    case 'inactive':
      return { status: 'Not Available', icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-600' };
    case 'pending':
      return { status: 'Under Review', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600' };
    default:
      return { status: 'Available', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' };
  }
};

// Helper function to extract key amenities/features including furnishing and tenant preferences
const getPropertyAmenities = (property: PropertyItemData, propertyId: string): Array<{ icon: React.ReactNode; text: string }> => {
  const amenities = [];
  
  if (!isSearchResult(property)) {
    const details = property.property_details || {};
    const basicDetails = details.basicDetails || {};
    const rentalInfo = details.rentalInfo || {};
    const pgInfo = details.pgInfo || {};
    const flatmateInfo = details.flatmateInfo || {};
    
    // Check for parking
    if (basicDetails.parking || basicDetails.parkingAvailable) {
      amenities.push({ icon: <Car className="h-3 w-3" />, text: 'Parking' });
    }
    
    // Check for furnished status - Priority display
    if (basicDetails.furnishingStatus === 'fully_furnished') {
      amenities.push({ icon: <Star className="h-3 w-3" />, text: 'Fully Furnished' });
    } else if (basicDetails.furnishingStatus === 'semi_furnished') {
      amenities.push({ icon: <Star className="h-3 w-3" />, text: 'Semi Furnished' });
    } else if (basicDetails.furnishingStatus === 'unfurnished') {
      amenities.push({ icon: <Home className="h-3 w-3" />, text: 'Unfurnished' });
    } else {
      // TODO: Remove this demo data once properties have real furnishing data
      // Adding demo furnishing data for demonstration
      const demoFurnishing = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
      const randomFurnishing = demoFurnishing[Math.floor(propertyId.length) % 3];
      const icon = randomFurnishing === 'Unfurnished' ? <Home className="h-3 w-3" /> : <Star className="h-3 w-3" />;
      amenities.push({ icon, text: randomFurnishing });
    }
    
    // Check for preferred tenants - Priority display
    if (rentalInfo.preferredTenants) {
      let tenantText = '';
      switch (rentalInfo.preferredTenants) {
        case 'family':
          tenantText = 'Family Preferred';
          break;
        case 'bachelor':
          tenantText = 'Bachelors Only';
          break;
        case 'working_professionals':
          tenantText = 'Working Professionals';
          break;
        case 'students':
          tenantText = 'Students Welcome';
          break;
        case 'any':
          tenantText = 'Any Tenant';
          break;
        default:
          tenantText = rentalInfo.preferredTenants;
      }
      if (tenantText) {
        amenities.push({ icon: <Users className="h-3 w-3" />, text: tenantText });
      }
    } else {
      // TODO: Remove this demo data once properties have real tenant preference data
      // Adding demo tenant preference data for demonstration (only for rental properties)
      if (property.property_type === 'residential') {
        const demoTenants = ['Family Preferred', 'Bachelors Only', 'Working Professionals', 'Students Welcome'];
        const randomTenant = demoTenants[Math.floor(propertyId.length) % 4];
        amenities.push({ icon: <Users className="h-3 w-3" />, text: randomTenant });
      }
    }
    
    // For PG/Hostel - gender preference as tenant type
    if (pgInfo.genderPreference) {
      let genderText = '';
      switch (pgInfo.genderPreference) {
        case 'male':
          genderText = 'Boys Only';
          break;
        case 'female':
          genderText = 'Girls Only';
          break;
        case 'both':
          genderText = 'Boys & Girls';
          break;
        default:
          genderText = pgInfo.genderPreference;
      }
      amenities.push({ icon: <Users className="h-3 w-3" />, text: genderText });
    }
    
    // For Flatmates - gender preference
    if (flatmateInfo.preferredGender) {
      let genderText = '';
      switch (flatmateInfo.preferredGender) {
        case 'male':
          genderText = 'Male Flatmate';
          break;
        case 'female':
          genderText = 'Female Flatmate';
          break;
        case 'any':
          genderText = 'Any Gender';
          break;
        default:
          genderText = flatmateInfo.preferredGender;
      }
      amenities.push({ icon: <Users className="h-3 w-3" />, text: genderText });
    }
    
    // Check for wifi/internet (common in modern properties)
    if (basicDetails.internet || basicDetails.wifi) {
      amenities.push({ icon: <Wifi className="h-3 w-3" />, text: 'WiFi' });
    }
    
    // For commercial properties, add business-relevant features
    if (property.property_type === 'commercial') {
      amenities.push({ icon: <Briefcase className="h-3 w-3" />, text: 'Business' });
    }
  } else {
    // Handle SearchResult format - extract furnishing and tenant info if available
    const searchProperty = property as any;
    
    // Extract amenity data from search results
    
    // Check for furnishing status in search results
    if (searchProperty.furnishingStatus) {
      let furnishingText = '';
      switch (searchProperty.furnishingStatus) {
        case 'fully_furnished':
          furnishingText = 'Fully Furnished';
          break;
        case 'semi_furnished':
          furnishingText = 'Semi Furnished';
          break;
        case 'unfurnished':
          furnishingText = 'Unfurnished';
          break;
        default:
          furnishingText = searchProperty.furnishingStatus;
      }
      if (furnishingText) {
        amenities.push({ icon: <Star className="h-3 w-3" />, text: furnishingText });
      }
    } else {
      // TODO: Remove this demo data once properties have real furnishing data
      // Adding demo furnishing data for demonstration
      const demoFurnishing = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
      const randomFurnishing = demoFurnishing[Math.floor(propertyId.length) % 3];
      amenities.push({ icon: <Star className="h-3 w-3" />, text: randomFurnishing });
    }
    
    // Check for preferred tenants in search results
    if (searchProperty.preferredTenants) {
      let tenantText = '';
      switch (searchProperty.preferredTenants) {
        case 'family':
          tenantText = 'Family Preferred';
          break;
        case 'bachelor':
          tenantText = 'Bachelors Only';
          break;
        case 'working_professionals':
          tenantText = 'Working Professionals';
          break;
        case 'students':
          tenantText = 'Students Welcome';
          break;
        case 'any':
          tenantText = 'Any Tenant';
          break;
        default:
          tenantText = searchProperty.preferredTenants;
      }
      if (tenantText) {
        amenities.push({ icon: <Users className="h-3 w-3" />, text: tenantText });
      }
    } else {
      // TODO: Remove this demo data once properties have real tenant preference data
      // Adding demo tenant preference data for demonstration
      const demoTenants = ['Family Preferred', 'Bachelors Only', 'Working Professionals', 'Students Welcome'];
      const randomTenant = demoTenants[Math.floor(propertyId.length) % 4];
      amenities.push({ icon: <Users className="h-3 w-3" />, text: randomTenant });
    }
    
    // Check for parking in search results
    if (searchProperty.parking || searchProperty.parkingAvailable) {
      amenities.push({ icon: <Car className="h-3 w-3" />, text: 'Parking' });
    }
    
    // Check for wifi in search results
    if (searchProperty.internet || searchProperty.wifi) {
      amenities.push({ icon: <Wifi className="h-3 w-3" />, text: 'WiFi' });
    }
  }
  
  return amenities;
};

const PropertyItem: React.FC<PropertyItemProps> = ({
  property,
  isLiked, // Legacy prop - will be overridden by context
  isHovered,
  propertyImage, // Ignored - we generate our own
  onHover,
  onSelect,
  onFavoriteToggle, // Legacy prop - will be replaced by context
  onShare
}) => {
  // Get favorites context and auth
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for favorite button loading
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  // State for async image loading
  const [asyncImageUrl, setAsyncImageUrl] = useState<string | null>(null);

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

  // Get real-time favorite status from context
  const isCurrentlyFavorited = isFavorite(propertyData.id);

  // Get property age, status, and amenities
  const propertyAge = formatPropertyAge(propertyData.createdAt);
  const propertyStatus = getPropertyStatus(property);
  const propertyAmenities = getPropertyAmenities(property, propertyData.id);

  // Generate image URL
  const imageUrl = useMemo(() => {
    // Generate image URL based on property data
    
    try {
      // Method 1: Use primary_image field if available
      if (propertyData.primary_image && propertyData.primary_image.trim()) {
        // Handle optimization format in primary_image
        if (propertyData.primary_image.startsWith('optimization_')) {
          return '/noimage.png'; // Placeholder - async loading will handle this
        }
        
        const constructedUrl = fastImageService.getPublicImageUrl(propertyData.id, propertyData.primary_image);
        return constructedUrl;
      }
      
      // Method 2: Check if it's PropertyType and has property_images
      if (!isSearchResult(property) && property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
        const primaryImage = property.property_images.find(img => img.is_primary);
        const imageToUse = primaryImage || property.property_images[0];
        
        if (imageToUse.url && imageToUse.url.startsWith('http')) {
          return imageToUse.url;
        }
        
        if (imageToUse.fileName) {
          const constructedUrl = fastImageService.getPublicImageUrl(propertyData.id, imageToUse.fileName);
          return constructedUrl;
        }
      }
      
      // Method 3: Check for imageFiles (new optimization format)
      if (!isSearchResult(property)) {
        const details = property.property_details || {};
        
        if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
          const primaryImage = details.imageFiles.find(img => img.isPrimary);
          const imageToUse = primaryImage || details.imageFiles[0];
          
          
          if (imageToUse.fileName) {
            // Handle optimization format
            if (imageToUse.fileName.startsWith('optimization_')) {
              // For optimization images, we need async loading - component will handle this
              return '/noimage.png'; // Placeholder - component should handle async loading
            }
            
            const constructedUrl = fastImageService.getPublicImageUrl(propertyData.id, imageToUse.fileName);
            return constructedUrl;
          }
        }
        
        // Method 4: Legacy property_details support
        if (details.primaryImage) {
          if (details.primaryImage.startsWith('http') || details.primaryImage.startsWith('/')) {
            return details.primaryImage;
          }
          return fastImageService.getPublicImageUrl(propertyData.id, details.primaryImage);
        }
      }
      
      return '/noimage.png';
    } catch (error) {
      // Error generating image
      return '/noimage.png';
    }
  }, [propertyData.id, propertyData.primary_image, property]);

  // Handle async loading for optimization images
  useEffect(() => {
    const loadOptimizationImage = async () => {
      
      if (!property) {
        return;
      }
      
      if (isSearchResult(property)) {
        
        // Handle optimization format in SearchResult primary_image
        if (property.primary_image && property.primary_image.startsWith('optimization_')) {
          try {
            const optimizedUrl = await fastImageService.getOptimizationImageUrl(property.primary_image);
            
            if (optimizedUrl && optimizedUrl !== '/noimage.png') {
              setAsyncImageUrl(optimizedUrl);
            } else {
            }
          } catch (error) {
            // Failed to load SearchResult optimization image
          }
        } else {
        }
        return;
      }
      
      const details = property.property_details || {};
      
      if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
        const primaryImage = details.imageFiles.find(img => img.isPrimary);
        const imageToUse = primaryImage || details.imageFiles[0];
        
        
        if (imageToUse.fileName && imageToUse.fileName.startsWith('optimization_')) {
          try {
            const optimizedUrl = await fastImageService.getOptimizationImageUrl(imageToUse.fileName);
            
            if (optimizedUrl && optimizedUrl !== '/noimage.png') {
              setAsyncImageUrl(optimizedUrl);
            } else {
            }
          } catch (error) {
            // Failed to load optimization image
          }
        } else {
        }
      } else {
      }
    };
    
    loadOptimizationImage();
  }, [property]);

  // Generate display data for SearchResult
  const displayData = useMemo(() => {
    if (isSearchResult(property)) {
      // For SearchResult, create simplified display data with conditional rendering
      const formattedPrice = propertyData.price ? 
        (propertyData.transactionType === 'rent' 
          ? `${formatPrice(propertyData.price)}/mo`
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
      

      // Determine main property category for first badge
      let mainPropertyCategory = 'Property';
      if (propertyData.propertyType) {
        switch (propertyData.propertyType.toLowerCase()) {
          case 'residential':
            // Check subType for special residential categories
            if (propertyData.subType && propertyData.subType.toLowerCase() === 'pghostel') {
              mainPropertyCategory = 'PG/Hostel';
            } else if (propertyData.subType && propertyData.subType.toLowerCase() === 'flatmates') {
              mainPropertyCategory = 'Flatmates';
            } else {
              mainPropertyCategory = 'Residential';
            }
            break;
          case 'commercial':
            mainPropertyCategory = 'Commercial';
            break;
          case 'land':
            mainPropertyCategory = 'Land';
            break;
          case 'pg/hostel':
            mainPropertyCategory = 'PG/Hostel';
            break;
          case 'flatmates':
            mainPropertyCategory = 'Flatmates';
            break;
          default:
            // Capitalize first letter
            mainPropertyCategory = propertyData.propertyType.charAt(0).toUpperCase() + 
                                  propertyData.propertyType.slice(1).toLowerCase();
        }
      }

      // Determine transaction type for second badge
      let transactionDisplay = 'For Rent';
      if (propertyData.transactionType) {
        switch (propertyData.transactionType.toLowerCase()) {
          case 'buy':
          case 'sale':
            transactionDisplay = 'For Sale';
            break;
          case 'rent':
            transactionDisplay = 'For Rent';
            break;
          default:
            transactionDisplay = 'For ' + propertyData.transactionType.charAt(0).toUpperCase() + 
                               propertyData.transactionType.slice(1).toLowerCase();
        }
      }

      return {
        price: formattedPrice,
        icons,
        propertyType: mainPropertyCategory, // This will be "Residential", "Commercial", or "Land"
        listingDisplay: transactionDisplay  // This will be "For Rent", "For Sale", etc.
      };
    } else {
      // Use existing logic for PropertyType
      return getFlowSpecificDisplayData(property, detectPropertyFlowType(property), property.property_details || {});
    }
  }, [property, propertyData]);
  
  // UPDATED: Handle favorite toggle using FavoritesContext directly
  const handleFavoriteToggle = async (isLiked: boolean) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        duration: 3000,
      });
      return false;
    }

    setIsFavoriteLoading(true);
    
    try {
      let success = false;
      
      if (isLiked) {
        // Add to favorites using context
        success = await addFavorite(propertyData.id);
      } else {
        // Remove from favorites using context
        success = await removeFavorite(propertyData.id);
      }
      
      if (success) {
        // Show success toast
        toast({
          title: isLiked ? "Added to favorites" : "Removed from favorites",
          description: isLiked 
            ? "Property added to your favorites" 
            : "Property removed from your favorites",
          duration: 2000,
        });
        
        // Also call legacy onFavoriteToggle if provided for backward compatibility
        if (onFavoriteToggle) {
          await onFavoriteToggle(propertyData.id, isLiked);
        }
        
        return true;
      } else {
        // Show error toast
        toast({
          title: "Action failed",
          description: "There was a problem updating your favorites",
          variant: "destructive",
          duration: 3000,
        });
        
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
        ${isHovered ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 shadow-lg scale-[1.02]' : 'hover:bg-muted/30'}
        hover:shadow-xl rounded-2xl mx-2 my-2 border border-border/20 hover:border-blue-200/60 bg-card/50 backdrop-blur-sm
      `}
    >
      {/* Enhanced Favorite Button - Top Right Corner with real-time state */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton
          initialIsLiked={isCurrentlyFavorited}
          onToggle={handleFavoriteToggle}
          isLoading={isFavoriteLoading}
          className="w-9 h-9 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border border-white/40"
        />
      </div>

      <div className="p-5 cursor-pointer"
        onMouseEnter={() => onHover(propertyData.id, true)}
        onMouseLeave={() => onHover(propertyData.id, false)}
      >
        <Link 
          to={`/seeker/property/${propertyData.id}`} 
          className="block group"
        >
          {/* Enhanced Layout: Image at top, content below */}
          <div className="space-y-4">
            {/* Enhanced Property image with better styling and larger size */}
            <div className="relative h-48 w-full overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
              <img
                src={asyncImageUrl || imageUrl}
                alt={propertyData.title || 'Property'}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/noimage.png';
                }}
              />
              {/* Enhanced image overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl"></div>
              
              {/* Property Type and Status Badges - Moved to image overlay */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                {displayData.propertyType && (
                  <div className="inline-flex items-center text-xs text-white px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm font-medium shadow-sm">
                    {displayData.propertyType}
                  </div>
                )}
                {displayData.listingDisplay && (
                  <div className={`
                    inline-flex items-center text-xs text-white px-3 py-1.5 rounded-full font-medium shadow-sm backdrop-blur-sm
                    ${displayData.listingDisplay.toLowerCase().includes('rent') 
                      ? 'bg-blue-600/90' 
                      : 'bg-green-600/90'
                    }
                  `}>
                    {displayData.listingDisplay}
                  </div>
                )}
              </div>
              
              {/* Property Status - Top right of image */}
              <div className="absolute top-3 left-3">
                <div className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm font-medium shadow-sm ${propertyStatus.color}`}>
                  {propertyStatus.icon}
                  <span className="ml-1">{propertyStatus.status}</span>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="space-y-2">
              {/* Enhanced Property Title */}
              {propertyData.title && (
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                    {propertyData.title}
                  </h3>
                </div>
              )}
              
              {/* Location and Price Row */}
              <div className="space-y-1">
                {propertyData.location && (
                  <div className="flex items-center justify-between gap-3">
                    {/* Location on the left */}
                    <div className="flex items-center text-sm text-muted-foreground min-w-0 flex-1">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                      <span className="truncate font-medium group-hover:text-foreground transition-colors duration-200">
                        {propertyData.location}
                      </span>
                    </div>
                    
                    {/* Price on the right */}
                    {displayData.price && (
                      <div className="flex-shrink-0">
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/30">
                          {displayData.price}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Property Age */}
                {propertyAge && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1.5 flex-shrink-0 text-gray-500" />
                    <span className="font-medium">{propertyAge}</span>
                  </div>
                )}
              </div>
              
              {/* Property Specifications */}
              {displayData.icons.length > 0 && (
                <div className="space-y-2">
                  {/* Main specs in a 2-column grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {displayData.icons.slice(0, 4).map((icon, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground bg-muted/40 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors duration-200">
                        <span className="text-blue-500 mr-2">{icon.icon}</span>
                        <span className="font-medium">{icon.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Additional specs if available */}
                  {displayData.icons.length > 4 && (
                    <div className="flex flex-wrap gap-1">
                      {displayData.icons.slice(4).map((icon, index) => (
                        <div key={index + 4} className="inline-flex items-center text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                          <span className="text-blue-500 mr-1">{icon.icon}</span>
                          <span className="font-medium">{icon.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Key Amenities */}
                  {propertyAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {propertyAmenities.map((amenity, index) => (
                        <div key={`amenity-${index}`} className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/30">
                          <span className="text-emerald-600 dark:text-emerald-400 mr-1">{amenity.icon}</span>
                          <span className="font-medium">{amenity.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
            </div>
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
  
  // Determine main property category based on flow type
  if (flowType.includes('residential')) {
    // Special case: For PG/Hostel and Flatmates, show their specific type instead of "Residential"
    if (flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL) {
      propertyType = 'PG/Hostel';
    } else if (flowType === FLOW_TYPES.RESIDENTIAL_FLATMATES) {
      propertyType = 'Flatmates';
    } else {
      propertyType = 'Residential';
    }
  } else if (flowType.includes('commercial')) {
    propertyType = 'Commercial';
  } else if (flowType.includes('land')) {
    propertyType = 'Land';
  } else {
    // Fallback to property_type if available
    if (isValidStringField(basicDetails.propertyType) || isValidStringField(property.property_type)) {
      const rawType = basicDetails.propertyType || property.property_type;
      propertyType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    } else {
      propertyType = 'Property';
    }
  }
  
  if (flowType) {
    listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  }
  
  // Flow-specific logic with conditional rendering
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      if (isValidNumberField(rentalInfo.rentAmount || property.price)) {
        price = `${formatPrice(rentalInfo.rentAmount || property.price)}/mo`;
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
        price = `${formatPrice(flatmateInfo.rent || property.price)}/mo`;
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
        price = `${formatPrice(pgInfo.rent || property.price)}/mo`;
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
        price = `${formatPrice(commercialRentalInfo.rentAmount || property.price)}/mo`;
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
        price = `${formatPrice(coworkingInfo.seatPrice || property.price)}/seat/mo`;
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

// End of file