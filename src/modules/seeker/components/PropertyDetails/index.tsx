// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 7.3.0
// Last Modified: 01-05-2025 23:30 IST
// Purpose: Enhanced listing type display and removed debugging code

import React, { useState } from 'react';
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
import BasicDetailsSection from './BasicDetailsSection';

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

// Format currency values
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Format date values
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Function to prepare basic details data from property
const prepareBasicDetailsData = (property: any) => {
  if (!property) {
    return undefined;
  }
  
  // Use the basicDetails if available, or create a minimal object
  if (property.basicDetails) {
    return property.basicDetails;
  } else {
    // Create a compatible basicDetails object from property
    return {
      propertyType: property.property_details?.propertyType || 'Residential',
      bhkType: property.bedrooms ? `${property.bedrooms} BHK` : '',
      bathrooms: property.bathrooms || 0,
      balconies: property.property_details?.balconies || 0,
      floor: property.property_details?.floor || 0,
      totalFloors: property.property_details?.totalFloors || 0,
      builtUpArea: property.square_feet || 0,
      builtUpAreaUnit: 'sqft',
      facing: property.property_details?.facing || '',
      propertyAge: property.property_details?.propertyAge || '',
      possessionDate: property.property_details?.possessionDate || ''
    };
  }
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
  
  // Handle image upload completed and trigger refresh
  const handleImageUploaded = () => {
    if (onRefresh) {
      onRefresh();
      
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
  
  // Get property title
  const propertyTitle = property.title || 
                       (property.basicDetails && property.basicDetails.title) || 
                       `${property.basicDetails?.propertyType || 'Property'} in ${property.location?.city || property.city || ''}`;
  
  // Get property price based on listing type
  let propertyPrice = 0;
  if (property.flow?.listingType === 'rent' && property.rental?.rentAmount) {
    propertyPrice = safeParseInt(property.rental.rentAmount);
  } else if (property.flow?.listingType === 'sale' && property.sale?.expectedPrice) {
    propertyPrice = safeParseInt(property.sale.expectedPrice);
  } else {
    propertyPrice = safeParseInt(property.price);
  }
  
  // Get listing type
  const listingType = property.flow?.listingType || 'rent';
  const isSaleProperty = listingType === 'sale';
  
  // Get property category
  const propertyCategory = property.flow?.category || 'residential';
  
  // Format listing type for display
  const getListingTypeDisplay = () => {
    if (isSaleProperty) {
      return 'For Sale';
    } else {
      return 'For Rent';
    }
  };
  
  // Format price label based on listing type
  const getPriceLabel = () => {
    if (isSaleProperty) {
      return 'Sale Price';
    } else {
      return 'Monthly Rent';
    }
  };
  
  // Extract bedrooms from bhkType
  let bedrooms = 0;
  if (property.basicDetails?.bhkType) {
    const match = property.basicDetails.bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = parseInt(match[1], 10);
    }
  } else if (property.bedrooms) {
    bedrooms = safeParseInt(property.bedrooms);
  }
  
  // Get bathrooms
  const bathrooms = property.basicDetails?.bathrooms 
    ? safeParseInt(property.basicDetails.bathrooms)
    : property.bathrooms
      ? safeParseInt(property.bathrooms)
      : 0;
  
  // Get square feet
  const squareFeet = property.basicDetails?.builtUpArea
    ? safeParseInt(property.basicDetails.builtUpArea)
    : property.square_feet
      ? safeParseInt(property.square_feet)
      : 0;
  
  // Get description
  const description = property.features?.description || property.description || "No description provided for this property.";
  
  // Get amenities
  const amenities = property.features?.amenities || [];
  
  // Get location info
  const locationAddress = property.location?.address || property.address;
  const locationCity = property.location?.city || property.city;
  const locationState = property.location?.state || property.state;
  const locationZipCode = property.location?.pinCode || property.zip_code;
  
  // Format location string
  const locationString = [locationAddress, locationCity, locationState, locationZipCode]
    .filter(Boolean)
    .join(", ") || "Location not specified";
  
  // Get coordinates
  const propertyCoordinates = (() => {
    if (property.location?.coordinates) {
      const lat = property.location.coordinates.latitude;
      const lng = property.location.coordinates.longitude;
      
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return { lat, lng };
      }
    }
    if (property.property_details?.latitude && property.property_details?.longitude) {
      const lat = property.property_details.latitude;
      const lng = property.property_details.longitude;
      
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return { lat, lng };
      }
    }
    return undefined;
  })();

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
  
  // Prepare the basicDetails data
  const basicDetailsData = prepareBasicDetailsData(property);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Title Section with Listing Type Badge */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{propertyTitle}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSaleProperty ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {getListingTypeDisplay()}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium capitalize">
            {propertyCategory}
          </span>
        </div>
        <p className="text-muted-foreground">{locationString}</p>
      </div>
      
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
          
          {/* Property Overview Card with Price Label */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold">{getPriceLabel()}</h3>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(propertyPrice)}</p>
                  {isSaleProperty && property.sale?.priceNegotiable && (
                    <p className="text-sm text-green-600 mt-1">Price Negotiable</p>
                  )}
                  {!isSaleProperty && property.rental?.rentNegotiable && (
                    <p className="text-sm text-green-600 mt-1">Rent Negotiable</p>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
                    <span className="text-xl font-semibold">{bedrooms}</span>
                    <span className="text-sm text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
                    <span className="text-xl font-semibold">{bathrooms}</span>
                    <span className="text-sm text-muted-foreground">Baths</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-lg">
                    <span className="text-xl font-semibold">{squareFeet}</span>
                    <span className="text-sm text-muted-foreground">Sq.ft</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Basic Details Section */}
          <BasicDetailsSection basicDetails={basicDetailsData} />
          
          {/* Sale Details Section - Only shown for Sale properties */}
          {isSaleProperty && property.sale && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sale Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Price:</p>
                    <p className="font-medium">
                      {property.sale.expectedPrice 
                        ? formatCurrency(property.sale.expectedPrice) 
                        : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Cost:</p>
                    <p className="font-medium">
                      {property.sale.maintenanceCost 
                        ? formatCurrency(property.sale.maintenanceCost) 
                        : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Kitchen Type:</p>
                    <p className="font-medium">{property.sale.kitchenType || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Available From:</p>
                    <p className="font-medium">
                      {property.sale.possessionDate 
                        ? formatDate(property.sale.possessionDate) 
                        : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Price Negotiable:</p>
                    <p className="font-medium">
                      {property.sale.priceNegotiable === true ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Rental Details Section - Only shown for Rental properties */}
          {!isSaleProperty && property.rental && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Rental Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent:</p>
                    <p className="font-medium">
                      {property.rental.rentAmount 
                        ? formatCurrency(property.rental.rentAmount) 
                        : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Security Deposit:</p>
                    <p className="font-medium">
                      {property.rental.securityDeposit 
                        ? formatCurrency(property.rental.securityDeposit) 
                        : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Charges:</p>
                    <p className="font-medium">
                      {property.rental.maintenanceCharges 
                        ? formatCurrency(property.rental.maintenanceCharges) 
                        : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Available From:</p>
                    <p className="font-medium">
                      {property.rental.availableFrom 
                        ? formatDate(property.rental.availableFrom) 
                        : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Furnishing Status:</p>
                    <p className="font-medium">{property.rental.furnishingStatus || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Duration:</p>
                    <p className="font-medium">{property.rental.leaseDuration || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Rent Negotiable:</p>
                    <p className="font-medium">
                      {property.rental.rentNegotiable === true ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Features & Amenities Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Furnishing:</p>
                  <p className="font-medium">{property.features?.furnishing || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Parking:</p>
                  <p className="font-medium">{property.features?.parking || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Property Show Option:</p>
                  <p className="font-medium">{property.features?.propertyShowOption || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Gated Security:</p>
                  <p className="font-medium">
                    {property.features?.gatedSecurity === true ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Non-Veg Allowed:</p>
                  <p className="font-medium">
                    {property.features?.nonVegAllowed === true ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Gym Available:</p>
                  <p className="font-medium">
                    {property.features?.hasGym === true ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Amenities:</p>
                  <p className="font-medium">
                    {amenities && amenities.length > 0 
                      ? amenities.join(', ') 
                      : 'No amenities specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* About this property */}
          <PropertyDescriptionSection description={description} />
          
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
          
          {property.property_details?.highlights && (
            <PropertyHighlightsCard 
              highlights={property.property_details.highlights} 
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