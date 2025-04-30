// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 4.2.0
// Last Modified: 30-04-2025 10:15 IST
// Purpose: Add image upload functionality to property details page

import React, { useState, useEffect } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import small components
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
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading
}) => {
  const { toast } = useToast();
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add debugging for property data
  useEffect(() => {
    console.log('[PropertyDetails Component] Received property data:', property);
    console.log('[PropertyDetails Component] Loading state:', isLoading);
    
    if (property) {
      // Check key property fields
      console.log('[PropertyDetails Component] Key fields check:');
      console.log('- title:', property.title);
      console.log('- address:', property.address);
      console.log('- description:', property.description);
      console.log('- price:', property.price);
      console.log('- bedrooms:', property.bedrooms);
      console.log('- bathrooms:', property.bathrooms);
      console.log('- square_feet:', property.square_feet);
      console.log('- property_details:', property.property_details);
      console.log('- property_images:', property.property_images?.length || 0, 'images');
      console.log('- ownerInfo:', property.ownerInfo);
    }
  }, [property, isLoading, refreshTrigger]);
  
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
  
  // Ensure property has required fields with defaults
  const safeProperty = {
    ...property,
    title: property.title || "Untitled Property",
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    square_feet: property.square_feet || 0,
    description: property.description || "No description provided for this property.",
    property_details: property.property_details || {},
    property_images: property.property_images || []
  };
  
  // Get formatted location string
  const getLocationString = () => {
    return [safeProperty.address, safeProperty.city, safeProperty.state, safeProperty.zip_code]
      .filter(Boolean)
      .join(", ") || "Location not specified";
  };
  
  // Get property coordinates from property_details if available
  const getPropertyCoordinates = () => {
    const lat = parseFloat(safeProperty.property_details?.latitude || '0');
    const lng = parseFloat(safeProperty.property_details?.longitude || '0');
    
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
    return undefined;
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: safeProperty.title,
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

  // Handle image upload complete
  const handleImageUploaded = () => {
    toast({
      title: "Image Uploaded",
      description: "Your image has been added to the property",
      variant: "default"
    });
    // Trigger a refresh of the property data
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Title Section */}
      <PropertyHeader 
        title={safeProperty.title} 
        location={getLocationString()} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <PropertyGalleryCard images={safeProperty.property_images} />
          
          {/* Image Upload Component (only shown to authorized users) */}
          <PropertyImageUpload 
            property={safeProperty} 
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
            price={safeProperty.price}
            listingType={safeProperty.property_details?.listingType}
            bedrooms={safeProperty.bedrooms}
            bathrooms={safeProperty.bathrooms}
            squareFeet={safeProperty.square_feet}
          />
          
          {/* About this property */}
          <PropertyDescriptionSection description={safeProperty.description} />
          
          {/* Property Type and Features */}
          {safeProperty.property_details && (
            <PropertyFeaturesSection propertyDetails={safeProperty.property_details} />
          )}
          
          {/* Amenities */}
          {safeProperty.property_details?.amenities && (
            <PropertyAmenitiesSection amenities={safeProperty.property_details.amenities} />
          )}
          
          {/* Property Location Map */}
          <PropertyLocationSection
            address={safeProperty.address || ''}
            city={safeProperty.city || ''}
            state={safeProperty.state || ''}
            zipCode={safeProperty.zip_code || ''}
            coordinates={getPropertyCoordinates()}
          />
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          <ContactOwnerCard
            propertyTitle={safeProperty.title}
            propertyId={safeProperty.id}
            ownerId={safeProperty.owner_id}
            ownerInfo={safeProperty.ownerInfo}
          />
          
          {safeProperty.property_details?.highlights && (
            <PropertyHighlightsCard 
              highlights={safeProperty.property_details.highlights} 
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
            address={safeProperty.address || ''}
            city={safeProperty.city || ''}
            state={safeProperty.state || ''}
            coordinates={getPropertyCoordinates()}
            radius={1500}
          />
        </div>
      </div>
      
      {/* Visit Request Dialog */}
      <VisitRequestDialog
        propertyId={safeProperty.id}
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