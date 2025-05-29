// src/modules/owner/components/property/wizard/sections/LandFeaturesDetails.tsx
// Version: 3.1.0
// Last Modified: 30-05-2025 18:30 IST
// Purpose: Fixed JSX compilation error and added step completion validation system

import React, { useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStepValidation } from '../hooks/useStepValidation';
import { FormSectionProps } from '../types';

const LandFeaturesDetails: React.FC<FormSectionProps> = ({ 
  form,
  stepId = 'land_sale_land_features' // Default stepId for land features
}) => {
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
  
  // Get land type to conditionally display fields
  // This needs to be retrieved from the basic details step
  const landType = form.getValues('steps.land_sale_basic_details.landType') || '';
  const isResidential = landType === 'Residential Plot';
  const isCommercial = landType === 'Commercial Plot';
  const isAgricultural = landType === 'Agricultural Land';
  
  // Helper for checkbox fields
  const handleCheckboxChange = (fieldName: string, checked: boolean) => {
    saveField(fieldName, checked);
  };

  const isChecked = (fieldName: string) => {
    return getField(fieldName, false);
  };
  
  return (
    <FormSection
      title="Land/Plot Features"
      description="Provide additional features and specifications for your land or plot"
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
        {/* Nearby Development Features */}
        <div>
          <p className="text-sm font-medium mb-3">Nearby Developments</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbySchool"
                checked={isChecked('nearbySchool')}
                onChange={(e) => handleCheckboxChange('nearbySchool', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbySchool"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                School
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbyHospital"
                checked={isChecked('nearbyHospital')}
                onChange={(e) => handleCheckboxChange('nearbyHospital', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbyHospital"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hospital
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbyMarket"
                checked={isChecked('nearbyMarket')}
                onChange={(e) => handleCheckboxChange('nearbyMarket', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbyMarket"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Market/Mall
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbyStation"
                checked={isChecked('nearbyStation')}
                onChange={(e) => handleCheckboxChange('nearbyStation', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbyStation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Metro/Railway Station
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbyAirport"
                checked={isChecked('nearbyAirport')}
                onChange={(e) => handleCheckboxChange('nearbyAirport', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbyAirport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Airport
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbyHighway"
                checked={isChecked('nearbyHighway')}
                onChange={(e) => handleCheckboxChange('nearbyHighway', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="nearbyHighway"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Highway
              </label>
            </div>
          </div>
        </div>
        
        {/* Land/Plot Features - Based on type */}
        {isResidential && (
          <div>
            <p className="text-sm font-medium mb-3">Residential Plot Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gatedCommunity"
                  checked={isChecked('gatedCommunity')}
                  onChange={(e) => handleCheckboxChange('gatedCommunity', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="gatedCommunity"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gated Community
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cornerPlot"
                  checked={isChecked('cornerPlot')}
                  onChange={(e) => handleCheckboxChange('cornerPlot', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="cornerPlot"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Corner Plot
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parkFacing"
                  checked={isChecked('parkFacing')}
                  onChange={(e) => handleCheckboxChange('parkFacing', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="parkFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Park Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="eastFacing"
                  checked={isChecked('eastFacing')}
                  onChange={(e) => handleCheckboxChange('eastFacing', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="eastFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  East Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="waterConnection"
                  checked={isChecked('waterConnection')}
                  onChange={(e) => handleCheckboxChange('waterConnection', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="waterConnection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Water Connection
                </label>
              </div>
            
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sewerConnection"
                  checked={isChecked('sewerConnection')}
                  onChange={(e) => handleCheckboxChange('sewerConnection', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="sewerConnection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sewer Connection
                </label>
              </div>
            </div>
          </div>
        )}
        
        {isCommercial && (
          <div>
            <p className="text-sm font-medium mb-3">Commercial Plot Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mainRoadFacing"
                  checked={isChecked('mainRoadFacing')}
                  onChange={(e) => handleCheckboxChange('mainRoadFacing', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="mainRoadFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Main Road Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cornerCommercialPlot"
                  checked={isChecked('cornerCommercialPlot')}
                  onChange={(e) => handleCheckboxChange('cornerCommercialPlot', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="cornerCommercialPlot"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Corner Plot
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="commercialComplex"
                  checked={isChecked('commercialComplex')}
                  onChange={(e) => handleCheckboxChange('commercialComplex', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="commercialComplex"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Commercial Complex
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="industrialZone"
                  checked={isChecked('industrialZone')}
                  onChange={(e) => handleCheckboxChange('industrialZone', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="industrialZone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Industrial Zone
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="businessPark"
                  checked={isChecked('businessPark')}
                  onChange={(e) => handleCheckboxChange('businessPark', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="businessPark"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Business Park
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="highFootfall"
                  checked={isChecked('highFootfall')}
                  onChange={(e) => handleCheckboxChange('highFootfall', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="highFootfall"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  High Footfall Area
                </label>
              </div>
            </div>
          </div>
        )}
        
        {isAgricultural && (
          <div>
            <p className="text-sm font-medium mb-3">Agricultural Land Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="irrigationFacility"
                  checked={isChecked('irrigationFacility')}
                  onChange={(e) => handleCheckboxChange('irrigationFacility', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="irrigationFacility"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Irrigation Facility
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="farmHouse"
                  checked={isChecked('farmHouse')}
                  onChange={(e) => handleCheckboxChange('farmHouse', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="farmHouse"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Farm House
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="borewellTubewell"
                  checked={isChecked('borewellTubewell')}
                  onChange={(e) => handleCheckboxChange('borewellTubewell', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="borewellTubewell"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Borewell/Tubewell
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="organicFarming"
                  checked={isChecked('organicFarming')}
                  onChange={(e) => handleCheckboxChange('organicFarming', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="organicFarming"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Organic Farming
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="riverCanal"
                  checked={isChecked('riverCanal')}
                  onChange={(e) => handleCheckboxChange('riverCanal', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="riverCanal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  River/Canal Nearby
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Distance from Key Landmarks - Updated with km indicators */}
        <div>
          <p className="text-sm font-medium mb-3">Distance from Key Locations</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="distanceFromCity">
                Distance from City Center
              </RequiredLabel>
              <div className="flex">
                <Input
                  id="distanceFromCity"
                  type="number"
                  placeholder="e.g., 5"
                  className="flex-1 rounded-r-none"
                  value={getField('distanceFromCity', '')}
                  onChange={(e) => saveField('distanceFromCity', e.target.value)}
                />
                <div className="w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-md">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">km</span>
                </div>
              </div>
              {/* ✅ ADDED: Validation error display */}
              {shouldShowFieldError('distanceFromCity') && (
                <p className="text-sm text-red-600 mt-0.5">
                  {getFieldValidation('distanceFromCity').error}
                </p>
              )}
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="distanceFromHighway">
                Distance from Highway
              </RequiredLabel>
              <div className="flex">
                <Input
                  id="distanceFromHighway"
                  type="number"
                  placeholder="e.g., 2"
                  className="flex-1 rounded-r-none"
                  value={getField('distanceFromHighway', '')}
                  onChange={(e) => saveField('distanceFromHighway', e.target.value)}
                />
                <div className="w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-md">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">km</span>
                </div>
              </div>
              {/* ✅ ADDED: Validation error display */}
              {shouldShowFieldError('distanceFromHighway') && (
                <p className="text-sm text-red-600 mt-0.5">
                  {getFieldValidation('distanceFromHighway').error}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Property Documents */}
        <div>
          <p className="text-sm font-medium mb-3">Available Documents</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="titleDeed"
                checked={isChecked('titleDeed')}
                onChange={(e) => handleCheckboxChange('titleDeed', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="titleDeed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title Deed
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="encumbranceCertificate"
                checked={isChecked('encumbranceCertificate')}
                onChange={(e) => handleCheckboxChange('encumbranceCertificate', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="encumbranceCertificate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Encumbrance Certificate
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="approvalLetters"
                checked={isChecked('approvalLetters')}
                onChange={(e) => handleCheckboxChange('approvalLetters', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="approvalLetters"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Approval Letters
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="taxReceipts"
                checked={isChecked('taxReceipts')}
                onChange={(e) => handleCheckboxChange('taxReceipts', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="taxReceipts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tax Receipts
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="landSurveyReport"
                checked={isChecked('landSurveyReport')}
                onChange={(e) => handleCheckboxChange('landSurveyReport', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="landSurveyReport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Land Survey Report
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="conversionOrder"
                checked={isChecked('conversionOrder')}
                onChange={(e) => handleCheckboxChange('conversionOrder', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="conversionOrder"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Conversion Order
              </label>
            </div>
          </div>
        </div>
        
        {/* Landmarks and Important Places */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="nearbyLandmarks">
            Nearby Landmarks
          </RequiredLabel>
          <Textarea
            id="nearbyLandmarks"
            placeholder="Describe important landmarks near your land/plot..."
            value={getField('nearbyLandmarks', '')}
            onChange={(e) => saveField('nearbyLandmarks', e.target.value)}
            rows={3}
          />
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('nearbyLandmarks') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('nearbyLandmarks').error}
            </p>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default LandFeaturesDetails;