// src/modules/owner/components/property/wizard/sections/PropertySummary.tsx
// Version: 2.4.0
// Last Modified: 07-03-2025 18:30 IST
// Purpose: Added support for displaying sale details in property summary

import React, { useMemo } from 'react';
import { FormSection } from '@/components/FormSection';
import { cn } from '@/lib/utils';
import { FormData } from '../types';
import { Save, FileEdit, Send, Loader2, MapPin, Home, SquareStack, Sparkles, ImagePlus, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<void>;
  onSaveAndPublish: () => Promise<void>;
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
  const isPublished = status === 'published';
  const isNewListing = !propertyId;
  
  // Determine if this is a sale property
  const isSaleProperty = useMemo(() => {
    const listingType = formData.listingType?.toLowerCase();
    return listingType === 'sale' || listingType === 'sell';
  }, [formData.listingType]);

  // Format coordinates for display
  const coordinates = formData.latitude && formData.longitude 
    ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
    : '-';

  // Full address without flat/plot number for summary display
  const fullAddress = formData.address || '-';

  const renderButtons = () => {
    if (saving) {
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
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      );
    }

    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSaveAsDraft}
          className={cn(
            "flex items-center px-6 py-3 rounded-lg",
            "text-sm font-medium",
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50"
          )}
          disabled={saving}
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Save to Draft
        </button>
        <button
          type="button"
          onClick={onSaveAndPublish}
          className={cn(
            "flex items-center px-6 py-3 rounded-lg",
            "text-sm font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50"
          )}
          disabled={saving}
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
        
        <div className="grid gap-6 md:grid-cols-2">
          <SummarySection
            title="Basic Details"
            icon={<Home className="h-4 w-4" />}
            items={[
              { label: 'Property Type', value: formData.propertyType },
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

          {isSaleProperty ? (
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
            onClick={onPrevious}
            className={cn(
              "px-6 py-3 text-sm font-medium rounded-lg",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:opacity-50"
            )}
            disabled={saving}
          >
            Previous
          </button>
          {renderButtons()}
        </div>
      </div>
    </FormSection>
  );
}