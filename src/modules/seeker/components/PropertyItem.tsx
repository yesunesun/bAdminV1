// src/modules/seeker/components/PropertyItem.tsx
// Version: 6.4.0
// Last Modified: 08-06-2025 18:45 IST
// Purpose: FIXED real-time favorites count update - now uses FavoritesContext directly

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { SearchResult } from '@/components/Search/types/search.types';
import { 
  ChevronRight, MapPin, Bed, Bath, Square, Users, 
  Coffee, Building, Home, Calendar, Utensils, Briefcase, FileText, Map,
  Clock, CheckCircle, AlertCircle, Star, Wifi, Car, Crown, Zap, Award
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
import { useVisitedProperties } from '@/contexts/VisitedPropertiesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  isPropertyPremium, 
  isPropertySponsored, 
  getPremiumBadgeText, 
  getPremiumBadgeStyle,
  EnhancedProperty 
} from '../services/recommendationService';

// Union type to handle both formats
type PropertyItemData = PropertyType | SearchResult | EnhancedProperty;

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

// Helper function to render premium badges
const renderPremiumBadge = (property: PropertyItemData): React.ReactNode => {
  const isPremium = isPropertyPremium(property);
  const isSponsored = isPropertySponsored(property);
  
  if (!isPremium && !isSponsored) return null;
  
  const badgeText = getPremiumBadgeText(property);
  const badgeStyle = getPremiumBadgeStyle(property);
  
  // Get appropriate icon for badge type
  const getBadgeIcon = () => {
    switch (badgeText.toLowerCase()) {
      case 'sponsored':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'premium':
        return <Crown className="h-3 w-3 mr-1" />;
      case 'featured':
        return <Star className="h-3 w-3 mr-1" />;
      case 'verified':
        return <Award className="h-3 w-3 mr-1" />;
      case 'new':
        return <Zap className="h-3 w-3 mr-1" />;
      default:
        return <Star className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className={`
      inline-flex items-center text-xs font-bold px-2.5 py-1.5 rounded-full 
      backdrop-blur-sm shadow-lg border
      ${badgeStyle}
      animate-pulse
    `}>
      {getBadgeIcon()}
      {badgeText}
    </div>
  );
};

// Helper function to check if property has recommendation data
const getRecommendationData = (property: PropertyItemData) => {
  const enhanced = property as EnhancedProperty;
  return {
    hasRecommendation: enhanced.recommendation_score !== undefined,
    score: enhanced.recommendation_score || 0,
    reason: enhanced.recommendation_reason || '',
    similarityScore: enhanced.similarity_score || 0
  };
};

// Helper function to extract key amenities/features
const getPropertyAmenities = (property: PropertyItemData): Array<{ icon: React.ReactNode; text: string }> => {
  const amenities = [];
  
  if (!isSearchResult(property)) {
    const details = property.property_details || {};
    const basicDetails = details.basicDetails || {};
    
    // Check for parking
    if (basicDetails.parking || basicDetails.parkingAvailable) {
      amenities.push({ icon: <Car className="h-3 w-3" />, text: 'Parking' });
    }
    
    // Check for furnished status
    if (basicDetails.furnishingStatus === 'fully_furnished') {
      amenities.push({ icon: <Star className="h-3 w-3" />, text: 'Furnished' });
    } else if (basicDetails.furnishingStatus === 'semi_furnished') {
      amenities.push({ icon: <Star className="h-3 w-3" />, text: 'Semi-furnished' });
    }
    
    // Check for wifi/internet (common in modern properties)
    if (basicDetails.internet || basicDetails.wifi) {
      amenities.push({ icon: <Wifi className="h-3 w-3" />, text: 'WiFi' });
    }
    
    // For commercial properties, add business-relevant features
    if (property.property_type === 'commercial') {
      amenities.push({ icon: <Briefcase className="h-3 w-3" />, text: 'Business' });
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
  // Get favorites context, visited properties context, and auth
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isVisited, addVisit } = useVisitedProperties();
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
  }, [property.id, property.title, property.price]);

  // Get real-time favorite status and visited status from context
  const isCurrentlyFavorited = isFavorite(propertyData.id);
  const isCurrentlyVisited = isVisited(propertyData.id);

  // Get property age, status, amenities, and recommendation data
  const propertyAge = formatPropertyAge(propertyData.createdAt);
  const propertyStatus = getPropertyStatus(property);
  const propertyAmenities = getPropertyAmenities(property);
  const recommendationData = getRecommendationData(property);
  const isPremiumProperty = isPropertyPremium(property);
  const isSponsoredProperty = isPropertySponsored(property);

  // Generate image URL with minimal dependencies to prevent infinite re-renders
  const imageUrl = useMemo(() => {
    // If we have a primary image from propertyData, use it first
    if (propertyData.primary_image && propertyData.primary_image.trim()) {
      if (propertyData.primary_image.startsWith('optimization_')) {
        return '/noimage.png'; // Placeholder - async loading will handle this
      }
      return fastImageService.getPublicImageUrl(propertyData.id, propertyData.primary_image);
    }
    
    // Fallback to default image
    return '/noimage.png';
  }, [propertyData.id, propertyData.primary_image]);

  // Handle async loading for optimization images
  useEffect(() => {
    const loadOptimizationImage = async () => {
      if (!property || asyncImageUrl) {
        return; // Skip if no property or already loaded
      }
      
      if (isSearchResult(property)) {
        // Handle optimization format in SearchResult primary_image
        if (property.primary_image && property.primary_image.startsWith('optimization_')) {
          try {
            const optimizedUrl = await fastImageService.getOptimizationImageUrl(property.primary_image);
            if (optimizedUrl && optimizedUrl !== '/noimage.png') {
              setAsyncImageUrl(optimizedUrl);
            }
          } catch (error) {
            console.error(`Failed to load SearchResult optimization image:`, error);
          }
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
            }
          } catch (error) {
            console.error(`Failed to load optimization image:`, error);
          }
        }
      }
    };
    
    // Only run once per property and only if we don't have an async image yet
    if (!asyncImageUrl) {
      loadOptimizationImage();
    }
  }, [property.id, asyncImageUrl]); // Use property.id instead of entire property object

  // Update visited properties with the actual working image URL
  useEffect(() => {
    if (isCurrentlyVisited && (asyncImageUrl || imageUrl) && (asyncImageUrl || imageUrl) !== '/noimage.png') {
      const workingImageUrl = asyncImageUrl || imageUrl;
      
      // Update the visited property with the working image URL
      const updatedVisitedProperty = {
        id: propertyData.id,
        title: propertyData.title || 'Property Listing',
        price: propertyData.price || 0,
        location: propertyData.location || '',
        propertyType: propertyData.propertyType || 'residential',
        transactionType: propertyData.transactionType || 'rent',
        primary_image: workingImageUrl
      };
      
      addVisit(updatedVisitedProperty);
    }
  }, [asyncImageUrl, imageUrl, isCurrentlyVisited, propertyData.id, addVisit]); // Use propertyData.id instead of entire object

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
      
      // Add transaction type icon (this will show next to area)
      const transactionIcon = propertyData.transactionType === 'buy' ? Building : Home;
      const transactionText = propertyData.transactionType === 'buy' ? 'sale' : 'rent';
      icons.push({ 
        icon: React.createElement(transactionIcon, { className: "h-3 w-3 mr-1" }), 
        text: transactionText 
      });

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
  }, [propertyData.id, propertyData.propertyType, propertyData.transactionType, propertyData.price]);
  
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
        ${isPremiumProperty || isSponsoredProperty ? 'ring-2 ring-offset-2' : ''}
        ${isPremiumProperty ? 'ring-purple-300/50' : ''}
        ${isSponsoredProperty ? 'ring-orange-300/50' : ''}
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

      <div className="p-5"
        onMouseEnter={() => onHover(propertyData.id, true)}
        onMouseLeave={() => onHover(propertyData.id, false)}
        onClick={() => onSelect(property)}
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
              
              {/* Premium/Sponsored Badge - Top right of image */}
              {(isPremiumProperty || isSponsoredProperty) && (
                <div className="absolute top-3 right-3">
                  {renderPremiumBadge(property)}
                </div>
              )}
              
              {/* Property Status and Visited Indicator - Top right of image */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <div className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm font-medium shadow-sm ${propertyStatus.color}`}>
                  {propertyStatus.icon}
                  <span className="ml-1">{propertyStatus.status}</span>
                </div>
                {isCurrentlyVisited && (
                  <div className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-purple-600/95 backdrop-blur-sm font-medium shadow-sm text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Visited</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Content Section */}
            <div className="space-y-3">
              {/* Enhanced Property Title with Recommendation Indicator */}
              {propertyData.title && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                    {propertyData.title}
                  </h3>
                  
                  {/* Recommendation Score Indicator */}
                  {recommendationData.hasRecommendation && recommendationData.score > 50 && (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Star className="h-3 w-3 mr-1 text-emerald-600" />
                        <span>Recommended for you</span>
                        <span className="ml-1 text-emerald-600 font-bold">{Math.round(recommendationData.score)}%</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendation Reason */}
                  {recommendationData.reason && recommendationData.score > 70 && (
                    <p className="text-xs text-muted-foreground italic">
                      {recommendationData.reason}
                    </p>
                  )}
                </div>
              )}
              
              {/* Enhanced Location and Property Age */}
              <div className="space-y-2">
                {propertyData.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate font-medium group-hover:text-foreground transition-colors duration-200">
                      {propertyData.location}
                    </span>
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
              
              {/* Enhanced Price Display */}
              {displayData.price && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    {displayData.price}
                  </p>
                </div>
              )}
              
              {/* Enhanced Property Specifications */}
              {displayData.icons.length > 0 && (
                <div className="space-y-3">
                  {/* Main specs in a 2-column grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {displayData.icons.slice(0, 4).map((icon, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors duration-200">
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
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {propertyAmenities.map((amenity, index) => (
                          <div key={`amenity-${index}`} className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/30">
                            <span className="text-emerald-600 dark:text-emerald-400 mr-1">{amenity.icon}</span>
                            <span className="font-medium">{amenity.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Enhanced "View Details" Section */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-sm text-muted-foreground font-medium">
                  View Details
                </span>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="text-sm font-medium mr-1">Explore</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
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
      
      // Add rent icon instead of furnishing status
      icons.push({ icon: <Home className="h-3 w-3 mr-1" />, text: 'rent' });
      
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
      
      // Add sale icon
      icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: 'sale' });
      
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
      
      // Add flatmates icon
      icons.push({ icon: <Users className="h-3 w-3 mr-1" />, text: 'flatmates' });
      
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
      
      // Add PG icon
      icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: 'pghostel' });
      
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
      
      // Add rent icon
      icons.push({ icon: <Home className="h-3 w-3 mr-1" />, text: 'rent' });
      
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
      
      // Add sale icon
      icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: 'sale' });
      
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
      
      // Add coworking icon
      icons.push({ icon: <Coffee className="h-3 w-3 mr-1" />, text: 'coworking' });
      
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
      
      // Add sale icon
      icons.push({ icon: <Map className="h-3 w-3 mr-1" />, text: 'sale' });
      
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
      
      // Add generic icon based on transaction type
      if (flowType.includes('sale')) {
        icons.push({ icon: <Building className="h-3 w-3 mr-1" />, text: 'sale' });
      } else {
        icons.push({ icon: <Home className="h-3 w-3 mr-1" />, text: 'rent' });
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