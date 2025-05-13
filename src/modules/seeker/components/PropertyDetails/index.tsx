// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 11.4.0
// Last Modified: 14-05-2025 12:00 IST
// Purpose: Fixed similarPropertiesData reference error

import React, { useState, useEffect } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

// Import all components
import PropertyActionButtons from './PropertyActionButtons';
import ContactOwnerCard from './ContactOwnerCard';
import PropertyHighlightsCard from './PropertyHighlightsCard';
import SimilarProperties from './SimilarProperties';
import NearbyAmenities from './NearbyAmenities';
import VisitRequestDialog from './VisitRequestDialog';
import PropertyImageUpload from './PropertyImageUpload';
import PropertyNotFound from './PropertyNotFound';
import { PropertyDetailsSkeleton } from './PropertyDetailsSkeleton';
import { extractImagesFromJson } from './utils/propertyDataUtils';
import PropertyGalleryCard from './PropertyGalleryCard';

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

// Component to render a single step section based on step data
const StepSection: React.FC<{
  stepId: string;
  stepData: any;
  title?: string;
}> = ({ stepId, stepData, title }) => {
  if (!stepData || Object.keys(stepData).length === 0) {
    return null;
  }
  
  // Format step ID for display (e.g., "com_sale_basic_details" -> "Basic Details")
  const formatStepId = (id: string): string => {
    const parts = id.split('_');
    // Remove flow prefix (e.g., "com_sale") and join remaining parts
    const relevantParts = parts.slice(2);
    return relevantParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };
  
  const sectionTitle = title || formatStepId(stepId);
  
  // Special handling for description field to display it as a paragraph
  const descriptionField = Object.entries(stepData).find(
    ([key]) => key.toLowerCase() === 'description'
  );
  
  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>
      
      {/* Render description as a paragraph if it exists */}
      {descriptionField && (
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{descriptionField[1]}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {Object.entries(stepData)
          .filter(([key]) => key.toLowerCase() !== 'description') // Skip description as it's handled separately
          .map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-900">
                {renderFieldValue(value, key)}
              </span>
            </div>
          ))}
      </div>
    </Card>
  );
};

// Helper function to render field value with appropriate formatting
const renderFieldValue = (field: any, key: string) => {
  // Handle different data types appropriately
  if (field === null || field === undefined) {
    return 'Not specified';
  }
  
  if (typeof field === 'boolean') {
    return field ? 'Yes' : 'No';
  }
  
  if (Array.isArray(field)) {
    return field.join(', ');
  }
  
  // Format date fields (keys containing 'date', 'from', etc.)
  if (typeof field === 'string' && 
      (key.toLowerCase().includes('date') || 
       key.toLowerCase().includes('from') || 
       key.toLowerCase().includes('possession'))) {
    try {
      const date = new Date(field);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (e) {
      // If date parsing fails, return the original string
    }
  }
  
  // Format price fields (keys containing 'price', 'amount', etc.)
  if ((typeof field === 'number' || !isNaN(Number(field))) && 
      (key.toLowerCase().includes('price') || 
       key.toLowerCase().includes('amount') || 
       key.toLowerCase().includes('deposit') || 
       key.toLowerCase().includes('cost'))) {
    const numValue = typeof field === 'number' ? field : Number(field);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numValue);
  }
  
  return field.toString();
};

// Overview section component to show main property details
const PropertyOverviewSection: React.FC<{
  basicDetails: any;
  flow: any;
  price: number | string;
}> = ({ basicDetails, flow, price }) => {
  const listingType = flow?.listingType || 'rent';
  const isSaleProperty = listingType.toLowerCase() === 'sale';
  
  // Get property type, bedrooms, bathrooms, and area
  const propertyType = basicDetails?.propertyType || '';
  
  // Extract bedrooms from bhkType
  let bedrooms = 0;
  if (basicDetails?.bhkType) {
    const match = basicDetails.bhkType.match(/^(\d+)/);
    if (match && match[1]) {
      bedrooms = parseInt(match[1], 10);
    }
  }
  
  const bathrooms = basicDetails?.bathrooms || 0;
  const builtUpArea = basicDetails?.builtUpArea || 0;
  const builtUpAreaUnit = basicDetails?.builtUpAreaUnit || 'sqft';
  
  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="mt-2 md:mt-0">
          <span className="text-2xl font-bold text-primary">
            {typeof price === 'number' 
              ? new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(price)
              : price}
          </span>
          {!isSaleProperty && <span className="text-gray-500 ml-1">/month</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {propertyType && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Property Type</span>
            <span className="text-gray-900 capitalize">{propertyType}</span>
          </div>
        )}
        
        {bedrooms > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Bedrooms</span>
            <span className="text-gray-900">{bedrooms}</span>
          </div>
        )}
        
        {bathrooms > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Bathrooms</span>
            <span className="text-gray-900">{bathrooms}</span>
          </div>
        )}
        
        {builtUpArea > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Built-up Area</span>
            <span className="text-gray-900">{builtUpArea} {builtUpAreaUnit}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface PropertyDetailsProps {
  property: PropertyDetailsType | null;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  onRefresh?: () => void;
  directUrls?: string[]; // Add direct blob URLs prop
}

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

  // Extract structured data from property_details
  const propertyDetails = property.property_details || {};
  
  // Get flow information (category and listing type)
  const flow = propertyDetails.flow || { 
    category: 'residential', 
    listingType: 'rent' 
  };
  
  // Get steps from property_details if available
  const steps = propertyDetails.steps || {};
  
  // Get meta information
  const meta = propertyDetails.meta || { 
    id: property.id, 
    owner_id: property.owner_id 
  };
  
  // Get media information
  const media = propertyDetails.media || { 
    photos: { images: [] } 
  };

  // Extract key details for title and overview
  const propertyId = property.id || meta.id;
  const ownerId = property.owner_id || meta.owner_id;
  
  // Find the basic details step (naming convention may vary by flow)
  const basicDetailsStepKey = Object.keys(steps).find(key => 
    key.includes('basic_details')
  );
  
  const basicDetails = basicDetailsStepKey ? steps[basicDetailsStepKey] : null;
  
  // Get property title
  const propertyTitle = basicDetails?.title || property.title || 'Property';
  
  // Get location information
  const locationStepKey = Object.keys(steps).find(key => 
    key.includes('location')
  );
  
  const location = locationStepKey ? steps[locationStepKey] : null;
  
  // Format location string
  const locationParts = location ? [
    location.address,
    location.area,
    location.city,
    location.state,
    location.pinCode
  ].filter(Boolean) : [];
  
  const locationString = locationParts.length > 0
    ? locationParts.join(', ')
    : property.address 
      ? [property.address, property.city, property.state, property.zip_code].filter(Boolean).join(', ')
      : "Location not specified";
  
  // Get coordinates
  const coordinates = location
    ? { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }
    : null;
  
  // Get price information
  const isSaleProperty = flow.listingType.toLowerCase() === 'sale';
  
  // Find sale or rental details step
  const priceStepKey = Object.keys(steps).find(key => 
    isSaleProperty 
      ? key.includes('sale_details') 
      : key.includes('rental') || key.includes('rent')
  );
  
  const priceDetails = priceStepKey ? steps[priceStepKey] : null;
  
  // Get price value
  const price = isSaleProperty
    ? priceDetails?.expectedPrice || property.price || 0
    : priceDetails?.rentAmount || property.price || 0;
  
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
            {flow.category}
          </span>
        </div>
        <p className="text-muted-foreground">{locationString}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery - Using PropertyGalleryCard with direct blob URLs */}
          <PropertyGalleryCard 
            images={propertyImages} 
            propertyId={propertyId}
            directUrls={directUrls}
          />
          
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
          
          {/* Property Overview - with price and main details */}
          <PropertyOverviewSection 
            basicDetails={basicDetails}
            flow={flow}
            price={price}
          />
          
          {/* Dynamically render sections based on steps */}
          {Object.entries(steps).map(([stepId, stepData]) => (
            <StepSection 
              key={stepId}
              stepId={stepId}
              stepData={stepData}
            />
          ))}
          
          {/* If no location in steps, show location component with extracted coordinates */}
          {!locationStepKey && coordinates && (
            <Card className="p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64 bg-gray-100 rounded-lg mb-4">
                {/* Location map will be rendered here */}
                <div className="h-full flex items-center justify-center">
                  <span className="text-gray-500">Map view available</span>
                </div>
              </div>
              <p className="text-gray-700">{locationString}</p>
            </Card>
          )}
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          <ContactOwnerCard
            propertyTitle={propertyTitle}
            propertyId={propertyId}
            ownerId={ownerId}
            ownerInfo={property.ownerInfo}
          />
          
          {property.property_details?.highlights && (
            <PropertyHighlightsCard 
              highlights={property.property_details.highlights} 
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