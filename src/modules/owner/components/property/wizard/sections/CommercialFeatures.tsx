// src/modules/owner/components/property/wizard/sections/CommercialFeatures.tsx
// Version: 3.1.0
// Last Modified: 02-06-2025 17:00 IST
// Purpose: Added mandatory field validation for Essential Facilities, Property Status, Furnishing and checkbox groups

import React, { useCallback, useEffect } from 'react';
import { FormSectionProps } from '../types';
import { FURNISHING_OPTIONS } from '../constants';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStepValidation } from '../hooks/useStepValidation';
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

const CommercialFeatures: React.FC<FormSectionProps> = ({
  form,
  stepId = 'com_rent_features' // Default stepId for commercial features
}) => {
  // ✅ ADDED: Initialize validation system
  const {
    validateField,
    getFieldValidation,
    shouldShowFieldError,
    markFieldAsTouched,
    isValid: stepIsValid,
    completionPercentage,
    requiredFields
  } = useStepValidation({
    form,
    flowType: 'commercial_rent',
    currentStepId: stepId
  });

  // Custom hooks for step data handling
  const saveField = useCallback((fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    console.log(`Saving field ${fieldName} at path ${path}:`, value);
    form.setValue(path, value, { shouldValidate: true });
    
    // ✅ ADDED: Mark field as touched and validate
    markFieldAsTouched(fieldName);
    validateField(fieldName);
  }, [form, stepId, markFieldAsTouched, validateField]);

  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    const value = form.getValues(path);
    console.log(`Getting field ${fieldName} from path ${path}:`, value);
    return value ?? defaultValue;
  }, [form, stepId]);

  // Ensure step structure exists
  useEffect(() => {
    // Initialize step structure if it doesn't exist
    const currentSteps = form.getValues('steps') || {};
    if (!currentSteps[stepId]) {
      form.setValue('steps', {
        ...currentSteps,
        [stepId]: {}
      });
    }
  }, [stepId, form]);

  // Get current values for conditional rendering
  const furnishingType = getField('furnishingType', '');
  const propertyCondition = getField('propertyCondition', '');

  // Helper for checkbox arrays
  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    const currentValues = getField(fieldName, []);
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v: string) => v !== value);
    }
    
    saveField(fieldName, newValues);
  };

  const isChecked = (fieldName: string, value: string) => {
    const currentValues = getField(fieldName, []);
    return currentValues.includes(value);
  };

  // ✅ NEW: Helper function to check if at least one option is selected in checkbox groups
  const hasAtLeastOneSelected = (fieldName: string) => {
    const currentValues = getField(fieldName, []);
    return currentValues.length > 0;
  };

  return (
    <div className="space-y-8">
      {/* ✅ ADDED: Progress indicator */}
      {requiredFields.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Step Completion: {completionPercentage}%
            </span>
            <span className="text-xs text-blue-700">
              {stepIsValid ? '✓ Ready to proceed' : 'Please complete required fields'}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Essential Commercial Facilities - ALL FIELDS MANDATORY */}
      <FormSection title="Essential Facilities" description="Specify key facilities available in your commercial property">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Power Backup - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="powerBackup" required>Power Backup</RequiredLabel>
            <select
              id="powerBackup"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('powerBackup', '')}
              onChange={(e) => saveField('powerBackup', e.target.value)}
            >
              <option value="">Select Power Backup</option>
              {POWER_BACKUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('powerBackup') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('powerBackup').error}
              </p>
            )}
          </div>

          {/* Lift - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="lift" required>Lift/Elevator</RequiredLabel>
            <select
              id="lift"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('lift', '')}
              onChange={(e) => saveField('lift', e.target.value)}
            >
              <option value="">Select Lift Option</option>
              {LIFT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('lift') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('lift').error}
              </p>
            )}
          </div>

          {/* Parking - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="parkingType" required>Parking</RequiredLabel>
            <select
              id="parkingType"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('parkingType', '')}
              onChange={(e) => saveField('parkingType', e.target.value)}
            >
              <option value="">Select Parking Type</option>
              {PARKING_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('parkingType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('parkingType').error}
              </p>
            )}
          </div>

          {/* Washroom(s) - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="washroomType" required>Washroom(s)</RequiredLabel>
            <select
              id="washroomType"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('washroomType', '')}
              onChange={(e) => saveField('washroomType', e.target.value)}
            >
              <option value="">Select Washroom Type</option>
              {WASHROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('washroomType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('washroomType').error}
              </p>
            )}
          </div>

          {/* Water Storage Facility - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="waterStorage" required>Water Storage Facility</RequiredLabel>
            <select
              id="waterStorage"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('waterStorage', '')}
              onChange={(e) => saveField('waterStorage', e.target.value)}
            >
              <option value="">Select Option</option>
              {WATER_STORAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('waterStorage') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('waterStorage').error}
              </p>
            )}
          </div>

          {/* Security - MANDATORY */}
          <div>
            <RequiredLabel htmlFor="security" required>Security</RequiredLabel>
            <select
              id="security"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={getField('security', '')}
              onChange={(e) => saveField('security', e.target.value)}
            >
              <option value="">Select Option</option>
              {SECURITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('security') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('security').error}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      {/* Property Status */}
      <FormSection title="Property Status" description="Provide information about the current status of your property">
        <div className="space-y-6">
          <div>
            <RequiredLabel htmlFor="propertyCondition" required>Current Property Condition</RequiredLabel>
            <select
              id="propertyCondition"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={propertyCondition}
              onChange={(e) => saveField('propertyCondition', e.target.value)}
            >
              <option value="">Select Current Condition</option>
              {PROPERTY_CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('propertyCondition') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('propertyCondition').error}
              </p>
            )}
          </div>

          {/* Conditional field if "Own Business" is selected */}
          {propertyCondition === 'Own Business' && (
            <div>
              <RequiredLabel htmlFor="currentBusiness">What business is currently running?</RequiredLabel>
              <select
                id="currentBusiness"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                value={getField('currentBusiness', '')}
                onChange={(e) => saveField('currentBusiness', e.target.value)}
              >
                <option value="">Select Business Type</option>
                {CURRENT_BUSINESS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
                    checked={getField('hasSimilarUnits', '') === option}
                    onChange={(e) => saveField('hasSimilarUnits', e.target.value)}
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

      {/* Furnishing Type - MANDATORY */}
      <FormSection title="Furnishing" description="Select the furnishing status of your commercial property">
        <div className="space-y-4">
          <RequiredLabel required>Furnishing</RequiredLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FURNISHING_OPTIONS.map((option) => (
              <div key={option} className="relative">
                <input
                  type="radio"
                  id={`furnishing-${option}`}
                  value={option}
                  className="peer absolute h-full w-full cursor-pointer opacity-0"
                  checked={furnishingType === option}
                  onChange={(e) => saveField('furnishingType', e.target.value)}
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
          {/* ✅ NEW: Show validation error if no furnishing selected */}
          {!furnishingType && (
            <p className="text-sm text-red-600 mt-1">
              Please select a furnishing option
            </p>
          )}
          
          {furnishingType && (furnishingType === 'Fully Furnished' || furnishingType === 'Semi Furnished') && (
            <div className="pt-4">
              <RequiredLabel htmlFor="furnishingDetails">Furnishing Details</RequiredLabel>
              <textarea
                id="furnishingDetails"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                placeholder="Describe what furnishing is included (e.g., workstations, chairs, tables, storage units, etc.)"
                value={getField('furnishingDetails', '')}
                onChange={(e) => saveField('furnishingDetails', e.target.value)}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* Commercial Amenities - AT LEAST ONE MANDATORY */}
      <FormSection title="Commercial Amenities" description="Select all amenities available at your commercial property">
        <RequiredLabel required>Commercial Amenities (at least 1)</RequiredLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-3">
          {COMMERCIAL_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                checked={isChecked('amenities', amenity)}
                onChange={(e) => handleCheckboxChange('amenities', amenity, e.target.checked)}
              />
              <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm">
                {amenity}
              </label>
            </div>
          ))}
        </div>
        {/* ✅ NEW: Show validation error if no amenities selected */}
        {!hasAtLeastOneSelected('amenities') && (
          <p className="text-sm text-red-600 mt-2">
            Please select at least one commercial amenity
          </p>
        )}
      </FormSection>

      {/* Commercial Facilities - AT LEAST ONE MANDATORY */}
      <FormSection title="Commercial Facilities" description="Select all facilities available at your commercial property">
        <RequiredLabel required>Commercial Facilities (at least 1)</RequiredLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-3">
          {COMMERCIAL_FACILITIES.map((facility) => (
            <div key={facility} className="flex items-center">
              <input
                type="checkbox"
                id={`facility-${facility}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                checked={isChecked('facilities', facility)}
                onChange={(e) => handleCheckboxChange('facilities', facility, e.target.checked)}
              />
              <label htmlFor={`facility-${facility}`} className="ml-2 text-sm">
                {facility}
              </label>
            </div>
          ))}
        </div>
        {/* ✅ NEW: Show validation error if no facilities selected */}
        {!hasAtLeastOneSelected('facilities') && (
          <p className="text-sm text-red-600 mt-2">
            Please select at least one commercial facility
          </p>
        )}
      </FormSection>

      {/* Infrastructure Features - AT LEAST ONE MANDATORY */}
      <FormSection title="Infrastructure Features" description="Select all infrastructure features of your commercial property">
        <RequiredLabel required>Infrastructure Features (at least 1)</RequiredLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-3">
          {INFRASTRUCTURE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center">
              <input
                type="checkbox"
                id={`infrastructure-${feature}`}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                checked={isChecked('infrastructureFeatures', feature)}
                onChange={(e) => handleCheckboxChange('infrastructureFeatures', feature, e.target.checked)}
              />
              <label htmlFor={`infrastructure-${feature}`} className="ml-2 text-sm">
                {feature}
              </label>
            </div>
          ))}
        </div>
        {/* ✅ NEW: Show validation error if no infrastructure features selected */}
        {!hasAtLeastOneSelected('infrastructureFeatures') && (
          <p className="text-sm text-red-600 mt-2">
            Please select at least one infrastructure feature
          </p>
        )}
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
                value={getField('directionsTip', '')}
                onChange={(e) => saveField('directionsTip', e.target.value)}
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
              value={getField('additionalFeatures', '')}
              onChange={(e) => saveField('additionalFeatures', e.target.value)}
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default CommercialFeatures;