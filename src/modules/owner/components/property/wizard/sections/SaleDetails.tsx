// src/modules/owner/components/property/wizard/sections/SaleDetails.tsx
// Version: 4.0.0
// Last Modified: 07-03-2025 21:00 IST
// Purpose: Fixed pricing data loading with direct database access

import React, { useEffect, useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee } from 'lucide-react';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { supabase } from '@/lib/supabase';
import {
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  KITCHEN_TYPES,
} from '../constants';

export function SaleDetails({ form, adType }: FormSectionProps) {
  const { watch, setValue, getValues, formState: { errors } } = form;
  
  // Component state
  const [expectedPriceValue, setExpectedPriceValue] = useState('');
  const [maintenanceCostValue, setMaintenanceCostValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize local state from form values
  useEffect(() => {
    const formValues = form.getValues();
    console.log('Initial form values in SaleDetails:', {
      expectedPrice: formValues.expectedPrice,
      maintenanceCost: formValues.maintenanceCost,
      kitchenType: formValues.kitchenType,
      priceNegotiable: formValues.priceNegotiable,
      id: formValues.id
    });
    
    // Set local state from form
    setExpectedPriceValue(formValues.expectedPrice || '');
    setMaintenanceCostValue(formValues.maintenanceCost || '');
  }, [form]);
  
  // Update local state when form values change
  useEffect(() => {
    const formExpectedPrice = form.getValues('expectedPrice');
    const formMaintenanceCost = form.getValues('maintenanceCost');
    
    if (formExpectedPrice !== expectedPriceValue && formExpectedPrice) {
      setExpectedPriceValue(formExpectedPrice);
    }
    
    if (formMaintenanceCost !== maintenanceCostValue && formMaintenanceCost) {
      setMaintenanceCostValue(formMaintenanceCost);
    }
  }, [form.watch('expectedPrice'), form.watch('maintenanceCost')]);
  
  // Handle direct input changes
  const handleExpectedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setExpectedPriceValue(value);
    setValue('expectedPrice', value, { shouldValidate: true, shouldDirty: true });
  };
  
  const handleMaintenanceCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMaintenanceCostValue(value);
    setValue('maintenanceCost', value, { shouldValidate: true, shouldDirty: true });
  };
  
  // Debug function to view current values
  const debugFields = () => {
    const values = form.getValues();
    console.log('Current form values:', values);
    console.log('Sale fields:', {
      expectedPrice: values.expectedPrice,
      maintenanceCost: values.maintenanceCost,
      kitchenType: values.kitchenType,
      priceNegotiable: values.priceNegotiable,
      id: values.id,
      price: values.price
    });
    console.log('Local state:', {
      expectedPriceValue,
      maintenanceCostValue
    });
  };
  
  // Function to load price data directly from database
  const loadPriceData = async () => {
    const propertyId = form.getValues('id');
    
    if (!propertyId) {
      console.log('No property ID, cannot load from database');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Loading price data from DB for property:', propertyId);
      
      // Query the database directly
      const { data, error } = await supabase
        .from('properties')
        .select('price, property_details')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('Error loading price data:', error);
        return;
      }
      
      console.log('DB query result:', data);
      
      // Prioritize price data from property_details
      let newExpectedPrice = '';
      let newMaintenanceCost = '';
      
      if (data.property_details?.expectedPrice) {
        newExpectedPrice = data.property_details.expectedPrice;
        console.log('Found expectedPrice in property_details:', newExpectedPrice);
      } else if (data.price) {
        newExpectedPrice = data.price.toString();
        console.log('Using price for expectedPrice:', newExpectedPrice);
      }
      
      if (data.property_details?.maintenanceCost) {
        newMaintenanceCost = data.property_details.maintenanceCost;
        console.log('Found maintenanceCost in property_details:', newMaintenanceCost);
      } else if (newExpectedPrice) {
        // Calculate default maintenance
        const priceValue = parseFloat(newExpectedPrice);
        if (!isNaN(priceValue)) {
          newMaintenanceCost = Math.min(
            Math.round(priceValue * 0.005),
            10000
          ).toString();
          console.log('Calculated default maintenanceCost:', newMaintenanceCost);
        }
      }
      
      // Update form and local state
      if (newExpectedPrice) {
        setValue('expectedPrice', newExpectedPrice, { shouldValidate: false });
        setExpectedPriceValue(newExpectedPrice);
      }
      
      if (newMaintenanceCost) {
        setValue('maintenanceCost', newMaintenanceCost, { shouldValidate: false });
        setMaintenanceCostValue(newMaintenanceCost);
      }
      
      // Set sale property flags
      setValue('isSaleProperty', true, { shouldValidate: false });
      setValue('propertyPriceType', 'sale', { shouldValidate: false });
      
      console.log('Updated form values after DB load:', {
        expectedPrice: form.getValues('expectedPrice'),
        maintenanceCost: form.getValues('maintenanceCost')
      });
    } catch (err) {
      console.error('Error in loadPriceData:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Watch other form fields
  const kitchenType = watch('kitchenType') || '';
  const availableFrom = watch('availableFrom') || '';
  const furnishing = watch('furnishing') || '';
  const parking = watch('parking') || '';
  const priceNegotiable = watch('priceNegotiable') || false;
  
  // Get tomorrow's date for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <FormSection
      title="Sale Details"
      description="Specify your property sale details"
    >
      <div className="space-y-4">
        {/* Debug panel */}
        <div className="bg-gray-100 p-3 rounded-lg mb-3">
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={debugFields}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Debug Fields
            </button>
            <button
              type="button"
              onClick={loadPriceData}
              disabled={isLoading}
              className={`px-3 py-1 ${isLoading ? 'bg-gray-400' : 'bg-green-500 text-white'} rounded text-sm`}
            >
              {isLoading ? 'Loading...' : 'Load Price Data'}
            </button>
          </div>
          <div className="mt-2 text-xs">
            <p>Expected Price: {expectedPriceValue || 'empty'}</p>
            <p>Maintenance Cost: {maintenanceCostValue || 'empty'}</p>
          </div>
        </div>

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