// src/modules/seeker/components/PropertyDetails/index.tsx  
// Version: 18.1.0
// Last Modified: 27-05-2025 16:45 IST
// Purpose: Reordered sections - Features & Amenities moved to last position

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { 
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Import extracted hooks
import { usePropertyData } from './hooks/usePropertyData';
import { usePropertyMedia } from './hooks/usePropertyMedia';

// Import extracted components
import BasicDetailsSection from './BasicDetailsSection';
import LocationDetailsSection from './LocationDetailsSection';
import StepSection from './StepSection';
import PricingDetailsSection from './PricingDetailsSection';

// Import existing reusable components
import PropertyActionButtons from './PropertyActionButtons';
import ContactOwnerCard from './ContactOwnerCard';
import PropertyHighlightsCard from './PropertyHighlightsCard';
import SimilarProperties from './SimilarProperties';
import NearbyAmenities from './NearbyAmenities';
import VisitRequestDialog from './VisitRequestDialog';
import PropertyImageUpload from './PropertyImageUpload';
import PropertyNotFound from './PropertyNotFound';
import { PropertyDetailsSkeleton } from './PropertyDetailsSkeleton';
import PropertyGallery from './PropertyGallery';
import PropertyLocationSection from './PropertyLocationSection';
import PropertyTitleEditor from './PropertyTitleEditor';

// Import flow-specific section components
import LandSaleDetailsSection from './LandSaleDetailsSection';
import PGHostelDetailsSection from './PGHostelDetailsSection';
import FlatmatesDetailsSection from './FlatmatesDetailsSection';
import CoworkingDetailsSection from './CoworkingDetailsSection';
import CoworkingSpecificDetailsSection from './CoworkingSpecificDetailsSection';
import FeaturesAmenitiesSection from './FeaturesAmenitiesSection';

// Import types
import { PropertyDetailsProps } from './types';

// Update the interface to include currentUser prop
interface EnhancedPropertyDetailsProps extends PropertyDetailsProps {
  currentUser?: { id: string } | null;
}

// Define static data for similar properties
const SIMILAR_PROPERTIES_DATA = [
  {
    id: 'similar-1',
    title: 'Luxury Apartment in City Center',
    address: '',
    city: 'Madhapur',
    state: 'Hyderabad',
    price: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1600,
    property_details: { propertyType: 'Apartment' }
  },
  {
    id: 'similar-2',
    title: 'Modern Villa with Garden',
    address: '',
    city: 'Gachibowli',
    state: 'Hyderabad',
    price: 12000000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2200,
    property_details: { propertyType: 'Villa' }
  },
  {
    id: 'similar-3',
    title: 'Affordable 2BHK Near Metro',
    address: '',
    city: 'Miyapur',
    state: 'Hyderabad',
    price: 4500000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1100,
    property_details: { propertyType: 'Apartment' }
  }
];

const PropertyDetails: React.FC<EnhancedPropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading,
  onRefresh,
  directUrls,
  currentUser
}) => {
  const { toast } = useToast();
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const [actionStates, setActionStates] = useState({
    sharing: false,
    liking: false,
    refreshing: false
  });

  // Use custom hooks for data processing and media management
  const propertyData = usePropertyData(property);
  const { propertyImages, handleMediaUploaded } = usePropertyMedia(property, onRefresh);

  // Generate 6-character property code from property ID
  const generatePropertyCode = async (propertyId: string): Promise<string> => {
    try {
      // Step 1: Take the Property ID as string input
      const input = propertyId.toString();
      
      // Step 2: Hash the UUID using SHA-256
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Step 3: Convert the hash to an integer (using first 8 bytes for precision)
      const hashArray = new Uint8Array(hashBuffer);
      let hashInt = 0;
      for (let i = 0; i < 8; i++) {
        hashInt = hashInt * 256 + hashArray[i];
      }
      
      // Step 4: Convert the integer to a Base36 string
      const base36String = hashInt.toString(36).toUpperCase();
      
      // Step 5: Take the first 6 characters
      return base36String.substring(0, 6).padEnd(6, '0');
    } catch (error) {
      console.error('Error generating property code:', error);
      // Fallback: use first 6 characters of property ID
      return propertyId.replace(/-/g, '').substring(0, 6).toUpperCase();
    }
  };

  // State for property code
  const [propertyCode, setPropertyCode] = useState<string>('');

  // Generate property code when component mounts
  useEffect(() => {
    if (propertyData?.propertyId) {
      generatePropertyCode(propertyData.propertyId).then(setPropertyCode);
    }
  }, [propertyData?.propertyId]);

  // Page load animation effect
  useEffect(() => {
    if (!isLoading && propertyData) {
      const timer = setTimeout(() => setPageLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, propertyData]);

  // Progressive section reveal effect
  useEffect(() => {
    if (pageLoaded) {
      const sections = ['header', 'gallery', 'actions', 'details', 'location', 'pricing', 'remaining', 'features', 'sidebar'];
      sections.forEach((section, index) => {
        setTimeout(() => {
          setSectionsVisible(prev => ({ ...prev, [section]: true }));
        }, index * 150);
      });
    }
  }, [pageLoaded]);

  // Handle title update with animation feedback
  const handleTitleUpdated = (newTitle: string) => {
    setDisplayTitle(newTitle);
    if (onRefresh) {
      onRefresh();
    }
    
    // Show success animation
    toast({
      title: "Title Updated",
      description: "Property title has been successfully updated",
      variant: "default"
    });
  };

  // Enhanced share functionality with loading state
  const handleShare = async () => {
    setActionStates(prev => ({ ...prev, sharing: true }));
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: propertyTitle,
          url: window.location.href
        });
        
        toast({
          title: "Shared Successfully",
          description: "Property has been shared",
          variant: "default"
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Property link copied to clipboard",
          variant: "default"
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Share Failed",
          description: "Unable to share property. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setActionStates(prev => ({ ...prev, sharing: false }));
    }
  };

  // Enhanced like handler with optimistic updates
  const handleLikeToggle = async () => {
    if (!onToggleLike) return;
    
    setActionStates(prev => ({ ...prev, liking: true }));
    
    try {
      await onToggleLike();
      
      // Success feedback
      toast({
        title: isLiked ? "Removed from Favorites" : "Added to Favorites",
        description: isLiked ? "Property removed from your favorites" : "Property saved to your favorites",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Unable to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionStates(prev => ({ ...prev, liking: false }));
    }
  };

  // Enhanced refresh with loading feedback
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setActionStates(prev => ({ ...prev, refreshing: true }));
    
    try {
      await onRefresh();
      toast({
        title: "Content Refreshed",
        description: "Property data has been updated",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionStates(prev => ({ ...prev, refreshing: false }));
    }
  };

  // Enhanced visit dialog handler
  const handleScheduleVisit = () => {
    setVisitDialogOpen(true);
    
    // Analytics or tracking could go here
    console.log('Visit request initiated for property:', propertyData?.propertyId);
  };

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PropertyDetailsSkeleton />
      </div>
    );
  }

  // Error state - Property not found with retry option
  if (!property || !propertyData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleRefresh}
            disabled={actionStates.refreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg",
              "hover:bg-primary/90 transition-colors",
              actionStates.refreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", actionStates.refreshing && "animate-spin")} />
            {actionStates.refreshing ? "Refreshing..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // Destructure processed property data
  const {
    detectedFlowType,
    flowDisplayName,
    isCurrentSaleProperty,
    isLandSaleProperty,
    isPGHostelProperty,
    isFlatmatesProperty,
    isCoworkingProperty,
    propertyId,
    ownerId,
    propertyDetails,
    steps,
    flow,
    basicDetails,
    location,
    priceDetails,
    featuresDetails,
    price,
    locationString,
    coordinates,
    remainingStepKeys
  } = propertyData;

  // Get property title - use the display title if available (from editing), otherwise use flow.title
  const propertyTitle = displayTitle || flow.title || (basicDetails?.title || property.title || 'Property Listing');

  // Check if current user is the property owner
  const currentUserId = currentUser?.id;
  const isPropertyOwner = currentUserId && (currentUserId === ownerId || currentUserId === property.owner_id);

  return (
    <div className={cn(
      "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-opacity duration-500",
      pageLoaded ? "opacity-100" : "opacity-0"
    )}>
      {/* Property Title Section with Listing Type Badge */}
      <div className={cn(
        "mb-6 transition-all duration-700 transform",
        sectionsVisible.header ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {/* Editable title component with enhanced feedback */}
          <div className="flex-1 min-w-0">
            <PropertyTitleEditor
              propertyId={propertyId}
              title={propertyTitle}
              ownerId={ownerId}
              onTitleUpdated={handleTitleUpdated}
            />
          </div>

          {/* Enhanced badge display with flow type and animations */}
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105",
              isCurrentSaleProperty 
                ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' 
                : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
            )}>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                For {isCurrentSaleProperty ? 'Sale' : 'Rent'}
              </span>
            </span>

            {/* Show specific flow type badge */}
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-sm font-medium border border-purple-300 transition-all duration-300 hover:scale-105">
              {flowDisplayName}
            </span>

            {/* Show category if different from flow display name */}
            {flow.category && flow.category !== flowDisplayName.toLowerCase() && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-medium border border-gray-300 capitalize transition-all duration-300 hover:scale-105">
                {flow.category}
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <span className="h-1 w-1 bg-primary rounded-full"></span>
          {locationString}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Navigation Links */}
          <div className={cn(
            "sticky top-20 z-20 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 mb-6 transition-all duration-700 transform",
            sectionsVisible.header ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-muted-foreground mr-2">Quick Nav:</span>
              
              <button
                onClick={() => {
                  const element = document.getElementById('section-gallery');
                  if (element) {
                    const yOffset = -120; // Account for sticky nav height
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                Gallery
              </button>
              
              <button
                onClick={() => {
                  const element = document.getElementById('section-details');
                  if (element) {
                    const yOffset = -120; // Account for sticky nav height
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                {isLandSaleProperty ? 'Land Details' 
                 : isPGHostelProperty ? 'PG Details'
                 : isFlatmatesProperty ? 'Room Details' 
                 : isCoworkingProperty ? 'Coworking'
                 : 'Details'}
              </button>
              
              <button
                onClick={() => {
                  const element = document.getElementById('section-location');
                  if (element) {
                    const yOffset = -120; // Account for sticky nav height
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                Location
              </button>
              
              {isCoworkingProperty && (
                <button
                  onClick={() => {
                    const element = document.getElementById('section-coworking');
                    if (element) {
                      const yOffset = -120; // Account for sticky nav height
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  Workspace
                </button>
              )}
              
              {priceDetails && !isPGHostelProperty && !isFlatmatesProperty && !isCoworkingProperty && (
                <button
                  onClick={() => {
                    const element = document.getElementById('section-pricing');
                    if (element) {
                      const yOffset = -120; // Account for sticky nav height
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  {isCurrentSaleProperty ? 'Sale Details' : 'Pricing'}
                </button>
              )}
              
              {remainingStepKeys.length > 0 && remainingStepKeys.some(stepId => {
                const stepData = steps[stepId];
                return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
              }) && (
                <button
                  onClick={() => {
                    const firstValidStepId = remainingStepKeys.find(stepId => {
                      const stepData = steps[stepId];
                      return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
                    });
                    if (firstValidStepId) {
                      const element = document.getElementById(`section-${firstValidStepId}`);
                      if (element) {
                        const yOffset = -120; // Account for sticky nav height
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  {remainingStepKeys.find(stepId => {
                    const stepData = steps[stepId];
                    return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
                  })?.includes('flatmate') ? 'Flatmate Details' 
                   : remainingStepKeys.find(stepId => {
                     const stepData = steps[stepId];
                     return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
                   })?.includes('pg_details') ? 'Facilities'
                   : remainingStepKeys.find(stepId => {
                     const stepData = steps[stepId];
                     return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
                   })?.includes('coworking') ? 'Workspace'
                   : remainingStepKeys.find(stepId => {
                     const stepData = steps[stepId];
                     return stepData && !(typeof stepData === 'object' && Object.keys(stepData).length === 0);
                   })?.includes('land') ? 'Features'
                   : 'More Details'}
                </button>
              )}
              
              {featuresDetails && (
                <button
                  onClick={() => {
                    const element = document.getElementById('section-features');
                    if (element) {
                      const yOffset = -120; // Account for sticky nav height
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  Amenities
                </button>
              )}
            </div>
          </div>
          {/* Enhanced Media Gallery */}
          <div 
            id="section-gallery"
            className={cn(
              "transition-all duration-700 transform",
              sectionsVisible.gallery ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <PropertyGallery
              images={propertyImages}
              video={property.property_video}
              propertyId={propertyId}
              directUrls={directUrls}
            />
          </div>

          {/* Enhanced Image/Video Upload Component */}
          <div className={cn(
            "transition-all duration-700 transform",
            sectionsVisible.gallery ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <PropertyImageUpload
              property={property}
              onImageUploaded={() => handleMediaUploaded('image')}
              onVideoUploaded={() => handleMediaUploaded('video')}
            />
          </div>

          {/* Property Code Section */}
          <div className={cn(
            "transition-all duration-700 transform",
            sectionsVisible.gallery ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
          </div>

          {/* Enhanced Quick Actions */}
          <div className={cn(
            "transition-all duration-700 transform",
            sectionsVisible.actions ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
              <button
                onClick={handleLikeToggle}
                disabled={actionStates.liking}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  isLiked 
                    ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-300" 
                    : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300 hover:from-red-50 hover:to-pink-50",
                  actionStates.liking && "opacity-50 cursor-not-allowed"
                )}
              >
                <Heart className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isLiked && "fill-red-500 text-red-500",
                  actionStates.liking && "animate-pulse"
                )} />
                {actionStates.liking ? "Updating..." : (isLiked ? "Liked" : "Like")}
              </button>

              <button
                onClick={handleShare}
                disabled={actionStates.sharing}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-300",
                  "hover:scale-105 hover:shadow-md hover:from-blue-200 hover:to-blue-100",
                  actionStates.sharing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Share2 className={cn(
                  "h-4 w-4 transition-all duration-200",
                  actionStates.sharing && "animate-pulse"
                )} />
                {actionStates.sharing ? "Sharing..." : "Share"}
              </button>

              <button
                onClick={handleScheduleVisit}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-300",
                  "hover:scale-105 hover:shadow-md hover:from-green-200 hover:to-green-100"
                )}
              >
                <Calendar className="h-4 w-4" />
                Schedule Visit
              </button>
            </div>
          </div>

          {/* Property-specific details sections with staggered animations */}
          <div 
            id="section-details"
            className={cn(
              "transition-all duration-700 transform",
              sectionsVisible.details ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <div className="relative">
              {/* Section separator for property details */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                  {isLandSaleProperty ? 'Land Details' 
                   : isPGHostelProperty ? 'PG/Hostel Details'
                   : isFlatmatesProperty ? 'Room Details' 
                   : isCoworkingProperty ? 'Coworking Details'
                   : 'Property Details'}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
              </div>
              
              {isLandSaleProperty ? (
                <LandSaleDetailsSection landDetails={steps} />
              ) : isPGHostelProperty ? (
                <PGHostelDetailsSection pgDetails={steps} />
              ) : isFlatmatesProperty ? (
                <FlatmatesDetailsSection flatmatesDetails={steps} />
              ) : isCoworkingProperty ? (
                <CoworkingDetailsSection coworkingDetails={steps} />
              ) : (
                basicDetails && (
                  <BasicDetailsSection
                    basicDetails={basicDetails}
                    price={price}
                    listingType={flow.listingType}
                  />
                )
              )}
            </div>
          </div>

          {/* Location Section */}
          <div 
            id="section-location"
            className={cn(
              "transition-all duration-700 transform",
              sectionsVisible.location ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <div className="relative">
              {/* Section separator for location */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                  Location & Map
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
              </div>
              
              <PropertyLocationSection property={property} />
            </div>
          </div>

          {/* Coworking Specific Details */}
          {isCoworkingProperty && (
            <div 
              id="section-coworking"
              className={cn(
                "transition-all duration-700 transform",
                sectionsVisible.location ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <div className="relative">
                {/* Section separator for coworking details */}
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                    Coworking Specifications
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
                </div>
                
                <CoworkingSpecificDetailsSection coworkingDetails={steps} />
              </div>
            </div>
          )}

          {/* Sale/Rental Details */}
          {priceDetails && !isPGHostelProperty && !isFlatmatesProperty && !isCoworkingProperty && (
            <div 
              id="section-pricing"
              className={cn(
                "transition-all duration-700 transform",
                sectionsVisible.pricing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <div className="relative">
                {/* Section separator for pricing */}
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                    {isCurrentSaleProperty ? 'Sale Details' : 'Rental Details'}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
                </div>
                
                <PricingDetailsSection
                  listingType={flow.listingType}
                  pricingDetails={priceDetails}
                />
              </div>
            </div>
          )}

          {/* All remaining flow-specific sections - These come BEFORE Features/Amenities */}
          {remainingStepKeys.length > 0 && remainingStepKeys.map((stepId, index) => {
            // Only render if there's actual step data
            const stepData = steps[stepId];
            if (!stepData || (typeof stepData === 'object' && Object.keys(stepData).length === 0)) {
              return null;
            }

            // Generate clean title for the section
            const cleanTitle = stepId.includes('flatmate') ? 'Flatmate Details' 
                             : stepId.includes('pg_details') ? 'PG Facilities'
                             : stepId.includes('coworking') ? 'Workspace Details'
                             : stepId.includes('land') ? 'Land Features'
                             : stepId.includes('commercial') ? 'Commercial Features'
                             : stepId.includes('rental') ? 'Rental Information'
                             : stepId.includes('sale') ? 'Sale Information'
                             : 'Additional Details';

            return (
              <div 
                key={stepId}
                id={`section-${stepId}`}
                className={cn(
                  "transition-all duration-700 transform",
                  sectionsVisible.remaining ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Section separator for additional sections */}
                  <div className="flex items-center mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                      {cleanTitle}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
                  </div>
                  
                  <StepSection
                    stepId={stepId}
                    stepData={stepData}
                    title={cleanTitle}
                  />
                </div>
              </div>
            );
          })}

          {/* Features/Amenities - MOVED TO BE THE ABSOLUTE LAST SECTION */}
          {featuresDetails && (
            <div 
              id="section-features"
              className={cn(
                "transition-all duration-700 transform",
                sectionsVisible.features ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <div className="relative">
                {/* Visual separator to emphasize this is the final section */}
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <div className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-muted-foreground border">
                    Features & Amenities
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
                </div>
                
                <FeaturesAmenitiesSection featuresData={featuresDetails} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column with staggered animations */}
        <div className={cn(
          "space-y-6 transition-all duration-700 transform",
          sectionsVisible.sidebar ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          {/* Property Code Section - MOVED TO SIDEBAR */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-muted-foreground">Property Code</span>
                </div>
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
                  <span className="text-xl font-bold font-mono text-primary tracking-wider">
                    {propertyCode || 'LOADING'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (propertyCode) {
                    navigator.clipboard.writeText(propertyCode);
                    toast({
                      title: "Code Copied",
                      description: `Property code "${propertyCode}" copied to clipboard`,
                      variant: "default"
                    });
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
                  "hover:scale-105 hover:shadow-sm"
                )}
                disabled={!propertyCode}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Use this unique code to quickly reference this property
            </div>
          </div>

          {/* Contact Owner Card - Only show if current user is NOT the property owner */}
          {!isPropertyOwner && (
            <ContactOwnerCard
              propertyTitle={propertyTitle}
              propertyId={propertyId}
              ownerId={ownerId}
              ownerInfo={property.ownerInfo}
            />
          )}

          {propertyDetails?.highlights && (
            <PropertyHighlightsCard
              highlights={propertyDetails.highlights}
            />
          )}

          <SimilarProperties
            properties={SIMILAR_PROPERTIES_DATA.map(prop => ({
              id: prop.id,
              title: prop.title,
              city: prop.city,
              state: prop.state,
              price: prop.price,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              square_feet: prop.square_feet
            }))}
          />

          <NearbyAmenities
            address={location?.address || property.address}
            city={location?.city || property.city}
            state={location?.state || property.state}
            coordinates={coordinates}
            radius={1500}
          />
        </div>
      </div>

      {/* Enhanced Visit Request Dialog */}
      <VisitRequestDialog
        propertyId={propertyId}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
      />

      {/* Success feedback overlay */}
      {pageLoaded && (
        <div className="fixed bottom-4 right-4 pointer-events-none">
          <div className={cn(
            "bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-lg",
            "transition-all duration-500 transform",
            "translate-y-0 opacity-100"
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Property loaded successfully</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;