// src/modules/owner/components/property/wizard/sections/CoworkingBasicDetails.tsx
// Version: 2.0.0
// Last Modified: 30-05-2025 18:00 IST
// Purpose: Added step completion validation system for progress tracking

import React, { useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { useStepForm } from '../hooks/useStepForm';
import { useStepValidation } from '../hooks/useStepValidation';
import { 
  COWORKING_SPACE_TYPES
} from '../constants/coworkingDetails';

const CoworkingBasicDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType,
  stepId = 'com_cow_basic_details' // Default step ID for coworking basic details
}) => {
  const { 
    registerField, 
    getFieldError, 
    setFieldValue, 
    getFieldValue,
    getFieldId
  } = useStepForm(form, stepId);

  // ✅ ADDED: Initialize validation system
  const flowType = form.getValues('flow.flowType') || 'commercial_coworking';
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
  
  // Migrate data from root to step object if needed
  useEffect(() => {
    const fieldsToMigrate = [
      'title', 'propertyType', 'builtUpArea', 'builtUpAreaUnit', 'propertyAge',
      'floor', 'totalFloors', 'facing', 'description'
    ];
    
    // Check each field and migrate if needed
    fieldsToMigrate.forEach(field => {
      const currentValue = getFieldValue(field);
      const rootValue = form.getValues(field);
      
      // If there's a value at the root but not in the step, migrate it
      if (rootValue !== undefined && currentValue === undefined) {
        setFieldValue(field, rootValue);
      }
    });
  }, []);

  // ✅ ADDED: Enhanced field update with validation
  const updateFormAndState = useCallback((field: string, value: any) => {
    setFieldValue(field, value);
    
    // Mark field as touched and validate
    markFieldAsTouched(field);
    validateField(field);
  }, [setFieldValue, markFieldAsTouched, validateField]);
  
  return (
    <FormSection
      title="Co-working Space Basic Information"
      description="Provide basic information about your co-working space property"
    >
      {/* ✅ ADDED: Progress indicator (like LocationDetails) */}
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
        {/* Property Title */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('title')} className="mb-2 block">
            Property Title
          </RequiredLabel>
          <Input
            id={getFieldId('title')}
            placeholder="Enter a catchy title for your co-working space"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...registerField('title')}
            onChange={(e) => updateFormAndState('title', e.target.value)}
          />
          {getFieldError('title') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('title')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('title') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('title').error}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            A good title helps your property stand out (e.g., "Modern Co-working Space in HITEC City")
          </p>
        </div>
        
        {/* Space Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('propertyType')} className="mb-2 block">
            Co-working Space Type
          </RequiredLabel>
          <select
            id={getFieldId('propertyType')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('propertyType')}
            onChange={(e) => updateFormAndState('propertyType', e.target.value)}
          >
            <option value="">Select space type</option>
            {COWORKING_SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {getFieldError('propertyType') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('propertyType')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('propertyType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('propertyType').error}
            </p>
          )}
        </div>
        
        {/* Total Area */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('builtUpArea')} className="mb-2 block">
              Total Area
            </RequiredLabel>
            <Input
              id={getFieldId('builtUpArea')}
              type="number"
              placeholder="e.g., 2000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('builtUpArea')}
              onChange={(e) => updateFormAndState('builtUpArea', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('builtUpArea') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('builtUpArea')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('builtUpArea') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('builtUpArea').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('builtUpAreaUnit')} className="mb-2 block">
              Area Unit
            </RequiredLabel>
            <select
              id={getFieldId('builtUpAreaUnit')}
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...registerField('builtUpAreaUnit')}
              onChange={(e) => updateFormAndState('builtUpAreaUnit', e.target.value)}
            >
              <option value="sqft">Square Feet</option>
              <option value="sqyd">Square Yards</option>
            </select>
            {getFieldError('builtUpAreaUnit') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('builtUpAreaUnit')?.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Property Age */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('propertyAge')} className="mb-2 block">
            Property Age
          </RequiredLabel>
          <select
            id={getFieldId('propertyAge')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('propertyAge')}
            onChange={(e) => updateFormAndState('propertyAge', e.target.value)}
          >
            <option value="">Select property age</option>
            <option value="New">Brand New</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-10 years">5-10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
          {getFieldError('propertyAge') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('propertyAge')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('propertyAge') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('propertyAge').error}
            </p>
          )}
        </div>
        
        {/* Floor and Total Floors */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('floor')} className="mb-2 block">
              Floor
            </RequiredLabel>
            <Input
              id={getFieldId('floor')}
              type="number"
              placeholder="e.g., 3"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('floor')}
              onChange={(e) => updateFormAndState('floor', parseInt(e.target.value) || 0)}
            />
            {getFieldError('floor') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('floor')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('floor') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('floor').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('totalFloors')} className="mb-2 block">
              Total Floors
            </RequiredLabel>
            <Input
              id={getFieldId('totalFloors')}
              type="number"
              placeholder="e.g., 10"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('totalFloors')}
              onChange={(e) => updateFormAndState('totalFloors', parseInt(e.target.value) || 0)}
            />
            {getFieldError('totalFloors') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('totalFloors')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('totalFloors') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('totalFloors').error}
              </p>
            )}
          </div>
        </div>
        
        {/* Facing */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('facing')} className="mb-2 block">
            Facing Direction
          </RequiredLabel>
          <select
            id={getFieldId('facing')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('facing')}
            onChange={(e) => updateFormAndState('facing', e.target.value)}
          >
            <option value="">Select direction</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North-East">North-East</option>
            <option value="North-West">North-West</option>
            <option value="South-East">South-East</option>
            <option value="South-West">South-West</option>
          </select>
          {getFieldError('facing') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('facing')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('facing') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('facing').error}
            </p>
          )}
        </div>
        
        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor={getFieldId('description')}>
              Short Description
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Recommended</div>
          </div>
          <Textarea
            id={getFieldId('description')}
            placeholder="Briefly describe your co-working space..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-24"
            {...registerField('description')}
            onChange={(e) => updateFormAndState('description', e.target.value)}
          />
          {getFieldError('description') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('description')?.message as string}</p>
          )}
          <div className="mt-2 flex items-start text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="8"></line>
            </svg>
            <span>Include key highlights such as location advantages, unique amenities, or special offers.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingBasicDetails;