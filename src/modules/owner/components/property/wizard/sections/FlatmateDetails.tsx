// src/modules/owner/components/property/wizard/sections/FlatmateDetails.tsx
// Version: 1.6.0
// Last Modified: 12-04-2025 17:45 IST
// Purpose: Updated to match the exact UI design shown in screenshots with custom select components

import React, { useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { cn } from '@/lib/utils';

const FlatmateDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const [showDirectionsTip, setShowDirectionsTip] = useState(true);
  const [showDirectionsField, setShowDirectionsField] = useState(false);
  
  // States for custom select components
  const [showPersonOptionsOpen, setShowPersonOptionsOpen] = useState(false);
  const [waterSupplyOptionsOpen, setWaterSupplyOptionsOpen] = useState(false);
  const [selectedShowPerson, setSelectedShowPerson] = useState('');
  const [selectedWaterSupply, setSelectedWaterSupply] = useState('');

  // Toggle button component
  const ToggleButtonGroup = ({ label, name }) => {
    const value = watch(name) || "";
    
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex rounded-md overflow-hidden w-full max-w-[180px]">
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium text-center transition-colors",
              value === "Yes" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => setValue(name, "Yes", { shouldValidate: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium text-center transition-colors",
              value === "No" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => setValue(name, "No", { shouldValidate: true })}
          >
            No
          </button>
        </div>
        <input type="hidden" {...register(name)} />
      </div>
    );
  };

  // Helper function for option selection
  const handleShowPersonSelect = (value) => {
    setSelectedShowPerson(value);
    setValue('propertyShowPerson', value, { shouldValidate: true });
    setShowPersonOptionsOpen(false);
  };

  const handleWaterSupplySelect = (value) => {
    setSelectedWaterSupply(value);
    setValue('waterSupply', value, { shouldValidate: true });
    setWaterSupplyOptionsOpen(false);
  };

  return (
    <FormSection
      title="Flatmate Details"
      description="Specify room facilities and flatmate preferences"
    >
      <div className="space-y-8">
        {/* 1. Room Details */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold">Room Details</h3>
          <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
            <ToggleButtonGroup label="Attached Bathroom" name="hasAttachedBathroom" />
            <ToggleButtonGroup label="AC Room" name="hasAC" />
            <ToggleButtonGroup label="Balcony" name="hasBalcony" />
          </div>
        </div>

        {/* 2. Flatmate Preferences */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold">Flatmate Preferences</h3>
          <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
            <ToggleButtonGroup label="Non-Veg Allowed" name="isNonVegAllowed" />
            <ToggleButtonGroup label="Smoking Allowed" name="isSmokingAllowed" />
            <ToggleButtonGroup label="Drinking Allowed" name="isDrinkingAllowed" />
          </div>
        </div>

        {/* 3. Additional Details */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold">Additional Details for Maximum Visibility</h3>
          <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
            <ToggleButtonGroup label="Gym" name="hasGym" />
            <ToggleButtonGroup label="Gated Security" name="hasGatedSecurity" />
          </div>
        </div>

        {/* 4. Contact & Utilities Info */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold">Contact & Utilities Info</h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg space-y-5">
            {/* Who Will Show the Property? */}
            <div>
              <p className="font-medium text-sm mb-2">Who Will Show the Property?</p>
              <div className="relative">
                <div 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => setShowPersonOptionsOpen(!showPersonOptionsOpen)}
                >
                  {selectedShowPerson || "Select who will show the property"}
                </div>
                
                {showPersonOptionsOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 z-10 shadow-lg">
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("Need help")}
                    >
                      Need help
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("I will show")}
                    >
                      I will show
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("Neighbours")}
                    >
                      Neighbours
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("Friends/Relatives")}
                    >
                      Friends/Relatives
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("Security")}
                    >
                      Security
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleShowPersonSelect("Tenants")}
                    >
                      Tenants
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleShowPersonSelect("Others")}
                    >
                      Others
                    </div>
                  </div>
                )}
                <input type="hidden" {...register('propertyShowPerson')} value={selectedShowPerson} />
              </div>
            </div>

            {/* Secondary Contact Number */}
            <div>
              <p className="font-medium text-sm mb-2">Secondary Contact Number</p>
              <div className="flex">
                <div className="w-[90px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-md p-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-sm font-medium">+91</span>
                  </div>
                </div>
                <Input
                  id="secondaryContactNumber"
                  placeholder="Enter phone number"
                  className="flex-1 rounded-l-none"
                  error={errors.secondaryContactNumber?.message}
                  {...register('secondaryContactNumber')}
                />
              </div>
            </div>

            {/* Water Supply */}
            <div>
              <p className="font-medium text-sm mb-2">Water Supply</p>
              <div className="relative">
                <div 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => setWaterSupplyOptionsOpen(!waterSupplyOptionsOpen)}
                >
                  {selectedWaterSupply || "Select water supply type"}
                </div>
                
                {waterSupplyOptionsOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 z-10 shadow-lg">
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleWaterSupplySelect("Corporation")}
                    >
                      Corporation
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                      onClick={() => handleWaterSupplySelect("Borewell")}
                    >
                      Borewell
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleWaterSupplySelect("Both")}
                    >
                      Both
                    </div>
                  </div>
                )}
                <input type="hidden" {...register('waterSupply')} value={selectedWaterSupply} />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Directions Tip */}
        {showDirectionsTip && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 relative">
            <button 
              type="button"
              className="absolute top-2 right-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              onClick={() => setShowDirectionsTip(false)}
            >
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-blue-600 dark:text-blue-300">
                💡
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Don't want calls asking location? Add directions to reach using landmarks.
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm p-0 h-auto text-blue-600 dark:text-blue-400 font-medium mt-1"
                  onClick={() => {
                    setShowDirectionsField(true);
                    setShowDirectionsTip(false);
                  }}
                >
                  Add Directions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Directions Field (shown if user clicks "Add Directions") */}
        {showDirectionsField && (
          <div className="grid gap-3">
            <label htmlFor="directions" className="text-sm font-medium">
              Directions to Property
            </label>
            <Textarea
              id="directions"
              placeholder="E.g., 'Located near Big Bazaar, take the 2nd right after ABC school...'"
              rows={3}
              {...register('directions')}
            />
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default FlatmateDetails;