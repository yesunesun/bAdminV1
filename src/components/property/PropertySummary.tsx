// src/components/property/PropertySummary.tsx
// Version: 1.2.0
// Last Modified: 2025-01-30T18:45:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { FormData } from './types';
import { 
  IndianRupee, 
  Home, 
  MapPin, 
  Key, 
  Check,  
  CalendarDays,
  Users,
  Palette,
  Car
} from 'lucide-react';

interface PropertySummaryProps {
  formData: FormData;
  onSaveForLater: () => void;
  onPublish: () => void;
  onPrevious: () => void;
  saving?: boolean;
}

const InfoItem = ({ label, value, icon: Icon }: { 
  label: string; 
  value: React.ReactNode;
  icon?: React.ComponentType<any>;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-sm text-slate-500">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </div>
    <div className="font-medium text-slate-900">{value || '-'}</div>
  </div>
);

export function PropertySummary({ 
  formData, 
  onSaveForLater, 
  onPublish, 
  onPrevious,
  saving = false 
}: PropertySummaryProps) {
  // Format date to Indian format (DD/MM/YYYY)
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Format currency in Indian format
  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return '-';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '-';
    return numAmount.toLocaleString('en-IN');
  };

  // Check if a value exists and is valid
  const hasValue = (value: any) => {
    return value !== undefined && value !== null && value !== '';
  };

  return (
    <FormSection
      title="Review Property Details"
      description="Verify all details before publishing"
    >
      <div className="space-y-6">
        {/* Quick Overview */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-slate-700">
            <Home className="h-4 w-4" />
            Property Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem 
              label="Property Type" 
              value={hasValue(formData.propertyType) && hasValue(formData.bhkType) 
                ? `${formData.bhkType} ${formData.propertyType}`
                : '-'}
            />
            <InfoItem 
              label="Built-up Area" 
              value={hasValue(formData.builtUpArea) 
                ? `${formData.builtUpArea} sq ft`
                : '-'}
            />
            <InfoItem 
              label="Floor" 
              value={hasValue(formData.floor) && hasValue(formData.totalFloors)
                ? `${formData.floor} of ${formData.totalFloors}`
                : '-'}
            />
            <InfoItem 
              label="Age" 
              value={formData.propertyAge || '-'}
            />
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem 
              label="Zone" 
              value={formData.zone || '-'}
            />
            <InfoItem 
              label="Locality" 
              value={formData.locality || '-'}
            />
            <div className="col-span-2">
              <InfoItem 
                label="Complete Address" 
                value={formData.address || '-'}
              />
            </div>
          </div>
        </div>

        {/* Rental Terms */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-slate-700">
            <Key className="h-4 w-4" />
            Rental Terms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoItem 
              label="Monthly Rent" 
              value={hasValue(formData.rentAmount) ? (
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(formData.rentAmount)}
                  {formData.rentNegotiable && 
                    <span className="text-sm text-slate-500">(Negotiable)</span>
                  }
                </div>
              ) : '-'}
            />
            <InfoItem 
              label="Security Deposit" 
              value={hasValue(formData.securityDeposit) ? (
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(formData.securityDeposit)}
                </div>
              ) : '-'}
            />
            <InfoItem 
              label="Maintenance" 
              value={formData.maintenance || '-'}
            />
            <InfoItem 
              icon={CalendarDays}
              label="Available From" 
              value={formatDate(formData.availableFrom)}
            />
            <InfoItem 
              icon={Palette}
              label="Furnishing" 
              value={formData.furnishing || '-'}
            />
            <InfoItem 
              icon={Car}
              label="Parking" 
              value={formData.parking || '-'}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-slate-700">
            <Check className="h-4 w-4" />
            Features & Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(formData.amenities || []).length > 0 ? (
              formData.amenities.map((amenity) => (
                <div 
                  key={amenity}
                  className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm"
                >
                  {amenity}
                </div>
              ))
            ) : (
              <div className="col-span-full text-sm text-slate-500">
                No amenities selected
              </div>
            )}
          </div>
        </div>

        {/* Tenant Preferences */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-slate-700">
            <Users className="h-4 w-4" />
            Tenant Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {(formData.preferredTenants || []).length > 0 ? (
              formData.preferredTenants.map((tenant) => (
                <span
                  key={tenant}
                  className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm"
                >
                  {tenant}
                </span>
              ))
            ) : (
              <div className="text-sm text-slate-500">
                No preferences selected
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-lg hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-2 focus:ring-slate-200"
          >
            Previous
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSaveForLater}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 
                rounded-lg hover:bg-slate-200 transition-colors focus:outline-none 
                focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 
                rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none 
                focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>
    </FormSection>
  );
}