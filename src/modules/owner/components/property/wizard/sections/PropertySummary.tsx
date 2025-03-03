// src/components/property/wizard/sections/PropertySummary.tsx
// Version: 1.4.0
// Last Modified: 2025-03-03T18:30:00+05:30 (IST)

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { cn } from '@/lib/utils';
import { FormData } from '../types';
import { Save, FileEdit, Send, Loader2 } from 'lucide-react';

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
  items: Array<{
    label: string;
    value?: string | number | boolean | string[];
  }>;
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, items }) => (
  <div className="rounded-lg border border-border p-4">
    <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
    <dl className="grid gap-2">
      {items.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-2 gap-2">
          <dt className="text-sm text-muted-foreground">{label}:</dt>
          <dd className="text-sm text-foreground">
            {typeof value === 'boolean'
              ? value ? 'Yes' : 'No'
              : Array.isArray(value)
                ? value.join(', ') || '-'
                : value || '-'}
          </dd>
        </div>
      ))}
    </dl>
  </div>
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

  // Debug log to verify area unit data
  console.log('PropertySummary - Area data:', { 
    area: formData.builtUpArea, 
    unit: formData.builtUpAreaUnit 
  });

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
          <Send className="h-4 w-4 mr-2" />
          Save & Publish
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
        <div className="grid gap-6">
          <SummarySection
            title="Basic Details"
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
            items={[
              { label: 'Zone', value: formData.zone },
              { label: 'Locality', value: formData.locality },
              { label: 'Landmark', value: formData.landmark },
              { label: 'Address', value: formData.address },
              { label: 'PIN Code', value: formData.pinCode },
              { label: 'Direction', value: formData.direction }
            ]}
          />

          <SummarySection
            title="Rental Details"
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

          <SummarySection
            title="Features & Amenities"
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

          {formData.description && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
            </div>
          )}
        </div>

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