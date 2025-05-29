// src/modules/owner/components/property/wizard/sections/CommercialSaleDetails.tsx
// Version: 3.0.0
// Last Modified: 30-05-2025 17:30 IST
// Purpose: Added step completion validation system integration

import React, { useState, useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';

// Ownership type options
const OWNERSHIP_TYPES = [
  'Self Owned',
  'Rented',
  'Leased',
  'Company Owned',
  'Others'
];

// Predefined ideal for tags
const PREDEFINED_IDEAL_TAGS = [
  'Bank',
  'Service Center',
  'Show Room',
  'ATM',
  'Retail'
];

const CommercialSaleDetails: React.FC<FormSectionProps> = ({ 
  form,
  stepId = 'com_sale_sale_details' // Default stepId for commercial sale details
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
    flowType: 'commercial_sale',
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
  
  // State for custom tags management
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Get current values for display
  const expectedPrice = getField('expectedPrice', '');
  const isNegotiable = getField('isNegotiable', false);
  const ownershipType = getField('ownershipType', '');
  const idealFor = getField('idealFor', []);
  
  // Function to convert number to Indian currency format (e.g. 2500000 to "₹ 25 Lacs")
  const formatToIndianCurrency = (value: number): string => {
    if (!value) return '';
    
    if (value >= 10000000) {
      return `₹ ${(value / 10000000).toFixed(2)} Crores`;
    } else if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(0)} Lacs`;
    } else if (value >= 1000) {
      return `₹ ${(value / 1000).toFixed(0)} Thousand`;
    } else {
      return `₹ ${value}`;
    }
  };
  
  // Handle tag selection toggle
  const handleTagToggle = (tag: string) => {
    const currentTags = idealFor || [];
    let newTags;
    
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter((t: string) => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    
    saveField('idealFor', newTags);
  };
  
  // Add custom tag
  const handleAddCustomTag = () => {
    if (customTagInput && !idealFor.includes(customTagInput)) {
      const newTags = [...idealFor, customTagInput];
      saveField('idealFor', newTags);
      setCustomTagInput('');
    }
  };
  
  return (
    <FormSection
      title="Commercial Sale Details"
      description="Provide details about your commercial property for sale"
    >
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

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Expected Price */}
          <div className="space-y-2">
            <RequiredLabel htmlFor="expectedPrice">
              Expected Price
            </RequiredLabel>
            <div className="relative">
              <Input
                id="expectedPrice"
                type="number"
                placeholder="7500000"
                className="pl-8"
                value={expectedPrice}
                onChange={(e) => saveField('expectedPrice', e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            </div>
            {expectedPrice && !isNaN(Number(expectedPrice)) && (
              <p className="text-sm text-teal-500 text-right">
                {formatToIndianCurrency(Number(expectedPrice))}
              </p>
            )}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isNegotiable"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                checked={isNegotiable}
                onChange={(e) => saveField('isNegotiable', e.target.checked)}
              />
              <label
                htmlFor="isNegotiable"
                className="text-sm text-gray-600 font-medium"
              >
                Price Negotiable
              </label>
            </div>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('expectedPrice') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('expectedPrice').error}
              </p>
            )}
          </div>
          
          {/* Ownership Type - implemented as radio buttons */}
          <div className="space-y-2">
            <RequiredLabel htmlFor="ownershipType">
              Ownership Type
            </RequiredLabel>
            <div className="space-y-2">
              {OWNERSHIP_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`ownershipType_${type}`}
                    value={type}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    checked={ownershipType === type}
                    onChange={(e) => saveField('ownershipType', e.target.value)}
                  />
                  <label
                    htmlFor={`ownershipType_${type}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('ownershipType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('ownershipType').error}
              </p>
            )}
          </div>
        </div>
        
        {/* Available From - removed right icon */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="availableFrom">
            Available From
          </RequiredLabel>
          <div className="relative">
            <Input
              id="availableFrom"
              type="date"
              placeholder="Select date"
              value={getField('availableFrom', '')}
              onChange={(e) => saveField('availableFrom', e.target.value)}
              className="w-full md:w-1/2"
            />
          </div>
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('availableFrom') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('availableFrom').error}
            </p>
          )}
        </div>
        
        {/* Ideal For */}
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm font-medium">Ideal For</span>
            <span className="ml-1 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
              </svg>
            </span>
          </div>
          
          {/* Tag selection area */}
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_IDEAL_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={cn(
                  "px-4 py-2 text-sm rounded-sm",
                  idealFor.includes(tag)
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tag}
              </button>
            ))}
            
            {/* Display custom tags */}
            {idealFor
              .filter((tag: string) => !PREDEFINED_IDEAL_TAGS.includes(tag))
              .map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className="px-4 py-2 text-sm rounded-sm bg-teal-500 text-white"
                >
                  {tag}
                </button>
              ))}
          </div>
          
          {/* Improved custom tag input and button layout */}
          <div className="flex mt-2">
            <Input
              placeholder="Add other tags"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              className="flex-grow rounded-r-none"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-l-none rounded-r-md"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CommercialSaleDetails;