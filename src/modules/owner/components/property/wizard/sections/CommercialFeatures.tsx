// src/modules/owner/components/property/wizard/sections/CommercialFeatures.tsx
// Version: 1.1.0
// Last Modified: 12-04-2025 19:15 IST
// Purpose: Specialized features component for Commercial Rent properties with additional required fields

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { FURNISHING_OPTIONS, PARKING_OPTIONS } from '../constants';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { checkbox } from '@/components/ui/checkbox';
import { input } from '@/components/ui/input';
import { select } from '@/components/ui/select';
import { textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

// Commercial-specific amenities
const COMMERCIAL_AMENITIES = [
  'Reception Area',
  'Conference Room',
  'Meeting Rooms',
  'Cafeteria',
  'Pantry',
  'Security System',
  'CCTV',
  'Fire Safety',
  'Power Backup',
  'High-Speed Internet',
  'Dedicated Server Room',
  'Centralized Air Conditioning',
  'Elevator/Lift',
  'Parking',
  'Loading/Unloading Area',
  'Storage Space',
  'Outdoor Space',
  'Terrace Access'
] as const;

// Commercial-specific facilities
const COMMERCIAL_FACILITIES = [
  'Maintenance Staff',
  'Cleaning Services',
  'Security Personnel',
  '24/7 Access',
  'ATM',
  'Bank Branch',
  'Food Court',
  'Gym',
  'Visitor Management',
  'Washroom',
  'Handicap Friendly',
  'Public Transportation',
  'Retail Shops'
] as const;

// Commercial-specific infrastructure features
const INFRASTRUCTURE_FEATURES = [
  'Raised Flooring',
  'False Ceiling',
  'Grade A Building',
  'Dual Entry/Exit',
  'Fire Exit',
  'Loading Bay',
  'Drop-off Area',
  'Multiple Entry Points',
  'Goods Lift',
  'Service Elevator'
] as const;

// Required dropdown options
const POWER_BACKUP_OPTIONS = ['Full', 'DG Backup', 'Need to Arrange'] as const;
const LIFT_OPTIONS = ['None', 'Personal', 'Common'] as const;
const PARKING_TYPE_OPTIONS = ['None', 'Public And Reserved', 'Public', 'Reserved'] as const;
const WASHROOM_OPTIONS = ['Shared', 'No Washroom', 'Private'] as const;
const WATER_STORAGE_OPTIONS = ['Yes', 'No'] as const;
const SECURITY_OPTIONS = ['Yes', 'No'] as const;
const PROPERTY_CONDITION_OPTIONS = [
  'Vacant', 
  'Currently rented/leased', 
  'Own Business', 
  'New Property'
] as const;
const CURRENT_BUSINESS_OPTIONS = [
  'Gym/Yoga Centre',
  'Office',
  'Restaurant/Cafe',
  'Salon/Spa',
  'Store/Showroom',
  'Cloud Kitchen',
  'Warehouse/Godown',
  'Clinic',
  'School/Institute',
  'Industrial Use',
  'Other Business'
] as const;
const SIMILAR_UNITS_OPTIONS = ['Yes', 'No'] as const;

interface CommercialFeaturesProps {
  form: UseFormReturn<FormData>;
  adType: string;
}

const CommercialFeatures = ({
  form,
  adType
}: CommercialFeaturesProps) => {
  const { register, watch, formState: { errors } } = form;

  // Get form values
  const furnishingType = watch('furnishingType');
  const hasParking = watch('hasParking');
  const propertyCondition = watch('propertyCondition');
  const hasSimilarUnits = watch('hasSimilarUnits');

  return (
    <div className="space-y-8">
      {/* Essential Commercial Facilities - Required Fields */}
      <FormSection title="Essential Facilities" description="Specify key facilities available in your commercial property">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Power Backup - Required */}
          <div>
            <RequiredLabel htmlFor="powerBackup">Power Backup</RequiredLabel>
            <select
              id="powerBackup"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('powerBackup', { required: 'Power backup is required' })}
            >
              <option value="">Select Power Backup</option>
              {POWER_BACKUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.powerBackup && (
              <p className="mt-1 text-sm text-destructive">{errors.powerBackup.message as string}</p>
            )}
          </div>

          {/* Lift - Required */}
          <div>
            <RequiredLabel htmlFor="lift">Lift/Elevator</RequiredLabel>
            <select
              id="lift"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('lift', { required: 'Lift information is required' })}
            >
              <option value="">Select Lift Option</option>
              {LIFT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.lift && (
              <p className="mt-1 text-sm text-destructive">{errors.lift.message as string}</p>
            )}
          </div>

          {/* Parking - Required */}
          <div>
            <RequiredLabel htmlFor="parkingType">Parking</RequiredLabel>
            <select
              id="parkingType"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('parkingType', { required: 'Parking information is required' })}
            >
              <option value="">Select Parking Type</option>
              {PARKING_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.parkingType && (
              <p className="mt-1 text-sm text-destructive">{errors.parkingType.message as string}</p>
            )}
          </div>

          {/* Washroom(s) - Required */}
          <div>
            <RequiredLabel htmlFor="washroomType">Washroom(s)</RequiredLabel>
            <select
              id="washroomType"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('washroomType', { required: 'Washroom information is required' })}
            >
              <option value="">Select Washroom Type</option>
              {WASHROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.washroomType && (
              <p className="mt-1 text-sm text-destructive">{errors.washroomType.message as string}</p>
            )}
          </div>

          {/* Water Storage Facility */}
          <div>
            <label htmlFor="waterStorage" className="block text-sm font-medium mb-1">
              Water Storage Facility
            </label>
            <select
              id="waterStorage"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('waterStorage')}
            >
              <option value="">Select Option</option>
              {WATER_STORAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Security */}
          <div>
            <label htmlFor="security" className="block text-sm font-medium mb-1">
              Security
            </label>
            <select
              id="security"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('security')}
            >
              <option value="">Select Option</option>
              {SECURITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      {/* Property Status */}
      <FormSection title="Property Status" description="Provide information about the current status of your property">
        <div className="space-y-6">
          <div>
            <RequiredLabel htmlFor="propertyCondition">Current Property Condition</RequiredLabel>
            <select
              id="propertyCondition"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              {...register('propertyCondition', { required: 'Property condition is required' })}
            >
              <option value="">Select Current Condition</option>
              {PROPERTY_CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.propertyCondition && (
              <p className="mt-1 text-sm text-destructive">{errors.propertyCondition.message as string}</p>
            )}
          </div>

          {/* Conditional field if "Own Business" is selected */}
          {propertyCondition === 'Own Business' && (
            <div>
              <RequiredLabel htmlFor="currentBusiness">What business is currently running?</RequiredLabel>
              <select
                id="currentBusiness"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                {...register('currentBusiness', { required: 'Current business information is required' })}
              >
                <option value="">Select Business Type</option>
                {CURRENT_BUSINESS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.currentBusiness && (
                <p className="mt-1 text-sm text-destructive">{errors.currentBusiness.message as string}</p>
              )}
            </div>
          )}

          <div>
            <p className="block text-sm font-medium mb-3">Do you have more similar units/properties available?</p>
            <div className="flex items-center space-x-6">
              {SIMILAR_UNITS_OPTIONS.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="radio"
                    id={`similar-units-${option}`}
                    value={option}
                    className="w-4 h-4 text-primary border-border focus:ring-primary/20"
                    {...register('hasSimilarUnits')}
                  />
                  <label htmlFor={`similar-units-${option}`} className="ml-2 text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      {/* Furnishing Type */}
      <FormSection title="Furnishing" description="Select the furnishing status of your commercial property">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FURNISHING_OPTIONS.map((option) => (
              <div key={option} className="relative">
                <input
                  type="radio"
                  id={`furnishing-${option}`}
                  value={option}
                  className="peer absolute h-full w-full cursor-pointer opacity-0"
                  {...register('furnishingType')}
                />
                <label
                  htmlFor={`furnishing-${option}`}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-xl border-2 border-border",
                    "hover:bg-secondary/50 transition-colors cursor-pointer",
                    "peer-checked:border-primary peer-checked:bg-primary/10",
                    "text-center text-sm font-medium"
                  )}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
          
          {furnishingType && (furnishingType === 'Fully Furnished' || furnishingType === 'Semi Furnished') && (
            <div className="pt-4">
              <RequiredLabel htmlFor="furnishingDetails">Furnishing Details</RequiredLabel>
              <textarea
                id="furnishingDetails"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                placeholder="Describe what furnishing is included (e.g., workstations, chairs, tables, storage units, etc.)"
                {...register('furnishingDetails')}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* Commercial Amenities */}
      <FormSection title="Commercial Amenities" description="Select all amenities available at your commercial property">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
          {COMMERCIAL_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                value={amenity}
                {...register('amenities')}
              />
              <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Commercial Facilities */}
      <FormSection title="Commercial Facilities" description="Select all facilities available at your commercial property">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
          {COMMERCIAL_FACILITIES.map((facility) => (
            <div key={facility} className="flex items-center">
              <input
                type="checkbox"
                id={`facility-${facility}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                value={facility}
                {...register('facilities')}
              />
              <label htmlFor={`facility-${facility}`} className="ml-2 text-sm">
                {facility}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Infrastructure Features */}
      <FormSection title="Infrastructure Features" description="Select all infrastructure features of your commercial property">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
          {INFRASTRUCTURE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center">
              <input
                type="checkbox"
                id={`infrastructure-${feature}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                value={feature}
                {...register('infrastructureFeatures')}
              />
              <label htmlFor={`infrastructure-${feature}`} className="ml-2 text-sm">
                {feature}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Directions Tip */}
      <FormSection title="Additional Information" description="Provide helpful details for potential tenants">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between mb-1">
              <label htmlFor="directionsTip" className="block text-sm font-medium">
                Add Directions Tip for your tenants
              </label>
              <div className="text-xs text-muted-foreground italic">Optional</div>
            </div>
            <div className="relative">
              <textarea
                id="directionsTip"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-24"
                placeholder="Provide directions using nearby landmarks..."
                {...register('directionsTip')}
              />
              <div className="mt-2 flex items-start text-xs text-muted-foreground">
                <Info className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                <span>Don't want calls asking location? Add directions to reach using landmarks.</span>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div>
            <label htmlFor="additionalFeatures" className="block text-sm font-medium mb-1">
              Additional Features (Optional)
            </label>
            <textarea
              id="additionalFeatures"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-32"
              placeholder="Add any other unique features of your commercial property (e.g., green building certification, proximity to business hubs, etc.)"
              {...register('additionalFeatures')}
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default CommercialFeatures;