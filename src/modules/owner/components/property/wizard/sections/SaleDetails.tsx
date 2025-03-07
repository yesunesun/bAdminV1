// src/modules/owner/components/property/wizard/sections/SaleDetails.tsx
// Version: 3.1.0
// Last Modified: 07-03-2025 14:30 IST
// Purpose: Fixed state synchronization and form initialization issues

import React, { useEffect, useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee } from 'lucide-react';
import { FormSectionProps } from '../types';
import { cn } from '@/lib/utils';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import {
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  KITCHEN_TYPES,
} from '../constants';

export function SaleDetails({ form, adType }: FormSectionProps) {
  const { register, watch, setValue, getValues, formState: { errors } } = form;
  
  // Initialize local state from form values
  const [expectedPriceValue, setExpectedPriceValue] = useState(() => {
    return getValues('expectedPrice') || '';
  });
  
  const [maintenanceCostValue, setMaintenanceCostValue] = useState(() => {
    return getValues('maintenanceCost') || '';
  });
  
  const [initialized, setInitialized] = useState(false);
  
  // Force component updates
  const [forceUpdate, setForceUpdate] = useState(0);
  const triggerUpdate = () => setForceUpdate(prev => prev + 1);

  // Debug helper to inspect all form values
  const debugSaleFieldSources = () => {
    const currentValues = form.getValues();
    
    console.log('========= SALE FIELD DEBUG SOURCES ===========');
    console.log('Current form values:', currentValues);
    console.log('Sale-specific fields:', {
      expectedPrice: currentValues.expectedPrice,
      maintenanceCost: currentValues.maintenanceCost,
      kitchenType: currentValues.kitchenType,
      priceNegotiable: currentValues.priceNegotiable,
      listingType: currentValues.listingType,
      isSaleProperty: currentValues.isSaleProperty,
      propertyPriceType: currentValues.propertyPriceType
    });
    console.log('Local state values:', {
      expectedPriceValue, 
      maintenanceCostValue
    });
    console.log('========= SALE FIELD DEBUG SOURCES END ===========');
  };

  // Initialize the component when it first mounts
  useEffect(() => {
    if (initialized) return;
    
    console.log('=========== DEBUG: SALE DETAILS COMPONENT INITIALIZING ===========');
    
    // Get all possible values from form
    const formValues = form.getValues();
    
    console.log('Form values on component mount:', formValues);
    
    // Extract sale prices from form
    let expectedPrice = formValues.expectedPrice || '';
    let maintenanceCost = formValues.maintenanceCost || '';
    
    console.log('Loading initial values:', {
      expectedPrice,
      maintenanceCost
    });
    
    // Update state and form values
    setExpectedPriceValue(expectedPrice);
    setMaintenanceCostValue(maintenanceCost);
    
    // Also update the form - this is critical for when submitting
    setValue('expectedPrice', expectedPrice, { shouldValidate: false });
    setValue('maintenanceCost', maintenanceCost, { shouldValidate: false });
    
    // Set flags that explicitly mark this as a sale property
    setValue('isSaleProperty', true, { shouldValidate: false });
    setValue('propertyPriceType', 'sale', { shouldValidate: false });
    
    // Set initialization flag
    setInitialized(true);
    
    console.log('=========== DEBUG: SALE DETAILS COMPONENT INITIALIZED ===========');
  }, []);
  
  // Handle updates if form values change externally
  useEffect(() => {
    if (!initialized) return;
    
    const formValues = form.getValues();
    
    // Check if form values differ from local state
    if (formValues.expectedPrice && formValues.expectedPrice !== expectedPriceValue) {
      console.log('Updating local expectedPrice from form:', formValues.expectedPrice);
      setExpectedPriceValue(formValues.expectedPrice);
    }
    
    if (formValues.maintenanceCost && formValues.maintenanceCost !== maintenanceCostValue) {
      console.log('Updating local maintenanceCost from form:', formValues.maintenanceCost);
      setMaintenanceCostValue(formValues.maintenanceCost);
    }
  }, [initialized, form, forceUpdate]);

  // Function to reload all form values
  const reloadFormValues = () => {
    console.log('=========== DEBUG: RELOADING SALE FORM VALUES ===========');
    const formValues = form.getValues();
    
    // Get current form values
    const expectedPrice = formValues.expectedPrice || '';
    const maintenanceCost = formValues.maintenanceCost || '';
    
    console.log('Reloaded values:', {
      expectedPrice,
      maintenanceCost
    });
    
    // Update both local state and form
    setExpectedPriceValue(expectedPrice);
    setMaintenanceCostValue(maintenanceCost);
    
    // Update form values and mark as touched to ensure they're included in submission
    setValue('expectedPrice', expectedPrice, { shouldValidate: false, shouldTouch: true });
    setValue('maintenanceCost', maintenanceCost, { shouldValidate: false, shouldTouch: true });
    
    // Set flags that explicitly mark this as a sale property
    setValue('isSaleProperty', true, { shouldValidate: false });
    setValue('propertyPriceType', 'sale', { shouldValidate: false });
    
    // Force a UI update
    triggerUpdate();
    
    console.log('=========== DEBUG: RELOADED SALE FORM VALUES ===========');
  };

  // Handle input changes with controlled components
  const handleExpectedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    console.log('Setting expectedPrice to:', value);
    
    // Update local state
    setExpectedPriceValue(value);
    
    // Update form with validation
    setValue('expectedPrice', value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const handleMaintenanceCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    console.log('Setting maintenanceCost to:', value);
    
    // Update local state
    setMaintenanceCostValue(value);
    
    // Update form with validation
    setValue('maintenanceCost', value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Watch form values for other fields
  const kitchenType = watch('kitchenType') || '';
  const availableFrom = watch('availableFrom') || '';
  const furnishing = watch('furnishing') || '';
  const parking = watch('parking') || '';
  const priceNegotiable = watch('priceNegotiable') || false;

  // Log changes to sale fields
  useEffect(() => {
    console.log('Sale field values updated:', {
      expectedPrice: expectedPriceValue,
      maintenanceCost: maintenanceCostValue,
      kitchenType,
      priceNegotiable
    });
  }, [expectedPriceValue, maintenanceCostValue, kitchenType, priceNegotiable]);

  // Ensure form values stay synchronized with local state
  useEffect(() => {
    if (!initialized) return;
    
    // Synchronize form values with local state
    setValue('expectedPrice', expectedPriceValue, { shouldValidate: false });
    setValue('maintenanceCost', maintenanceCostValue, { shouldValidate: false });
    
  }, [initialized, expectedPriceValue, maintenanceCostValue, setValue]);

  return (
    <FormSection
      title="Sale Details"
      description="Specify your property sale details"
    >
      <div className="space-y-4">
        {/* Debug Button - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-3 rounded-lg mb-3">
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={debugSaleFieldSources}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Debug Sale Fields
              </button>
              <button
                type="button"
                onClick={reloadFormValues}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Reload Form Values
              </button>
            </div>
            <div className="mt-2 text-xs">
              <p>Expected Price: {expectedPriceValue || 'empty'}</p>
              <p>Maintenance Cost: {maintenanceCostValue || 'empty'}</p>
              <p>Form EP: {getValues().expectedPrice || 'empty'}</p>
              <p>Form MC: {getValues().maintenanceCost || 'empty'}</p>
            </div>
          </div>
        )}

        {/* Expected Price and Maintenance Cost - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Expected Price</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-slate-500">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                type="text"
                className="h-11 pl-9 text-base"
                value={expectedPriceValue}
                onChange={handleExpectedPriceChange}
                placeholder="Enter amount"
                name="expectedPrice"
              />
            </div>
            {errors.expectedPrice && (
              <p className="text-sm text-red-600 mt-0.5">{errors.expectedPrice.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Maintenance Cost</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-slate-500">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                type="text"
                className="h-11 pl-9 pr-20 text-base"
                value={maintenanceCostValue}
                onChange={handleMaintenanceCostChange}
                placeholder="Enter amount"
                name="maintenanceCost"
              />
              <span className="absolute right-3 inset-y-0 flex items-center text-sm text-slate-500">
                per month
              </span>
            </div>
            {errors.maintenanceCost && (
              <p className="text-sm text-red-600 mt-0.5">{errors.maintenanceCost.message}</p>
            )}
          </div>
        </div>

        {/* Price Negotiable and Kitchen Type - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="priceNegotiable"
              checked={!!priceNegotiable}
              onCheckedChange={(checked) => setValue('priceNegotiable', checked as boolean, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              })}
            />
            <label htmlFor="priceNegotiable" className="text-base text-slate-700 cursor-pointer">
              Price Negotiable
            </label>
          </div>

          <div>
            <RequiredLabel required>Kitchen Type</RequiredLabel>
            <Select 
              value={kitchenType}
              onValueChange={value => setValue('kitchenType', value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              })}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Select kitchen type" />
              </SelectTrigger>
              <SelectContent>
                {KITCHEN_TYPES.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kitchenType && (
              <p className="text-sm text-red-600 mt-0.5">{errors.kitchenType.message}</p>
            )}
          </div>
        </div>

        {/* Available From and Furnishing - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Available From</RequiredLabel>
            <Input
              type="date"
              className="h-11 text-base"
              min={minDate}
              value={availableFrom}
              onChange={(e) => setValue('availableFrom', e.target.value, { 
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              })}
            />
            {errors.availableFrom && (
              <p className="text-sm text-red-600 mt-0.5">{errors.availableFrom.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Furnishing</RequiredLabel>
            <Select 
              value={furnishing}
              onValueChange={value => setValue('furnishing', value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              })}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Furnishing status?" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.furnishing && (
              <p className="text-sm text-red-600 mt-0.5">{errors.furnishing.message}</p>
            )}
          </div>
        </div>

        {/* Parking */}
        <div>
          <RequiredLabel required>Parking</RequiredLabel>
          <Select 
            value={parking}
            onValueChange={value => setValue('parking', value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            })}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Available parking?" />
            </SelectTrigger>
            <SelectContent>
              {PARKING_OPTIONS.map(option => (
                <SelectItem key={option} value={option} className="text-base">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parking && (
            <p className="text-sm text-red-600 mt-0.5">{errors.parking.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <RequiredLabel>Description</RequiredLabel>
          <textarea
            value={watch('description') || ''}
            onChange={(e) => setValue('description', e.target.value, {
              shouldValidate: true,
              shouldDirty: true
            })}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base
              shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
              focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
              hover:border-slate-300"
            placeholder="Additional details about your property (optional)"
          />
        </div>
      </div>
    </FormSection>
  );
}