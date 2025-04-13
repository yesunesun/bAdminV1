// src/modules/owner/components/property/wizard/sections/PropertySummary.tsx
// Version: 3.8.0
// Last Modified: 14-04-2025 10:30 IST
// Purpose: Removed Save to Draft button from Review tab

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSection } from '@/components/FormSection';
import { cn } from '@/lib/utils';
import { FormData } from '../types';
import { Save, FileEdit, Send, Loader2, MapPin, Home, SquareStack, Sparkles, ImagePlus, IndianRupee, AlertCircle, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<void>;
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
  const navigate = useNavigate();
  const isPublished = status === 'published';
  const isNewListing = !propertyId;
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
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

  // Custom previous button handler to navigate directly to Features tab
  const handlePreviousClick = () => {
    try {
      if (typeof onPrevious === 'function') {
        onPrevious();
      } else {
        // Extract the base URL (everything before the last segment)
        const pathParts = window.location.pathname.split('/');
        pathParts.pop(); // Remove the last part (current step)
        const baseUrl = pathParts.join('/');
        
        // Navigate to Features tab
        navigate(`${baseUrl}/features`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Just call the provided function as fallback
      if (typeof onPrevious === 'function') {
        onPrevious();
      }
    }
  };

  // Handler for Save and Photos navigation
  const handleSaveAndNavigateToPhotos = async () => {
    try {
      // Clear any previous errors
      setLocalError(null);
      
      // Prevent multiple clicks
      if (saving || isSaving) return;
      
      // Set local saving state
      setIsSaving(true);
      
      console.log('Starting save and photo navigation process...');
      
      // Extract property type and listing type for navigation
      const propertyType = (formData.propertyType || 'residential').toLowerCase();
      const listingType = (formData.listingType || 'rent').toLowerCase();
      
      let savedPropertyId: string;
      
      try {
        // Log the action
        console.log('Saving property data...');
        
        // Save the property
        savedPropertyId = await onSaveAndPublish();
        
        if (!savedPropertyId) {
          throw new Error('No property ID returned from save operation');
        }
        
        console.log('Property saved with ID:', savedPropertyId);
      } catch (saveError: any) {
        console.error('Failed to save property:', saveError);
        setLocalError(`Failed to save property: ${saveError.message || 'Unknown error'}`);
        setIsSaving(false);
        return;
      }
      
      // Try different navigation methods
      try {
        console.log('Navigation attempt 1: Direct path construction');
        const nextPath = `/properties/list/${propertyType}/${listingType}/photos`;
        console.log('Navigating to:', nextPath);
        
        // Try programmatic navigation first
        navigate(nextPath, { replace: true });
        
        // Set a fallback - direct location change if navigate doesn't work
        setTimeout(() => {
          if (window.location.pathname.indexOf('/photos') === -1) {
            console.log('Fallback: using window.location');
            window.location.href = nextPath;
          }
        }, 500);
      } catch (navError) {
        console.error('Navigation error:', navError);
        
        try {
          console.log('Navigation attempt 2: Using last segment replacement');
          // Extract the current path and replace last segment
          const currentPath = window.location.pathname;
          const newPath = currentPath.replace(/\/[^\/]*$/, '/photos');
          console.log('Navigating to:', newPath);
          navigate(newPath, { replace: true });
        } catch (error) {
          console.error('All navigation attempts failed:', error);
          setLocalError('Navigation to Photos tab failed. Please try to navigate manually.');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Unhandled error in save and navigate process:', error);
      setLocalError('An unexpected error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  // Format coordinates for display
  const coordinates = formData.latitude && formData.longitude 
    ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
    : '-';

  // Full address without flat/plot number for summary display
  const fullAddress = formData.address || '-';

  const renderButtons = () => {
    if (saving || isSaving) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-secondary-foreground">Saving changes...</span>
        </div>
      );
    }

    if (isPublished) {
      return (
        <button
          type="button"
          onClick={onUpdate}
          className={cn(
            "flex items-center px-6 py-3 rounded-lg",
            "text-sm font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50"
          )}
          disabled={saving || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      );
    }

    return (
      <div className="flex gap-3">
        {/* "Save to Draft" button removed as requested */}
        <button
          type="button"
          onClick={isNewListing ? handleSaveAndNavigateToPhotos : onSaveAndPublish}
          className={cn(
            "flex items-center px-6 py-3 rounded-lg",
            "text-sm font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50"
          )}
          disabled={saving || isSaving}
        >
          {isNewListing ? (
            <>
              <ImagePlus className="h-4 w-4 mr-2" />
              Save and Upload Photos
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Save & Publish
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <FormSection
      title="Review Property Details"
      description="Review all details before saving or publishing"
    >
      <div className="space-y-6">
        {/* Property title preview */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{formData.title || "Unnamed Property"}</h2>
          <p className="text-muted-foreground text-sm mt-1">{fullAddress}</p>
        </div>
        
        {/* Local error message */}
        {localError && (
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/90 mt-1">{localError}</p>
              <div className="mt-3">
                <button
                  onClick={() => setLocalError(null)}
                  className="text-xs underline text-destructive/80 hover:text-destructive"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
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
                { label: 'Lock-in Period', value: `${formData.lockInPeriod} months` },
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

        <div className="flex justify-between items-center pt-6 border-t border-border">
          <button
            type="button"
            onClick={handlePreviousClick}
            className={cn(
              "px-6 py-3 text-sm font-medium rounded-lg",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:opacity-50"
            )}
            disabled={saving || isSaving}
          >
            Previous
          </button>
          {renderButtons()}
        </div>
      </div>
    </FormSection>
  );
}

// Add a default export to ensure the component can be imported correctly
export default PropertySummary;