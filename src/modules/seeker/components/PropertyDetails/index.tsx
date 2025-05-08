// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 7.6.0
// Last Modified: 08-05-2025 20:30 IST
// Purpose: Fixed map location display with proper coordinate extraction

import React, { useState } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import components
import PropertyGalleryCard from './PropertyGalleryCard';
import PropertyActionButtons from './PropertyActionButtons';
import PropertyDescriptionSection from './PropertyDescriptionSection';
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

// Helper functions
const safeParseInt = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numMatch = value.match(/^(\d+)/);
    if (numMatch && numMatch[1]) {
      return parseInt(numMatch[1], 10) || 0;
    }
    return parseInt(value, 10) || 0;
  }
  return 0;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

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

// Extract data from property based on its structure (v3, v2, or legacy)
const getPropertyData = (property: any) => {
  if (!property) return null;
  
  // Check if property has property_details with v3 structure
  const propertyDetails = property.property_details || {};
  const isV3Format = propertyDetails._version === 'v3';
  
  // Extract data based on structure
  if (isV3Format) {
    const flow = propertyDetails.flow || { category: 'residential', listingType: 'rent' };
    const meta = propertyDetails.meta || { id: property.id, owner_id: property.owner_id };
    const details = propertyDetails.details || {};
    
    return {
      id: property.id || meta.id,
      owner_id: property.owner_id || meta.owner_id,
      flow,
      basicDetails: details.basicDetails || {},
      features: details.features || {},
      location: details.location || {},
      rentalInfo: details.rentalInfo || {},
      saleInfo: details.saleInfo || {},
      images: details.media?.photos?.images || property.property_images || [],
      description: details.features?.description || property.description || "No description provided for this property."
    };
  }
  
  // For v2 or legacy format
  return {
    id: property.id,
    owner_id: property.owner_id,
    flow: property.flow || propertyDetails.flow || { category: 'residential', listingType: 'rent' },
    basicDetails: property.basicDetails || propertyDetails.basicDetails || {
      propertyType: propertyDetails.propertyType || 'Residential',
      bhkType: property.bedrooms ? `${property.bedrooms} BHK` : '',
      bathrooms: property.bathrooms || 0,
      builtUpArea: property.square_feet || 0,
      builtUpAreaUnit: 'sqft'
    },
    features: property.features || propertyDetails.features || {},
    location: property.location || {
      address: property.address,
      city: property.city,
      state: property.state,
      pinCode: property.zip_code
    },
    rentalInfo: property.rental || propertyDetails.rental || {},
    saleInfo: property.sale || propertyDetails.sale || {},
    images: property.property_images || [],
    description: property.features?.description || property.description || "No description provided for this property."
  };
};

// Feature details card component
const FeatureDetailsCard = ({ features }: { features: any }) => {
  if (!features || Object.keys(features).length === 0) return null;
  
  const amenities = features.amenities || [];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
        <div className="grid grid-cols-2 gap-4">
          {features.parking && (
            <div>
              <p className="text-sm text-muted-foreground">Parking:</p>
              <p className="font-medium">{features.parking}</p>
            </div>
          )}
          
          {features.gatedSecurity !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Gated Security:</p>
              <p className="font-medium">
                {features.gatedSecurity === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.nonVegAllowed !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Non-Veg Allowed:</p>
              <p className="font-medium">
                {features.nonVegAllowed === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.petFriendly !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Pet Friendly:</p>
              <p className="font-medium">
                {features.petFriendly === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {features.powerBackup && (
            <div>
              <p className="text-sm text-muted-foreground">Power Backup:</p>
              <p className="font-medium">{features.powerBackup}</p>
            </div>
          )}
          
          {features.waterSupply && (
            <div>
              <p className="text-sm text-muted-foreground">Water Supply:</p>
              <p className="font-medium">{features.waterSupply}</p>
            </div>
          )}
          
          {amenities.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Amenities:</p>
              <p className="font-medium">{amenities.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Rental details card component
const RentalDetailsCard = ({ rentalInfo }: { rentalInfo: any }) => {
  if (!rentalInfo || Object.keys(rentalInfo).length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rental Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {rentalInfo.rentAmount !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent:</p>
              <p className="font-medium">
                {formatCurrency(rentalInfo.rentAmount)}
              </p>
            </div>
          )}
          
          {rentalInfo.securityDeposit !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Security Deposit:</p>
              <p className="font-medium">
                {formatCurrency(rentalInfo.securityDeposit)}
              </p>
            </div>
          )}
          
          {rentalInfo.maintenanceCharges !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Maintenance Charges:</p>
              <p className="font-medium">
                {rentalInfo.maintenanceCharges
                  ? formatCurrency(rentalInfo.maintenanceCharges)
                  : '-'}
              </p>
            </div>
          )}
          
          {rentalInfo.availableFrom && (
            <div>
              <p className="text-sm text-muted-foreground">Available From:</p>
              <p className="font-medium">
                {formatDate(rentalInfo.availableFrom)}
              </p>
            </div>
          )}
          
          {rentalInfo.furnishingStatus && (
            <div>
              <p className="text-sm text-muted-foreground">Furnishing Status:</p>
              <p className="font-medium">{rentalInfo.furnishingStatus}</p>
            </div>
          )}
          
          {rentalInfo.leaseDuration && (
            <div>
              <p className="text-sm text-muted-foreground">Lease Duration:</p>
              <p className="font-medium">{rentalInfo.leaseDuration}</p>
            </div>
          )}
          
          {rentalInfo.rentNegotiable !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Rent Negotiable:</p>
              <p className="font-medium">
                {rentalInfo.rentNegotiable === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          
          {rentalInfo.preferredTenants && rentalInfo.preferredTenants.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Preferred Tenants:</p>
              <p className="font-medium">{rentalInfo.preferredTenants.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Sale details card component
const SaleDetailsCard = ({ saleInfo }: { saleInfo: any }) => {
  if (!saleInfo || Object.keys(saleInfo).length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sale Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {saleInfo.expectedPrice !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Expected Price:</p>
              <p className="font-medium">
                {formatCurrency(saleInfo.expectedPrice)}
              </p>
            </div>
          )}
          
          {saleInfo.maintenanceCost !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Maintenance Cost:</p>
              <p className="font-medium">
                {saleInfo.maintenanceCost
                  ? formatCurrency(saleInfo.maintenanceCost)
                  : '-'}
              </p>
            </div>
          )}
          
          {saleInfo.kitchenType && (
            <div>
              <p className="text-sm text-muted-foreground">Kitchen Type:</p>
              <p className="font-medium">{saleInfo.kitchenType}</p>
            </div>
          )}
          
          {saleInfo.possessionDate && (
            <div>
              <p className="text-sm text-muted-foreground">Available From:</p>
              <p className="font-medium">
                {formatDate(saleInfo.possessionDate)}
              </p>
            </div>
          )}
          
          {saleInfo.priceNegotiable !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Price Negotiable:</p>
              <p className="font-medium">
                {saleInfo.priceNegotiable === true ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Property overview component
const PropertyOverview = ({ 
  propertyData, 
  listingType, 
  bedrooms, 
  bathrooms, 
  squareFeet 
}: { 
  propertyData: any, 
  listingType: string, 
  bedrooms: number, 
  bathrooms: number, 
  squareFeet: number 
}) => {
  const isSaleProperty = listingType === 'sale';
  const priceNegotiable = isSaleProperty 
    ? propertyData.saleInfo?.priceNegotiable 
    : propertyData.rentalInfo?.rentNegotiable;
  
  const price = isSaleProperty 
    ? safeParseInt(propertyData.saleInfo?.expectedPrice || 0) 
    : safeParseInt(propertyData.rentalInfo?.rentAmount || 0);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">
              {isSaleProperty ? 'Sale Price' : 'Monthly Rent'}
            </h3>
            <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
            {priceNegotiable && (
              <p className="text-sm text-green-600 mt-1">
                {isSaleProperty ? 'Price Negotiable' : 'Rent Negotiable'}
              </p>
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
  );
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
  
  // Extract all the property data based on its structure
  const propertyData = getPropertyData(property);
  if (!propertyData) return null;
  
  // Get common property details
  const {
    id,
    owner_id,
    flow,
    basicDetails,
    features,
    location,
    rentalInfo,
    saleInfo,
    images,
    description
  } = propertyData;
  
  // Get listing type and category
  const listingType = flow.listingType || 'rent';
  const isSaleProperty = listingType === 'sale';
  const propertyCategory = flow.category || 'residential';
  
  // Get property title
  const propertyTitle = basicDetails?.title || 
                      property.title || 
                      `${basicDetails?.propertyType || 'Property'} in ${location?.city || ''}`;
  
  // Extract bedrooms from bhkType
  let bedrooms = 0;
  if (basicDetails?.bhkType) {
    const match = basicDetails.bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = parseInt(match[1], 10);
    }
  } else if (property.bedrooms) {
    bedrooms = safeParseInt(property.bedrooms);
  }
  
  // Get bathrooms and square feet
  const bathrooms = safeParseInt(basicDetails?.bathrooms || property.bathrooms || 0);
  const squareFeet = safeParseInt(basicDetails?.builtUpArea || property.square_feet || 0);
  
  // Format location string
  const locationAddress = location?.address || property.address || '';
  const locationCity = location?.city || property.city || '';
  const locationState = location?.state || property.state || '';
  const locationZipCode = location?.pinCode || property.zip_code || '';
  
  const locationString = [locationAddress, locationCity, locationState, locationZipCode]
    .filter(Boolean)
    .join(", ") || "Location not specified";
  
  // Extract coordinates with proper null checks - completely rewritten for safety
  const propertyCoordinates = (() => {
    console.log("Extracting coordinates from property data");
    
    // Try direct latitude/longitude properties first (top-level)
    if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
      console.log("Found direct lat/lng properties:", property.latitude, property.longitude);
      return { lat: property.latitude, lng: property.longitude };
    }
    
    // Try string latitude/longitude and parse them
    if (property.latitude && property.longitude) {
      try {
        const lat = parseFloat(String(property.latitude));
        const lng = parseFloat(String(property.longitude));
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log("Parsed string lat/lng properties:", lat, lng);
          return { lat, lng };
        }
      } catch (e) {
        console.error("Error parsing lat/lng:", e);
      }
    }
    
    // Check location object if it exists and has coordinates
    if (location && location.coordinates) {
      const coords = location.coordinates;
      
      // Try latitude/longitude format
      if (coords.latitude && coords.longitude) {
        try {
          const lat = parseFloat(String(coords.latitude));
          const lng = parseFloat(String(coords.longitude));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("Using location.coordinates latitude/longitude:", lat, lng);
            return { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing location.coordinates latitude/longitude:", e);
        }
      }
      
      // Try lat/lng format
      if (coords.lat && coords.lng) {
        try {
          const lat = parseFloat(String(coords.lat));
          const lng = parseFloat(String(coords.lng));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("Using location.coordinates lat/lng:", lat, lng);
            return { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing location.coordinates lat/lng:", e);
        }
      }
    }
    
    // Check property_details if it exists
    if (property.property_details) {
      const details = property.property_details;
      
      // Try direct coordinates object
      if (details.coordinates) {
        const coords = details.coordinates;
        
        // Try latitude/longitude format
        if (coords.latitude && coords.longitude) {
          try {
            const lat = parseFloat(String(coords.latitude));
            const lng = parseFloat(String(coords.longitude));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Using property_details.coordinates latitude/longitude:", lat, lng);
              return { lat, lng };
            }
          } catch (e) {
            console.error("Error parsing property_details.coordinates latitude/longitude:", e);
          }
        }
        
        // Try lat/lng format
        if (coords.lat && coords.lng) {
          try {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Using property_details.coordinates lat/lng:", lat, lng);
              return { lat, lng };
            }
          } catch (e) {
            console.error("Error parsing property_details.coordinates lat/lng:", e);
          }
        }
      }
      
      // Try direct lat/lng or latitude/longitude properties in property_details
      if (details.latitude && details.longitude) {
        try {
          const lat = parseFloat(String(details.latitude));
          const lng = parseFloat(String(details.longitude));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("Using property_details latitude/longitude:", lat, lng);
            return { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing property_details latitude/longitude:", e);
        }
      }
      
      if (details.lat && details.lng) {
        try {
          const lat = parseFloat(String(details.lat));
          const lng = parseFloat(String(details.lng));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("Using property_details lat/lng:", lat, lng);
            return { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing property_details lat/lng:", e);
        }
      }
      
      // Try nested location.coordinates
      if (details.location && details.location.coordinates) {
        const coords = details.location.coordinates;
        
        // Try latitude/longitude format
        if (coords.latitude && coords.longitude) {
          try {
            const lat = parseFloat(String(coords.latitude));
            const lng = parseFloat(String(coords.longitude));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Using property_details.location.coordinates latitude/longitude:", lat, lng);
              return { lat, lng };
            }
          } catch (e) {
            console.error("Error parsing property_details.location.coordinates latitude/longitude:", e);
          }
        }
        
        // Try lat/lng format
        if (coords.lat && coords.lng) {
          try {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Using property_details.location.coordinates lat/lng:", lat, lng);
              return { lat, lng };
            }
          } catch (e) {
            console.error("Error parsing property_details.location.coordinates lat/lng:", e);
          }
        }
      }
    }
    
    console.log("No valid coordinates found in property data");
    return null;
  })();

  // Log coordinate extraction result
  console.log("Final coordinates:", propertyCoordinates);

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
          <h1 className="text-2xl sm:text-3xl font-bold">{propertyTitle}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSaleProperty ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {isSaleProperty ? 'For Sale' : 'For Rent'}
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
          <PropertyGalleryCard images={images} />
          
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
          <PropertyOverview 
            propertyData={propertyData}
            listingType={listingType}
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            squareFeet={squareFeet}
          />
          
          {/* Basic Details Section */}
          <BasicDetailsSection basicDetails={basicDetails} />
          
          {/* Sale Details Section - Only shown for Sale properties */}
          {isSaleProperty && <SaleDetailsCard saleInfo={saleInfo} />}
          
          {/* Rental Details Section - Only shown for Rental properties */}
          {!isSaleProperty && <RentalDetailsCard rentalInfo={rentalInfo} />}
          
          {/* Features & Amenities Section */}
          <FeatureDetailsCard features={features} />
          
          {/* About this property */}
          <PropertyDescriptionSection description={description} />
          
          {/* Property Location Map */}
          <PropertyLocationSection
            address={locationAddress}
            city={locationCity}
            state={locationState}
            zipCode={locationZipCode}
            coordinates={propertyCoordinates}
          />
          
          {/* Debug info for coordinates in development */}
          {import.meta.env.DEV && (
            <div className="p-3 bg-muted/30 text-xs text-muted-foreground rounded">
              <p>Coordinates Debug:</p>
              <p>Direct lat/lng: {property.latitude}, {property.longitude}</p>
              <p>Extracted: {propertyCoordinates ? `${propertyCoordinates.lat}, ${propertyCoordinates.lng}` : 'None'}</p>
            </div>
          )}
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          <ContactOwnerCard
            propertyTitle={propertyTitle}
            propertyId={id}
            ownerId={owner_id}
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
            address={locationAddress}
            city={locationCity}
            state={locationState}
            coordinates={propertyCoordinates}
            radius={1500}
          />
        </div>
      </div>
      
      {/* Visit Request Dialog */}
      <VisitRequestDialog
        propertyId={id}
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
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;