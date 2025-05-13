// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummary.tsx
// Version: 1.4.0
// Last Modified: 14-05-2025 11:45 IST
// Purpose: Enhanced PropertySummary component that renders UI based on transformed JSON data

import React, { useEffect, useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { Home, MapPin, Check, Clock, Wallet, Wrench } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { PropertyTitleEditor } from './components/PropertyTitleEditor';
import { SummarySection } from './components/SummarySection';
import { DescriptionSection } from './components/DescriptionSection';
// Corrected import path
import { prepareFormDataForSubmission } from '@/modules/owner/components/property/wizard/utils/formDataFormatter';
import { formatCurrency, formatArea, formatBoolean } from './services/dataFormatter';

export const PropertySummary: React.FC<PropertySummaryProps> = (props) => {
  const {
    formData,
    onPrevious,
    onSaveAsDraft,
    onSaveAndPublish,
    onUpdate,
    saving,
    status = 'draft',
    propertyId
  } = props;

  // State to hold the transformed data
  const [transformedData, setTransformedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Detect flow type and get step IDs
  const { flowType, stepIds } = useFlowDetection(formData);
  
  // Transform data on initial render
  useEffect(() => {
    if (!formData) return;
    
    setIsLoading(true);
    
    // Create context params for the data transformation
    const contextParams = {
      urlPath: window.location.pathname,
      isSaleMode: formData?.propertyDetails?.adType === 'Sale' || false,
      isPGHostelMode: formData?.propertyDetails?.propertyType === 'PG/Hostel' || false,
      adType: formData?.propertyDetails?.adType
    };
    
    try {
      // Transform the data using the utility function
      const transformed = prepareFormDataForSubmission(formData, contextParams);
      
      // Log for debugging
      console.log('Transformed JSON:', transformed);
      
      // Set the transformed data to state for rendering
      setTransformedData(transformed);
    } catch (error) {
      console.error('Transformation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData]); // Only re-run if formData changes
  
  // Use the title from the transformed data or from the property title hook
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  } = usePropertyTitle(formData, stepIds, flowType);

  // Show loading state while data is being transformed
  if (isLoading) {
    return (
      <FormSection
        title="Preparing Summary"
        description="Please wait while we prepare your property summary..."
      >
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </FormSection>
    );
  }

  // Extract data directly from the transformed JSON
  const data = transformedData || formData;
  const flowCategory = data?.flow?.category || '';
  const flowListingType = data?.flow?.listingType || '';
  const flowInfo = `${flowCategory.charAt(0).toUpperCase() + flowCategory.slice(1)} ${flowListingType.charAt(0).toUpperCase() + flowListingType.slice(1)}`;
  
  // Get title from the transformed data
  const propertyTitle = data?.steps?.res_rent_basic_details?.title || editedTitle || 'Property Details';
  
  // Extract location details
  const locationData = data?.steps?.res_rent_location || {};
  const address = locationData.address || '';
  const coordinates = locationData.latitude && locationData.longitude 
    ? `${locationData.latitude}, ${locationData.longitude}` 
    : '-';

  // Extract basic details
  const basicDetails = data?.steps?.res_rent_basic_details || {};
  
  // Extract rental details
  const rentalDetails = data?.steps?.res_rent_rental || {};
  
  // Extract features
  const features = data?.steps?.res_rent_features || {};
  
  // Get description
  const description = features.description || '';

  // Prepare items for each section based on the flow type
  const basicDetailItems = [
    { label: 'Property Type', value: basicDetails.propertyType || '-' },
    { label: 'BHK', value: basicDetails.bhkType || '-' },
    { label: 'Bathrooms', value: basicDetails.bathrooms || '-' },
    { label: 'Built-up Area', value: formatArea(basicDetails.builtUpArea, basicDetails.builtUpAreaUnit) },
    { label: 'Floor', value: basicDetails.floor && basicDetails.totalFloors ? `${basicDetails.floor} out of ${basicDetails.totalFloors}` : '-' },
    { label: 'Facing', value: basicDetails.facing || '-' },
    { label: 'Balconies', value: basicDetails.balconies || '-' },
    { label: 'Property Age', value: basicDetails.propertyAge || '-' },
    { label: 'Property Condition', value: basicDetails.propertyCondition || '-' },
    { label: 'Possession Date', value: basicDetails.possessionDate || '-' }
  ];

  const locationItems = [
    { label: 'Address', value: locationData.address || '-' },
    { label: 'Landmark', value: locationData.landmark || '-' },
    { label: 'Locality', value: locationData.locality || '-' },
    { label: 'Area', value: locationData.area || '-' },
    { label: 'City', value: locationData.city || '-' },
    { label: 'PIN Code', value: locationData.pinCode || '-' },
    { label: 'Coordinates', value: coordinates }
  ];

  const rentalItems = [
    { label: 'Monthly Rent', value: formatCurrency(rentalDetails.rentAmount) },
    { label: 'Security Deposit', value: formatCurrency(rentalDetails.securityDeposit) },
    { label: 'Maintenance Charges', value: formatCurrency(rentalDetails.maintenanceCharges) },
    { label: 'Rent Negotiable', value: formatBoolean(rentalDetails.rentNegotiable) ? 'Yes' : 'No' },
    { label: 'Available From', value: rentalDetails.availableFrom || '-' },
    { label: 'Lease Duration', value: rentalDetails.leaseDuration || '-' },
    { label: 'Furnishing Status', value: rentalDetails.furnishingStatus || '-' },
    { label: 'Preferred Tenants', value: Array.isArray(rentalDetails.preferredTenants) ? rentalDetails.preferredTenants.join(', ') : '-' },
    { label: 'Property Show Option', value: rentalDetails.propertyShowOption || '-' }
  ];

  const featuresItems = [
    { label: 'Parking', value: features.parking || '-' },
    { label: 'Pet Friendly', value: formatBoolean(features.petFriendly) ? 'Yes' : 'No' },
    { label: 'Non-Veg Allowed', value: formatBoolean(features.nonVegAllowed) ? 'Yes' : 'No' },
    { label: 'Gated Security', value: formatBoolean(features.gatedSecurity) ? 'Yes' : 'No' },
    { label: 'Water Supply', value: features.waterSupply || '-' },
    { label: 'Power Backup', value: features.powerBackup || '-' },
    { label: 'Amenities', value: Array.isArray(features.amenities) ? features.amenities.join(', ') : '-' }
  ];

  return (
    <FormSection
      title="Review Property Details"
      description="Review all details before saving or publishing"
    >
      <div className="space-y-6">
        {/* Property title with edit functionality */}
        <PropertyTitleEditor
          title={propertyTitle}
          isEditing={isEditingTitle}
          onEdit={() => setIsEditingTitle(true)}
          onComplete={handleTitleEditComplete}
          onKeyDown={handleTitleKeyDown}
          onChange={setEditedTitle}
          fullAddress={address}
        />
        
        {/* Flow Information */}
        <SummarySection
          title="Listing Information"
          icon={<Clock className="h-4 w-4" />}
          items={[
            { label: 'Flow Type', value: flowInfo },
            { label: 'Status', value: data?.meta?.status || status }
          ]}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Details */}
          <SummarySection
            title="Basic Details"
            icon={<Home className="h-4 w-4" />}
            items={basicDetailItems}
          />

          {/* Location Details */}
          <SummarySection
            title="Location Details"
            icon={<MapPin className="h-4 w-4" />}
            items={locationItems}
          />
          
          {/* Rental Details */}
          <SummarySection
            title="Rental Details"
            icon={<Wallet className="h-4 w-4" />}
            items={rentalItems}
          />
          
          {/* Features */}
          <SummarySection
            title="Property Features"
            icon={<Check className="h-4 w-4" />}
            items={featuresItems}
          />
        </div>

        {/* Description Section */}
        <DescriptionSection description={description} />
      </div>
    </FormSection>
  );
};