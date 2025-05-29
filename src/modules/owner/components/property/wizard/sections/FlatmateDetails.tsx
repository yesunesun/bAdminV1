// src/modules/owner/components/property/wizard/sections/FlatmateDetails.tsx
// Version: 3.0.0
// Last Modified: 30-05-2025 16:00 IST
// Purpose: Removed Secondary Contact field to avoid duplication with Features step

import React, { useState, useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { cn } from '@/lib/utils';

const FlatmateDetails: React.FC<FormSectionProps> = ({ 
  form,
  stepId = 'res_flat_flatmate_details' // Default stepId for flatmates
}) => {
  const [showDirectionsTip, setShowDirectionsTip] = useState(true);
  const [showDirectionsField, setShowDirectionsField] = useState(false);
  
  // States for custom select components
  const [showPersonOptionsOpen, setShowPersonOptionsOpen] = useState(false);
  const [waterSupplyOptionsOpen, setWaterSupplyOptionsOpen] = useState(false);
  
  // Custom hooks for step data handling
  const saveField = useCallback((fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    console.log(`Saving field ${fieldName} at path ${path}:`, value);
    form.setValue(path, value, { shouldValidate: true });
  }, [form, stepId]);

  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    const value = form.getValues(path);
    console.log(`Getting field ${fieldName} from path ${path}:`, value);
    return value ?? defaultValue;
  }, [form, stepId]);
  
  // Initialize values from existing data
  const [selectedShowPerson, setSelectedShowPerson] = useState(getField('propertyShowPerson', ''));
  const [selectedWaterSupply, setSelectedWaterSupply] = useState(getField('waterSupply', ''));

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
    
    // Load existing values
    setSelectedShowPerson(getField('propertyShowPerson', ''));
    setSelectedWaterSupply(getField('waterSupply', ''));
  }, [stepId, form]);

  // Toggle button component with updated data handling
  const ToggleButtonGroup = ({ label, name }: { label: string; name: string }) => {
    const value = getField(name, '');
    
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex rounded-md overflow-hidden w-full max-w-[150px]">
          <button
            type="button"
            className={cn(
              "flex-1 px-3 py-1 text-sm font-medium text-center transition-colors",
              value === "Yes" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => saveField(name, "Yes")}
          >
            Yes
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 px-3 py-1 text-sm font-medium text-center transition-colors",
              value === "No" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => saveField(name, "No")}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  // Helper function for option selection
  const handleShowPersonSelect = (value: string) => {
    setSelectedShowPerson(value);
    saveField('propertyShowPerson', value);
    setShowPersonOptionsOpen(false);
  };

  const handleWaterSupplySelect = (value: string) => {
    setSelectedWaterSupply(value);
    saveField('waterSupply', value);
    setWaterSupplyOptionsOpen(false);
  };

  // Options component for dropdown menus
  const DropdownOptions = ({ 
    isOpen, 
    options, 
    onSelect 
  }: { 
    isOpen: boolean; 
    options: string[]; 
    onSelect: (value: string) => void; 
  }) => {
    if (!isOpen) return null;
    
    return (
      <div className="absolute left-0 right-0 top-full mt-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 z-10 shadow-lg">
        {options.map((option, index) => (
          <div 
            key={index}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0"
            onClick={() => onSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  return (
    <FormSection
      title="Flatmate Details"
      description="Specify room facilities and flatmate preferences"
    >
      <div className="space-y-5">
        {/* Combined Sections in Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: Room Details */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Room Details</h3>
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <ToggleButtonGroup label="Attached Bathroom" name="hasAttachedBathroom" />
              <ToggleButtonGroup label="AC Room" name="hasAC" />
              <ToggleButtonGroup label="Balcony" name="hasBalcony" />
            </div>
          </div>

          {/* Column 2: Flatmate Preferences */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Flatmate Preferences</h3>
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <ToggleButtonGroup label="Non-Veg Allowed" name="isNonVegAllowed" />
              <ToggleButtonGroup label="Smoking Allowed" name="isSmokingAllowed" />
              <ToggleButtonGroup label="Drinking Allowed" name="isDrinkingAllowed" />
            </div>
          </div>
        </div>

        {/* Contact & Utilities Info - More Compact */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Contact & Utilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            {/* Who Will Show the Property? */}
            <div>
              <p className="text-sm font-medium mb-1">Who Will Show the Property?</p>
              <div className="relative">
                <div 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 cursor-pointer text-sm"
                  onClick={() => setShowPersonOptionsOpen(!showPersonOptionsOpen)}
                >
                  {selectedShowPerson || "Select who will show the property"}
                </div>
                
                <DropdownOptions 
                  isOpen={showPersonOptionsOpen}
                  options={['Need help', 'I will show', 'Neighbours', 'Friends/Relatives', 'Security', 'Tenants', 'Others']}
                  onSelect={handleShowPersonSelect}
                />
              </div>
            </div>

            {/* Water Supply */}
            <div>
              <p className="text-sm font-medium mb-1">Water Supply</p>
              <div className="relative">
                <div 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 cursor-pointer text-sm"
                  onClick={() => setWaterSupplyOptionsOpen(!waterSupplyOptionsOpen)}
                >
                  {selectedWaterSupply || "Select water supply type"}
                </div>
                
                <DropdownOptions 
                  isOpen={waterSupplyOptionsOpen}
                  options={['Corporation', 'Borewell', 'Both']}
                  onSelect={handleWaterSupplySelect}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Directions Tip - More Compact */}
        {showDirectionsTip && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 relative">
            <button 
              type="button"
              className="absolute top-1 right-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              onClick={() => setShowDirectionsTip(false)}
            >
              ✕
            </button>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded-full text-blue-600 dark:text-blue-300 text-xs">
                💡
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Don't want calls asking location? Add directions to reach using landmarks.
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="text-xs p-0 h-auto text-blue-600 dark:text-blue-400 font-medium"
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
          <div className="grid gap-2">
            <label htmlFor="directions" className="text-sm font-medium">
              Directions to Property
            </label>
            <Textarea
              id="directions"
              placeholder="E.g., 'Located near Big Bazaar, take the 2nd right after ABC school...'"
              rows={2}
              className="text-sm"
              value={getField('directions', '')}
              onChange={(e) => saveField('directions', e.target.value)}
            />
          </div>
        )}

        {/* Description field - this maps to the "about" field in JSON */}
        <div className="grid gap-2">
          <label htmlFor="about" className="text-sm font-medium">
            Additional Details About Flatmate Requirements
          </label>
          <Textarea
            id="about"
            placeholder="Any specific requirements for flatmates, house rules, or additional information..."
            rows={3}
            className="text-sm"
            value={getField('about', '')}
            onChange={(e) => saveField('about', e.target.value)}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default FlatmateDetails;