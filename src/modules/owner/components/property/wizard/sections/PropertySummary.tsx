// src/modules/owner/components/property/wizard/sections/PropertySummary.tsx
// Version: 4.5.0
// Last Modified: 02-05-2025 17:30 IST
// Purpose: Added editable property title in the Review tab

import React, { useMemo, useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { cn } from '@/lib/utils';
import { FormData } from '../types';
import { MapPin, Home, SquareStack, Sparkles, IndianRupee, Building, Info, Edit, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<string>;
  onSaveAndPublish: () => Promise<string>;
  onUpdate: () => Promise<void>;
  saving: boolean;
  status?: 'draft' | 'published';
  propertyId?: string;
}

interface SummarySectionProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    value?: string | number | boolean | string[];
  }>;
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, icon, items }) => (
  <Card className="overflow-hidden border-border hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-secondary/20 py-3 px-4">
      <CardTitle className="text-base font-medium flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <dl className="grid gap-2">
        {items.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-2 gap-2 py-1 border-b border-border/30 last:border-0">
            <dt className="text-sm font-medium text-muted-foreground">{label}:</dt>
            <dd className="text-sm text-foreground font-medium">
              {typeof value === 'boolean'
                ? value ? 'Yes' : 'No'
                : Array.isArray(value)
                  ? value.length > 0 ? value.join(', ') : '-'
                  : value || '-'}
            </dd>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);

// Helper function to capitalize a string
const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatCurrency = (value?: string | number) => {
  if (!value) return '-';
  return `₹${Number(value).toLocaleString('en-IN')}`;
};

// Function to format area with the correct unit
const formatArea = (area?: string, unit?: string) => {
  if (!area) return '-';
  // Display the appropriate unit based on the builtUpAreaUnit value
  const displayUnit = unit === 'sqyd' ? 'sq.yard' : 'sq.ft.';
  return `${area} ${displayUnit}`;
};

export function PropertySummary({
  formData,
  onPrevious,
  onSaveAsDraft,
  onSaveAndPublish,
  onUpdate,
  saving,
  status = 'draft',
  propertyId
}: PropertySummaryProps) {
  const isPublished = status === 'published';
  const isNewListing = !propertyId;
  
  // State to manage the editable property title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(formData.title || '');
  
  // Function to handle title edit completion
  const handleTitleEditComplete = () => {
    if (editedTitle.trim()) {
      // Update the form data with the new title
      formData.title = editedTitle.trim();
      
      // If using v2 format, update the nested structure too
      if ('basicDetails' in formData && formData.basicDetails) {
        formData.basicDetails.title = editedTitle.trim();
      }
    }
    setIsEditingTitle(false);
  };
  
  // Function to handle title edit cancellation on Escape key
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      setEditedTitle(formData.title || '');
      setIsEditingTitle(false);
    }
  };
  
  // Before rendering, prepare form data
  React.useEffect(() => {
    // Set flow information from URL path
    const pathParts = window.location.pathname.split('/');
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    if (urlPropertyType && !formData.flow_property_type) {
      formData.flow_property_type = urlPropertyType;
    }
    
    if (urlListingType && !formData.flow_listing_type) {
      formData.flow_listing_type = urlListingType;
    }
    
    // Make sure we have a title
    if (!formData.title) {
      if (formData.propertyType) {
        formData.title = `${capitalize(formData.propertyType)} Property`;
      } else {
        formData.title = "New Property";
      }
    }
    
    // Set initial edited title state
    setEditedTitle(formData.title || '');
    
    // Ensure location data is set if missing
    if (!formData.city && !formData.locality) {
      formData.city = "Hyderabad";
    }
    
    // Make sure there's a description
    if (!formData.description) {
      formData.description = `${formData.title} - A great property listing.`;
    }
    
    console.log('Prepared form data for summary view:', {
      title: formData.title,
      flow: {
        property_type: formData.flow_property_type,
        listing_type: formData.flow_listing_type
      }
    });
  }, [formData]);
  
  // Extract flow information from URL path for display
  const pathParts = useMemo(() => window.location.pathname.split('/'), []);
  const urlPropertyType = useMemo(() => 
    pathParts.length > 2 ? pathParts[pathParts.length - 3] : '', 
  [pathParts]);
  
  const urlListingType = useMemo(() => 
    pathParts.length > 2 ? pathParts[pathParts.length - 2] : '',
  [pathParts]);
  
  // Get flow information from URL or form data
  const flowPropertyType = useMemo(() => 
    capitalize(urlPropertyType || formData.flow_property_type || ''),
  [urlPropertyType, formData.flow_property_type]);
  
  const flowListingType = useMemo(() => 
    capitalize(urlListingType || formData.flow_listing_type || ''),
  [urlListingType, formData.flow_listing_type]);
  
  // Improved logic to detect if this is a sale property
  const isSaleProperty = useMemo(() => {
    // Check multiple indicators for sale property
    const listingType = formData.listingType?.toLowerCase();
    const isSaleListingType = listingType === 'sale' || listingType === 'sell';
    
    // Check if expected price exists (sale property) and rental amount doesn't
    const hasExpectedPrice = !!formData.expectedPrice;
    const hasNoRentAmount = !formData.rentAmount;
    
    // Check other sale-specific fields
    const hasMaintenanceCost = !!formData.maintenanceCost;
    const hasKitchenType = !!formData.kitchenType;
    
    // Return true if ANY of these indicators suggest it's a sale property
    return isSaleListingType || (hasExpectedPrice && hasNoRentAmount) || hasMaintenanceCost;
  }, [formData]);
  
  // Logic to detect if this is a commercial property
  const isCommercialProperty = useMemo(() => {
    // Check the property category
    const category = formData.propertyCategory?.toLowerCase();
    const isCommercialCategory = category === 'commercial';
    
    // Check for commercial-specific fields
    const hasCommercialType = !!formData.commercialPropertyType;
    const hasLeaseDuration = !!formData.leaseDuration;
    const hasLockInPeriod = !!formData.lockInPeriod;
    const hasPowerBackup = !!formData.powerBackup;
    
    // Check URL path for commercial indicators
    const urlPath = window.location.pathname.toLowerCase();
    const isCommercialFromUrl = urlPath.includes('commercial');
    
    // Return true if ANY of these indicators suggest it's a commercial property
    return isCommercialCategory || hasCommercialType || hasLeaseDuration || 
           hasLockInPeriod || hasPowerBackup || isCommercialFromUrl;
  }, [formData]);

  // Format coordinates for display
  const coordinates = formData.latitude && formData.longitude 
    ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
    : '-';

  // Full address without flat/plot number for summary display
  const fullAddress = formData.address || '-';

  return (
    <FormSection
      title="Review Property Details"
      description="Review all details before saving or publishing"
    >
      <div className="space-y-6">
        {/* Property title preview with edit functionality */}
        <div className="mb-6">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="text-lg font-semibold h-10"
                placeholder="Enter property title"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleTitleEditComplete}
                className="p-2 h-10 w-10"
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {formData.title || "Unnamed Property"}
              </h2>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditingTitle(true)}
                className="p-1 h-8 w-8 ml-1"
                title="Edit property title"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground text-sm mt-1">{fullAddress}</p>
        </div>
        
        {/* Listing Information Section - Added for flow information */}
        <SummarySection
          title="Listing Information"
          icon={<Info className="h-4 w-4" />}
          items={[
            { label: 'Property Type', value: flowPropertyType || capitalize(formData.propertyType) },
            { label: 'Listing Type', value: flowListingType || capitalize(formData.listingType) }
          ]}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <SummarySection
            title="Basic Details"
            icon={<Home className="h-4 w-4" />}
            items={[
              { label: 'Property Type', value: isCommercialProperty ? formData.commercialPropertyType : formData.propertyType },
              { label: 'BHK Type', value: formData.bhkType },
              { label: 'Built-up Area', value: formatArea(formData.builtUpArea, formData.builtUpAreaUnit) },
              { label: 'Floor', value: `${formData.floor} of ${formData.totalFloors}` },
              { label: 'Property Age', value: formData.propertyAge },
              { label: 'Facing', value: formData.facing },
              { label: 'Bathrooms', value: formData.bathrooms },
              { label: 'Balconies', value: formData.balconies },
              { label: 'Property Condition', value: formData.propertyCondition }
            ]}
          />

          <SummarySection
            title="Location Details"
            icon={<MapPin className="h-4 w-4" />}
            items={[
              { label: 'Flat/Plot No.', value: formData.flatPlotNo },
              { label: 'Address', value: formData.address },
              { label: 'Landmark', value: formData.landmark },
              { label: 'PIN Code', value: formData.pinCode },
              { label: 'Coordinates', value: coordinates }
            ]}
          />

          {isCommercialProperty ? (
            <SummarySection
              title="Commercial Details"
              icon={<Building className="h-4 w-4" />}
              items={[
                { label: 'Commercial Type', value: formData.commercialPropertyType },
                { label: 'Rent Amount', value: formatCurrency(formData.rentAmount) },
                { label: 'Security Deposit', value: formatCurrency(formData.securityDeposit) },
                { label: 'Lease Duration', value: formData.leaseDuration },
                { label: 'Lock-in Period', value: formData.lockInPeriod ? `${formData.lockInPeriod} months` : '-' },
                { label: 'Maintenance', value: formData.maintenance },
                { label: 'Furnishing', value: formData.furnishing },
                { label: 'Power Backup', value: formData.powerBackup },
                { label: 'Available From', value: formData.availableFrom },
                { label: 'Fire Safety', value: formData.fireSafety ? 'Yes' : 'No' },
                { label: 'Centralized AC', value: formData.centralizedAC ? 'Yes' : 'No' }
              ]}
            />
          ) : isSaleProperty ? (
            <SummarySection
              title="Sale Details"
              icon={<IndianRupee className="h-4 w-4" />}
              items={[
                { label: 'Expected Price', value: formatCurrency(formData.expectedPrice) },
                { label: 'Maintenance Cost', value: formatCurrency(formData.maintenanceCost) },
                { label: 'Kitchen Type', value: formData.kitchenType },
                { label: 'Available From', value: formData.availableFrom },
                { label: 'Price Negotiable', value: formData.priceNegotiable }
              ]}
            />
          ) : (
            <SummarySection
              title="Rental Details"
              icon={<SquareStack className="h-4 w-4" />}
              items={[
                { label: 'Rental Type', value: formData.rentalType },
                { label: 'Rent Amount', value: formatCurrency(formData.rentAmount) },
                { label: 'Security Deposit', value: formatCurrency(formData.securityDeposit) },
                { label: 'Maintenance', value: formData.maintenance },
                { label: 'Available From', value: formData.availableFrom },
                { label: 'Rent Negotiable', value: formData.rentNegotiable },
                { label: 'Preferred Tenants', value: formData.preferredTenants }
              ]}
            />
          )}

          <SummarySection
            title="Features & Amenities"
            icon={<Sparkles className="h-4 w-4" />}
            items={[
              { label: 'Furnishing', value: formData.furnishing },
              { label: 'Parking', value: formData.parking },
              { label: 'Property Show Option', value: formData.propertyShowOption },
              { label: 'Gated Security', value: formData.gatedSecurity },
              { label: 'Non-Veg Allowed', value: formData.nonVegAllowed },
              { label: 'Gym Available', value: formData.hasGym },
              { label: 'Amenities', value: formData.amenities }
            ]}
          />
        </div>

        {formData.description && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/20 py-3 px-4">
              <CardTitle className="text-base font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{formData.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </FormSection>
  );
}

// Add a default export to ensure the component can be imported correctly
export default PropertySummary;