// src/modules/owner/components/property/wizard/sections/SaleDetails.tsx
// Version: 5.1.0
// Last Modified: 30-01-2025 15:20 IST
// Purpose: Remove debug information from Sale Details step in Residential Sale flow

import React, { useEffect, useState, useRef } from 'react';
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

interface SaleDetailsProps extends FormSectionProps {
  stepId?: string;
}

export function SaleDetails({ form, adType, stepId: providedStepId }: SaleDetailsProps) {
  const { watch, setValue, getValues, formState: { errors } } = form;
  
  // Track mount status to avoid updates after unmount
  const isMounted = useRef(true);
  
  // Generate stepId based on current flow if not provided
  const formFlow = form.getValues('flow');
  const flowType = formFlow ? `${formFlow.category}_${formFlow.listingType}` : 'residential_sale';
  
  // Determine the appropriate stepId based on flow type
  let stepId = providedStepId;
  if (!stepId) {
    // Generate step ID based on flow - for sale flows it should be sale_details
    if (flowType.includes('sale')) {
      const prefix = flowType.split('_').map(part => part.substring(0, 3)).join('_');
      stepId = `${prefix}_sale_details`;
    } else {
      stepId = 'res_sale_sale_details'; // fallback
    }
  }
  
  console.log('[SaleDetails] Using stepId:', stepId, 'for flowType:', flowType);
  
  // Helper functions to work with the step-based form structure
  const getField = (fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // First try to get from step structure
    const stepValue = form.getValues(path);
    if (stepValue !== undefined) {
      return stepValue;
    }
    
    // Fallback to legacy root structure (for migration)
    const legacyValue = form.getValues(fieldName);
    if (legacyValue !== undefined) {
      // If we find data in root, migrate it to step structure
      console.log(`[SaleDetails] Migrating ${fieldName} from root to step:`, legacyValue);
      saveField(fieldName, legacyValue);
      return legacyValue;
    }
    
    return defaultValue;
  };
  
  const saveField = (fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // Ensure the steps structure exists
    const steps = form.getValues('steps') || {};
    if (!steps[stepId]) {
      // Create the step object if it doesn't exist 
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      }, { shouldValidate: false });
    }
    
    // Set the value in the step structure
    form.setValue(path, value, { shouldValidate: true });
    
    console.log(`[SaleDetails] Saved ${fieldName} to step ${stepId}:`, value);
  };
  
  // Component state
  const [expectedPriceValue, setExpectedPriceValue] = useState('');
  const [maintenanceCostValue, setMaintenanceCostValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize local state from form values
  useEffect(() => {
    const expectedPrice = getField('expectedPrice', '');
    const maintenanceCost = getField('maintenanceCost', '');
    
    setExpectedPriceValue(expectedPrice);
    setMaintenanceCostValue(maintenanceCost);
    
    console.log('[SaleDetails] Initialized with values:', {
      expectedPrice,
      maintenanceCost,
      stepId
    });
  }, [form, stepId]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Update form and local state
  const updateFormAndState = (field: string, value: any) => {
    // Update local state first
    if (field === 'expectedPrice') {
      setExpectedPriceValue(value);
    } else if (field === 'maintenanceCost') {
      setMaintenanceCostValue(value);
    }
    
    // Save to step structure
    saveField(field, value);
    
    console.log(`[SaleDetails] Updated ${field} to:`, value);
  };
  
  // Handle direct input changes for price fields
  const handleExpectedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    updateFormAndState('expectedPrice', value);
  };
  
  const handleMaintenanceCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    updateFormAndState('maintenanceCost', value);
  };
  
  // Function to load price data directly from database
  const loadPriceData = async () => {
    const propertyId = form.getValues('id');
    
    if (!propertyId) {
      console.log('[SaleDetails] No property ID, cannot load from database');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('[SaleDetails] Loading price data from DB for property:', propertyId);
      
      // Query the database directly
      const { data, error } = await supabase
        .from('properties')
        .select('price, property_details')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('[SaleDetails] Error loading price data:', error);
        return;
      }
      
      console.log('[SaleDetails] DB query result:', data);
      
      // Prioritize price data from property_details step structure
      let newExpectedPrice = '';
      let newMaintenanceCost = '';
      
      // Check if data exists in step structure first
      const stepData = data.property_details?.steps?.[stepId];
      if (stepData?.expectedPrice) {
        newExpectedPrice = stepData.expectedPrice;
        console.log('[SaleDetails] Found expectedPrice in step data:', newExpectedPrice);
      } else if (data.property_details?.expectedPrice) {
        newExpectedPrice = data.property_details.expectedPrice;
        console.log('[SaleDetails] Found expectedPrice in property_details root:', newExpectedPrice);
      } else if (data.price) {
        newExpectedPrice = data.price.toString();
        console.log('[SaleDetails] Using price for expectedPrice:', newExpectedPrice);
      }
      
      if (stepData?.maintenanceCost) {
        newMaintenanceCost = stepData.maintenanceCost;
        console.log('[SaleDetails] Found maintenanceCost in step data:', newMaintenanceCost);
      } else if (data.property_details?.maintenanceCost) {
        newMaintenanceCost = data.property_details.maintenanceCost;
        console.log('[SaleDetails] Found maintenanceCost in property_details root:', newMaintenanceCost);
      } else if (newExpectedPrice) {
        // Calculate default maintenance
        const priceValue = parseFloat(newExpectedPrice);
        if (!isNaN(priceValue)) {
          newMaintenanceCost = Math.min(
            Math.round(priceValue * 0.005),
            10000
          ).toString();
          console.log('[SaleDetails] Calculated default maintenanceCost:', newMaintenanceCost);
        }
      }
      
      // Update form and local state
      if (newExpectedPrice) {
        updateFormAndState('expectedPrice', newExpectedPrice);
      }
      
      if (newMaintenanceCost) {
        updateFormAndState('maintenanceCost', newMaintenanceCost);
      }
      
      // Set sale property flags in step structure
      saveField('isSaleProperty', true);
      saveField('propertyPriceType', 'sale');
      
      console.log('[SaleDetails] Updated form values after DB load');
    } catch (err) {
      console.error('[SaleDetails] Error in loadPriceData:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Watch other form fields from step structure
  const kitchenType = getField('kitchenType', '');
  const availableFrom = getField('availableFrom', '');
  const furnishing = getField('furnishing', '');
  const parking = getField('parking', '');
  const priceNegotiable = getField('priceNegotiable', false);
  const description = getField('description', '');
  
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
              onCheckedChange={(checked) => updateFormAndState('priceNegotiable', checked as boolean)}
            />
            <label htmlFor="priceNegotiable" className="text-base text-slate-700 cursor-pointer">
              Price Negotiable
            </label>
          </div>

          <div>
            <RequiredLabel required>Kitchen Type</RequiredLabel>
            <Select 
              value={kitchenType}
              onValueChange={value => updateFormAndState('kitchenType', value)}
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
              onChange={(e) => updateFormAndState('availableFrom', e.target.value)}
            />
            {errors.availableFrom && (
              <p className="text-sm text-red-600 mt-0.5">{errors.availableFrom.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Furnishing</RequiredLabel>
            <Select 
              value={furnishing}
              onValueChange={value => updateFormAndState('furnishing', value)}
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
            onValueChange={value => updateFormAndState('parking', value)}
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
            value={description}
            onChange={(e) => updateFormAndState('description', e.target.value)}
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