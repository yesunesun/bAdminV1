// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 6.0.0
// Last Modified: 01-05-2025 17:45 IST
// Purpose: Complete rewrite to properly support v2 property data format

import React, { useState, useEffect } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import components
import PropertyHeader from './PropertyHeader';
import PropertyGalleryCard from './PropertyGalleryCard';
import PropertyActionButtons from './PropertyActionButtons';
import PropertyOverviewCard from './PropertyOverviewCard';
import PropertyDescriptionSection from './PropertyDescriptionSection';
import PropertyFeaturesSection from './PropertyFeaturesSection';
import PropertyAmenitiesSection from './PropertyAmenitiesSection';
import PropertyLocationSection from './PropertyLocationSection';
import ContactOwnerCard from './ContactOwnerCard';
import PropertyHighlightsCard from './PropertyHighlightsCard';
import SimilarProperties from './SimilarProperties';
import NearbyAmenities from './NearbyAmenities';
import VisitRequestDialog from './VisitRequestDialog';
import PropertyImageUpload from './PropertyImageUpload';

// Static similar properties data
const similarPropertiesData = [
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

interface PropertyDetailsProps {
  property: PropertyDetailsType | null;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  onRefresh?: () => void;
}

// Helper function to safely parse numbers
const safeParseInt = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Extract the first numeric part if it's something like "2 BHK"
    const numMatch = value.match(/^(\d+)/);
    if (numMatch && numMatch[1]) {
      return parseInt(numMatch[1], 10) || 0;
    }
    return parseInt(value, 10) || 0;
  }
  return 0;
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading,
  onRefresh
}) => {
  const { toast } = useToast();
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  
  // Add debugging for property data
  useEffect(() => {
    if (property) {
      console.log('[PropertyDetails Component] Property data:', property);
    }
  }, [property]);
  
  // Handle image upload completed and trigger refresh
  const handleImageUploaded = () => {
    console.log("[PropertyDetails Component] Image uploaded, refreshing property data...");
    
    // Notify the parent component to refresh the data immediately
    if (onRefresh) {
      onRefresh();
      
      // Show toast after a short delay to ensure UI is updated
      setTimeout(() => {
        toast({
          title: "Images Updated",
          description: "Your property images have been updated",
          variant: "default"
        });
      }, 500);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }
  
  // Error state - Property not found
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Property Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          This property may have been removed or is no longer available.
        </p>
        <Button variant="default" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  // Check if it's v2 format
  const isV2Format = property._version === 'v2';
  
  // Extract property data based on format
  // V2 FORMAT DATA EXTRACTION
  
  // 1. Extract title
  const propertyTitle = property.title || 
                       (isV2Format ? property.basicDetails?.title : null) || 
                       "Untitled Property";
  
  // 2. Extract price
  let propertyPrice = 0;
  if (isV2Format) {
    // For v2, get price from rental amount if rental property
    if (property.flow?.listingType === 'rent' && property.rental?.rentAmount) {
      propertyPrice = safeParseInt(property.rental.rentAmount);
    } else {
      // Fallback to regular price field
      propertyPrice = safeParseInt(property.price);
    }
  } else {
    // For v1, use the price field directly
    propertyPrice = safeParseInt(property.price);
  }
  
  // 3. Extract listing type
  const listingType = isV2Format 
    ? (property.flow?.listingType || 'rent')
    : (property.property_details?.listingType || 'rent');
  
  // 4. Extract bedrooms
  let bedrooms = 0;
  if (isV2Format && property.basicDetails?.bhkType) {
    // Extract number from BHK type (e.g., "2 BHK" -> 2)
    const match = property.basicDetails.bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = safeParseInt(match[1]);
    }
  } else {
    bedrooms = safeParseInt(property.bedrooms);
  }
  
  // 5. Extract bathrooms
  let bathrooms = 0;
  if (isV2Format && property.basicDetails?.bathrooms) {
    bathrooms = safeParseInt(property.basicDetails.bathrooms);
  } else {
    bathrooms = safeParseInt(property.bathrooms);
  }
  
  // 6. Extract square feet
  let squareFeet = 0;
  if (isV2Format && property.basicDetails?.builtUpArea) {
    squareFeet = safeParseInt(property.basicDetails.builtUpArea);
  } else {
    squareFeet = safeParseInt(property.square_feet);
  }
  
  // 7. Extract description
  const description = isV2Format && property.features?.description
    ? property.features.description
    : property.description || "No description provided for this property.";
  
  // 8. Extract property details for features section
  let propertyDetails = property.property_details || {};
  
  // For v2 format, construct property details from various sections
  if (isV2Format) {
    propertyDetails = {
      propertyType: property.basicDetails?.propertyType || 'Residential',
      furnishingStatus: property.rental?.furnishingStatus || 'Unfurnished',
      facing: property.basicDetails?.facing || 'Not specified',
      floor: safeParseInt(property.basicDetails?.floor),
      totalFloors: safeParseInt(property.basicDetails?.totalFloors),
      propertyAge: property.basicDetails?.propertyAge || 'Not specified',
      amenities: property.features?.amenities || [],
      yearBuilt: property.basicDetails?.propertyAge || 'Not specified',
      availability: property.rental?.availableFrom 
        ? new Date(property.rental.availableFrom).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          }) 
        : 'Not specified',
      listingType: property.flow?.listingType || 'rent',
      // For location map
      latitude: property.location?.coordinates?.latitude,
      longitude: property.location?.coordinates?.longitude
    };
  }
  
  // 9. Extract location info
  const locationAddress = isV2Format ? property.location?.address : property.address;
  const locationCity = isV2Format ? property.location?.city : property.city;
  const locationState = isV2Format ? property.location?.state : property.state;
  const locationZipCode = isV2Format ? property.location?.pinCode : property.zip_code;
  
  // 10. Get formatted location string
  const locationString = [locationAddress, locationCity, locationState, locationZipCode]
    .filter(Boolean)
    .join(", ") || "Location not specified";
  
  // 11. Get property coordinates
  const propertyCoordinates = (() => {
    if (isV2Format && property.location?.coordinates) {
      const lat = property.location.coordinates.latitude;
      const lng = property.location.coordinates.longitude;
      
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return { lat, lng };
      }
    } else if (propertyDetails.latitude && propertyDetails.longitude) {
      const lat = parseFloat(propertyDetails.latitude.toString());
      const lng = parseFloat(propertyDetails.longitude.toString());
      
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return { lat, lng };
      }
    }
    return undefined;
  })();
  
  // 12. Extract amenities
  const amenities = isV2Format
    ? (property.features?.amenities || [])
    : (propertyDetails.amenities || []);

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
      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 p-2 mb-4 text-xs border rounded">
          <p><strong>Debug Info (v{property._version || '1'}):</strong></p>
          <p>Title: {propertyTitle}</p>
          <p>Price: {propertyPrice}</p>
          <p>Listing Type: {listingType}</p>
          <p>Bedrooms: {bedrooms}</p>
          <p>Bathrooms: {bathrooms}</p>
          <p>Square Feet: {squareFeet}</p>
          <p>Location: {locationString}</p>
          <p>Has Coordinates: {propertyCoordinates ? 'Yes' : 'No'}</p>
          <p>Amenities Count: {amenities.length}</p>
        </div>
      )}
      
      {/* Property Title Section */}
      <PropertyHeader 
        title={propertyTitle} 
        location={locationString} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <PropertyGalleryCard images={property.property_images || []} />
          
          {/* Image Upload Component (only shown to authorized users) */}
          <PropertyImageUpload 
            property={property} 
            onImageUploaded={handleImageUploaded} 
          />
          
          {/* Quick Actions */}
          <PropertyActionButtons
            isLiked={isLiked}
            onToggleLike={onToggleLike}
            onShare={handleShare}
            onScheduleVisit={() => setVisitDialogOpen(true)}
          />
          
          {/* Property Overview Card */}
          <PropertyOverviewCard
            price={propertyPrice}
            listingType={listingType}
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            squareFeet={squareFeet}
          />
          
          {/* About this property */}
          <PropertyDescriptionSection description={description} />
          
          {/* Property Type and Features */}
          <PropertyFeaturesSection propertyDetails={propertyDetails} />
          
          {/* Amenities */}
          {amenities.length > 0 && (
            <PropertyAmenitiesSection amenities={amenities} />
          )}
          
          {/* Property Location Map */}
          <PropertyLocationSection
            address={locationAddress || ''}
            city={locationCity || ''}
            state={locationState || ''}
            zipCode={locationZipCode || ''}
            coordinates={propertyCoordinates}
          />
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          <ContactOwnerCard
            propertyTitle={propertyTitle}
            propertyId={property.id}
            ownerId={property.owner_id}
            ownerInfo={property.ownerInfo}
          />
          
          {propertyDetails.highlights && (
            <PropertyHighlightsCard 
              highlights={propertyDetails.highlights} 
            />
          )}
          
          <SimilarProperties 
            properties={similarPropertiesData.map(prop => ({
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
            address={locationAddress || ''}
            city={locationCity || ''}
            state={locationState || ''}
            coordinates={propertyCoordinates}
            radius={1500}
          />
        </div>
      </div>
      
      {/* Visit Request Dialog */}
      <VisitRequestDialog
        propertyId={property.id}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
      />
    </div>
  );
};

// Loading state skeleton
const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery skeleton */}
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          
          {/* Actions skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          {/* Details skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between mb-6">
                <Skeleton className="h-8 w-36 mb-2" />
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          
          {/* Map skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Contact card skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          {/* Similar properties skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Nearby amenities skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;