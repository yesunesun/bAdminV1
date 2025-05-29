// src/modules/owner/components/property/wizard/sections/LandDetails.tsx
// Version: 4.0.0
// Last Modified: 30-05-2025 18:15 IST
// Purpose: Added step completion validation system for progress tracking

import React, { useEffect, useCallback, useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';
import { 
  LAND_TYPES, 
  PLOT_FACING, 
  APPROVAL_STATUS,
  BOUNDARY_TYPES,
  SOIL_TYPES,
  WATER_AVAILABILITY,
  ELECTRICITY_STATUS,
  ROAD_CONNECTIVITY,
  DEVELOPMENT_STATUS
} from '../constants/landDetails';

const LandDetails: React.FC<FormSectionProps> = ({ 
  form,
  stepId = 'land_sale_basic_details' // Default stepId for land details
}) => {
  // Local state to ensure proper updates
  const [localState, setLocalState] = useState({
    landType: '',
    builtUpArea: '',
    areaUnit: 'sqft',
    expectedPrice: '',
    isNegotiable: false,
    plotFacing: '',
    developmentStatus: '',
    approvalStatus: '',
    soilType: '',
    boundaryType: '',
    waterAvailability: '',
    electricityStatus: '',
    roadConnectivity: '',
    additionalDetails: ''
  });

  // ✅ ADDED: Initialize validation system
  const flowType = form.getValues('flow.flowType') || 'land_sale';
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
    flowType,
    currentStepId: stepId
  });

  // Custom hooks for step data handling
  const saveField = useCallback((fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    console.log(`Saving field ${fieldName} at path ${path}:`, value);
    form.setValue(path, value, { shouldValidate: true });
    
    // Update local state immediately for responsive UI
    setLocalState(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // ✅ ADDED: Mark field as touched and validate
    markFieldAsTouched(fieldName);
    validateField(fieldName);
  }, [form, stepId, markFieldAsTouched, validateField]);

  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    const value = form.getValues(path);
    const finalValue = value ?? defaultValue;
    console.log(`Getting field ${fieldName} from path ${path}:`, finalValue);
    return finalValue;
  }, [form, stepId]);

  // Initialize local state from form when component mounts or stepId changes
  useEffect(() => {
    const currentSteps = form.getValues('steps') || {};
    if (!currentSteps[stepId]) {
      form.setValue('steps', {
        ...currentSteps,
        [stepId]: {}
      });
    } else {
      // Sync local state with form state
      const stepData = currentSteps[stepId];
      setLocalState(prevState => ({
        ...prevState,
        ...stepData
      }));
    }
  }, [stepId, form]);

  // Watch for form changes and sync with local state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.startsWith(`steps.${stepId}.`)) {
        const fieldName = name.replace(`steps.${stepId}.`, '');
        const fieldValue = form.getValues(name);
        setLocalState(prev => ({
          ...prev,
          [fieldName]: fieldValue
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [form, stepId]);

  const isAgricultural = localState.landType === 'Agricultural Land';
  
  return (
    <FormSection
      title="Land/Plot Details"
      description="Provide details about your land or plot for sale"
    >
      {/* ✅ ADDED: Progress indicator */}
      {requiredFields.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Step Completion: {completionPercentage}%
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300">
              {stepIsValid ? '✓ Ready to proceed' : 'Please complete required fields'}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Land Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor="landType" className="mb-2 block">
            Land/Plot Type
          </RequiredLabel>
          <select
            id="landType"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            value={localState.landType}
            onChange={(e) => saveField('landType', e.target.value)}
          >
            <option value="">Select land type</option>
            {LAND_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('landType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('landType').error}
            </p>
          )}
        </div>
        
        {/* Area Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="builtUpArea" className="mb-2 block">
              Total Area
            </RequiredLabel>
            <Input
              id="builtUpArea"
              type="text"
              placeholder="e.g., 2400"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              value={localState.builtUpArea}
              onChange={(e) => saveField('builtUpArea', e.target.value)}
            />
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('builtUpArea') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('builtUpArea').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="areaUnit" className="mb-2 block">
              Area Unit
            </RequiredLabel>
            <select
              id="areaUnit"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              value={localState.areaUnit}
              onChange={(e) => saveField('areaUnit', e.target.value)}
            >
              <option value="sqft">Square Feet</option>
              <option value="sqyd">Square Yards</option>
              <option value="acre">Acre</option>
              <option value="hectare">Hectare</option>
            </select>
          </div>
        </div>
        
        {/* Plot Facing and Price */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="plotFacing" className="mb-2 block">
              Plot Facing
            </RequiredLabel>
            <select
              id="plotFacing"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              value={localState.plotFacing}
              onChange={(e) => saveField('plotFacing', e.target.value)}
            >
              <option value="">Select plot facing</option>
              {PLOT_FACING.map((facing) => (
                <option key={facing} value={facing}>
                  {facing}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('plotFacing') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('plotFacing').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="expectedPrice" className="mb-2 block">
              Expected Price (₹)
            </RequiredLabel>
            <Input
              id="expectedPrice"
              type="text"
              placeholder="e.g., 5000000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              value={localState.expectedPrice}
              onChange={(e) => saveField('expectedPrice', e.target.value)}
            />
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('expectedPrice') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('expectedPrice').error}
              </p>
            )}
            <div className="flex items-center space-x-2 pt-2 mt-1">
              <input
                type="checkbox"
                id="isNegotiable"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                checked={localState.isNegotiable || false}
                onChange={(e) => saveField('isNegotiable', e.target.checked)}
              />
              <label
                htmlFor="isNegotiable"
                className="text-sm text-gray-600 font-medium"
              >
                Price Negotiable
              </label>
            </div>
          </div>
        </div>
        
        {/* Development Status */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="developmentStatus" className="mb-2 block">
              Development Status
            </RequiredLabel>
            <select
              id="developmentStatus"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              value={localState.developmentStatus}
              onChange={(e) => saveField('developmentStatus', e.target.value)}
            >
              <option value="">Select development status</option>
              {DEVELOPMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('developmentStatus') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('developmentStatus').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="approvalStatus" className="mb-2 block">
              Approval Status
            </RequiredLabel>
            <select
              id="approvalStatus"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              value={localState.approvalStatus}
              onChange={(e) => saveField('approvalStatus', e.target.value)}
            >
              <option value="">Select approval status</option>
              {APPROVAL_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('approvalStatus') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('approvalStatus').error}
              </p>
            )}
          </div>
        </div>
        
        {/* Soil type - Only for agricultural land */}
        {isAgricultural && (
          <div className="mb-6">
            <RequiredLabel htmlFor="soilType" className="mb-2 block">
              Soil Type
            </RequiredLabel>
            <select
              id="soilType"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              value={localState.soilType}
              onChange={(e) => saveField('soilType', e.target.value)}
            >
              <option value="">Select soil type</option>
              {SOIL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('soilType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('soilType').error}
              </p>
            )}
          </div>
        )}
        
        {/* Boundary Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor="boundaryType" className="mb-2 block">
            Boundary Type
          </RequiredLabel>
          <select
            id="boundaryType"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            value={localState.boundaryType}
            onChange={(e) => saveField('boundaryType', e.target.value)}
          >
            <option value="">Select boundary type</option>
            {BOUNDARY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('boundaryType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('boundaryType').error}
            </p>
          )}
        </div>
        
        {/* Utilities */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium mb-3 block">Utilities</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="waterAvailability" className="mb-2 block">
                Water Availability
              </RequiredLabel>
              <select
                id="waterAvailability"
                className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
                value={localState.waterAvailability}
                onChange={(e) => saveField('waterAvailability', e.target.value)}
              >
                <option value="">Select water availability</option>
                {WATER_AVAILABILITY.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {/* ✅ ADDED: Validation error display */}
              {shouldShowFieldError('waterAvailability') && (
                <p className="text-sm text-red-600 mt-0.5">
                  {getFieldValidation('waterAvailability').error}
                </p>
              )}
            </div>
            
            <div>
              <RequiredLabel htmlFor="electricityStatus" className="mb-2 block">
                Electricity Status
              </RequiredLabel>
              <select
                id="electricityStatus"
                className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
                value={localState.electricityStatus}
                onChange={(e) => saveField('electricityStatus', e.target.value)}
              >
                <option value="">Select electricity status</option>
                {ELECTRICITY_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {/* ✅ ADDED: Validation error display */}
              {shouldShowFieldError('electricityStatus') && (
                <p className="text-sm text-red-600 mt-0.5">
                  {getFieldValidation('electricityStatus').error}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Road Connectivity */}
        <div className="mb-6">
          <RequiredLabel htmlFor="roadConnectivity" className="mb-2 block">
            Road Connectivity
          </RequiredLabel>
          <select
            id="roadConnectivity"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            value={localState.roadConnectivity}
            onChange={(e) => saveField('roadConnectivity', e.target.value)}
          >
            <option value="">Select road connectivity</option>
            {ROAD_CONNECTIVITY.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('roadConnectivity') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('roadConnectivity').error}
            </p>
          )}
        </div>
        
        {/* Additional Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor="additionalDetails">
              Additional Details
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Recommended</div>
          </div>
          <Textarea
            id="additionalDetails"
            placeholder="Add any additional details about your land/plot..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-32"
            value={localState.additionalDetails}
            onChange={(e) => saveField('additionalDetails', e.target.value)}
          />
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('additionalDetails') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('additionalDetails').error}
            </p>
          )}
          <div className="mt-2 flex items-start text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="8"></line>
            </svg>
            <span>Include key selling points like nearby developments, potential use cases, or investment benefits.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default LandDetails;