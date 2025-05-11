// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 10.1.0
// Last Modified: 10-05-2025 15:45 IST
// Purpose: Updated to better reflect property data from JSON and improved property type/listing type display

import React, { useState, useEffect } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import existing components
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

// Import helper components and utilities
import FeatureDetailsCard from './FeatureDetailsCard';
import RentalDetailsCard from './RentalDetailsCard';
import SaleDetailsCard from './SaleDetailsCard';
import PropertyOverview from './PropertyOverview';
import PropertyNotFound from './PropertyNotFound';
import { PropertyDetailsSkeleton } from './PropertyDetailsSkeleton';
import { getPropertyData, extractImagesFromJson } from './utils/propertyDataUtils';

// Static data for similar properties
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

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading,
  onRefresh
}) => {
  const { toast } = useToast();
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  
  // Use effect to extract and process images
  useEffect(() => {
    if (!property) return;
    
    // Extract images from the property JSON structure
    const extractedImages = extractImagesFromJson(property);
    
    if (extractedImages.length > 0) {
      // Use setState to trigger re-render with images
      setPropertyImages(extractedImages);
    }
  }, [property]);
  
  // Update image count in debug info to match actual property_details
  useEffect(() => {
    if (property && property.property_details && property.property_details.images) {
      // Update propertyImages state with correct data from property_details.images
      if (Array.isArray(property.property_details.images) && property.property_details.images.length > 0) {
        // Use the data directly from property_details.images
        const directImages = property.property_details.images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx}`,
          url: img.dataUrl || img.url || '',
          is_primary: !!img.isPrimary || !!img.is_primary,
          display_order: idx
        }));
        
        setPropertyImages(directImages);
      }
    }
  }, [property]);
  
  // Handle image upload completion
  const handleImageUploaded = () => {
    if (onRefresh) {
      onRefresh();
      
      // After refresh, show toast notification
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
    return <PropertyNotFound />;
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
    description
  } = propertyData;
  
  // Get listing type and category
  const listingType = flow?.listingType || property.property_details?.listingType || 'rent';
  const isSaleProperty = listingType.toLowerCase() === 'sale';
  const propertyCategory = flow?.category || property.property_details?.category || 'residential';
  
  // Get property type for tag display
  const propertyType = basicDetails?.propertyType || property.property_details?.propertyType || propertyCategory;
  
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
    bedrooms = property.bedrooms;
  }
  
  // Get bathrooms and square feet
  const bathrooms = basicDetails?.bathrooms || property.bathrooms || 0;
  const squareFeet = basicDetails?.builtUpArea || property.square_feet || 0;
  
  // Format location string
  const locationAddress = location?.address || property.address || '';
  const locationCity = location?.city || property.city || '';
  const locationState = location?.state || property.state || '';
  const locationZipCode = location?.pinCode || property.zip_code || '';
  
  const locationString = [locationAddress, locationCity, locationState, locationZipCode]
    .filter(Boolean)
    .join(", ") || "Location not specified";
  
  // Extract coordinates with proper null checks
  const propertyCoordinates = (() => {
    // Try direct latitude/longitude properties first (top-level)
    if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
      return { lat: property.latitude, lng: property.longitude };
    }
    
    // Try string latitude/longitude and parse them
    if (property.latitude && property.longitude) {
      try {
        const lat = parseFloat(String(property.latitude));
        const lng = parseFloat(String(property.longitude));
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      } catch (e) {
        // Silent catch
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
            return { lat, lng };
          }
        } catch (e) {
          // Silent catch
        }
      }
      
      // Try lat/lng format
      if (coords.lat && coords.lng) {
        try {
          const lat = parseFloat(String(coords.lat));
          const lng = parseFloat(String(coords.lng));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        } catch (e) {
          // Silent catch
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
              return { lat, lng };
            }
          } catch (e) {
            // Silent catch
          }
        }
        
        // Try lat/lng format
        if (coords.lat && coords.lng) {
          try {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              return { lat, lng };
            }
          } catch (e) {
            // Silent catch
          }
        }
      }
      
      // Try direct lat/lng or latitude/longitude properties in property_details
      if (details.latitude && details.longitude) {
        try {
          const lat = parseFloat(String(details.latitude));
          const lng = parseFloat(String(details.longitude));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        } catch (e) {
          // Silent catch
        }
      }
      
      if (details.lat && details.lng) {
        try {
          const lat = parseFloat(String(details.lat));
          const lng = parseFloat(String(details.lng));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        } catch (e) {
          // Silent catch
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
              return { lat, lng };
            }
          } catch (e) {
            // Silent catch
          }
        }
        
        // Try lat/lng format
        if (coords.lat && coords.lng) {
          try {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng)) {
              return { lat, lng };
            }
          } catch (e) {
            // Silent catch
          }
        }
      }
    }
    
    return null;
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
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Title Section with Listing Type Badge */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{propertyTitle}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSaleProperty ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            For {isSaleProperty ? 'Sale' : 'Rent'}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium capitalize">
            {propertyType}
          </span>
        </div>
        <p className="text-muted-foreground">{locationString}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Debug Info Box - For Admin/Developers */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-sm">
              <div><strong>PropertyId:</strong> {id}</div>
              <div><strong>Images:</strong> {propertyImages.length}</div>
              <div><strong>First image filename:</strong> {propertyImages[0]?.fileName || 'None'}</div>
              <div><strong>Current Image:</strong> {propertyImages.findIndex(img => img.is_primary || img.isPrimary) + 1}/{propertyImages.length}</div>
            </div>
          )}
          
          {/* Image Gallery - Using propertyImages state */}
          <PropertyGalleryCard images={propertyImages} />
          
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

export default PropertyDetails;