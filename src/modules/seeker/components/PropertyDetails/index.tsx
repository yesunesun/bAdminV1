// src/modules/seeker/components/PropertyDetails/index.tsx  
// Version: 17.0.0
// Last Modified: 27-05-2025 17:20 IST
// Purpose: Fully refactored main component using extracted hooks, components, and services

import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

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

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading,
  onRefresh,
  directUrls
}) => {
  const { toast } = useToast();
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');

  // Use custom hooks for data processing and media management
  const propertyData = usePropertyData(property);
  const { propertyImages, handleMediaUploaded } = usePropertyMedia(property, onRefresh);

  // Handle title update
  const handleTitleUpdated = (newTitle: string) => {
    setDisplayTitle(newTitle);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Loading state
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  // Error state - Property not found
  if (!property || !propertyData) {
    return <PropertyNotFound />;
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

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: propertyTitle,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Property link copied to clipboard",
        variant: "default"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Title Section with Listing Type Badge */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {/* Editable title component */}
          <PropertyTitleEditor
            propertyId={propertyId}
            title={propertyTitle}
            ownerId={ownerId}
            onTitleUpdated={handleTitleUpdated}
          />

          {/* Enhanced badge display with flow type */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isCurrentSaleProperty ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
              For {isCurrentSaleProperty ? 'Sale' : 'Rent'}
            </span>

            {/* Show specific flow type badge */}
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
              {flowDisplayName}
            </span>

            {/* Show category if different from flow display name */}
            {flow.category && flow.category !== flowDisplayName.toLowerCase() && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium capitalize">
                {flow.category}
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">{locationString}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Media Gallery with Video Support */}
          <PropertyGallery
            images={propertyImages}
            video={property.property_video}
            propertyId={propertyId}
            directUrls={directUrls}
          />

          {/* Enhanced Image/Video Upload Component (consolidated) */}
          <PropertyImageUpload
            property={property}
            onImageUploaded={() => handleMediaUploaded('image')}
            onVideoUploaded={() => handleMediaUploaded('video')}
          />

          {/* Quick Actions */}
          <PropertyActionButtons
            isLiked={isLiked}
            onToggleLike={onToggleLike}
            onShare={handleShare}
            onScheduleVisit={() => setVisitDialogOpen(true)}
          />

          {/* Conditionally render property-specific details sections using extracted components */}
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

          {/* Section 2: Location - Use the PropertyLocationSection component */}
          <PropertyLocationSection property={property} />

          {/* Section 2.5: Coworking Specific Details - Only show for coworking properties */}
          {isCoworkingProperty && (
            <CoworkingSpecificDetailsSection coworkingDetails={steps} />
          )}

          {/* Section 3: Sale/Rental Details - Only show if not PG/Hostel, Flatmates, or Coworking using extracted component */}
          {priceDetails && !isPGHostelProperty && !isFlatmatesProperty && !isCoworkingProperty && (
            <PricingDetailsSection
              listingType={flow.listingType}
              pricingDetails={priceDetails}
            />
          )}

          {/* Section 4: Features/Amenities - Using enhanced component */}
          {featuresDetails && (
            <FeaturesAmenitiesSection featuresData={featuresDetails} />
          )}

          {/* Remaining sections using extracted StepSection component */}
          {remainingStepKeys.map(stepId => (
            <StepSection
              key={stepId}
              stepId={stepId}
              stepData={steps[stepId]}
            />
          ))}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <ContactOwnerCard
            propertyTitle={propertyTitle}
            propertyId={propertyId}
            ownerId={ownerId}
            ownerInfo={property.ownerInfo}
          />

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

      {/* Visit Request Dialog */}
      <VisitRequestDialog
        propertyId={propertyId}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
      />
    </div>
  );
};

export default PropertyDetails;