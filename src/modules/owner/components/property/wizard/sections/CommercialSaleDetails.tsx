// src/modules/owner/components/property/wizard/sections/CommercialSaleDetails.tsx
// Version: 1.6.0
// Last Modified: 13-04-2025 19:15 IST
// Purpose: Fixed create new tag button styling to match design

import React, { useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
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
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // State for custom tags management
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Watch for expected price and negotiable checkbox
  const expectedPrice = watch('expectedPrice');
  const isNegotiable = watch('isNegotiable');
  
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
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };
  
  // Add custom tag
  const handleAddCustomTag = () => {
    if (customTagInput && !selectedTags.includes(customTagInput)) {
      setSelectedTags(prev => [...prev, customTagInput]);
      setCustomTagInput('');
    }
  };
  
  // Update form value when selected tags change
  useEffect(() => {
    setValue('idealFor', selectedTags);
  }, [selectedTags, setValue]);
  
  return (
    <FormSection
      title="Commercial Sale Details"
      description="Provide details about your commercial property for sale"
    >
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
                error={errors.expectedPrice?.message}
                {...register('expectedPrice')}
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
                type="radio"
                id="isNegotiable"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                {...register('isNegotiable')}
              />
              <label
                htmlFor="isNegotiable"
                className="text-sm text-gray-600 font-medium"
              >
                Price Negotiable
              </label>
            </div>
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
                    {...register('ownershipType')}
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
              error={errors.availableFrom?.message}
              {...register('availableFrom')}
              className="w-full md:w-1/2"
            />
          </div>
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
                  selectedTags.includes(tag)
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
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
          
          {/* Hidden input to store selected tags */}
          <input 
            type="hidden" 
            {...register('idealFor')} 
            id="idealFor" 
            value={selectedTags.join(',')} 
          />
        </div>
      </div>
    </FormSection>
  );
};

export default CommercialSaleDetails;