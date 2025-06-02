// ✅ ADDED: Handle document selection (mandatory field)// src/modules/owner/components/property/wizard/sections/LandFeaturesDetails.tsx
// Version: 3.2.0
// Last Modified: 30-05-2025 22:45 IST
// Purpose: Fixed required field markings, validation, and added expectedPrice field

import React, { useEffect, useCallback, useState } from 'react';
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
  // Local state to ensure proper updates
  const [localState, setLocalState] = useState({
    distanceFromCity: '',
    distanceFromHighway: '',
    nearbyLandmarks: '',
    availableDocuments: [] as string[],
    nearbyDevelopments: [] as string[], // ✅ ADDED: Track nearby developments selections
    commercialFeatures: [] as string[]  // ✅ ADDED: Track commercial features selections
  });

  // ✅ FIXED: Initialize validation system with getFieldConfig
  const flowType = form.getValues('flow.flowType') || 'land_sale';
  const {
    validateField,
    getFieldValidation,
    shouldShowFieldError,
    markFieldAsTouched,
    isValid: stepIsValid,
    completionPercentage,
    requiredFields,
    getFieldConfig // ✅ ADDED: Missing function
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
    
    // ✅ Mark field as touched and validate
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
  
  // Get land type to conditionally display fields
  // ✅ FIXED: Updated to use propertyType instead of landType
  const landType = form.getValues('steps.land_sale_basic_details.propertyType') || '';
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

  // ✅ ADDED: Handle nearby developments selection (mandatory)
  const handleNearbyDevelopmentChange = (developmentType: string, checked: boolean) => {
    const currentDevelopments = localState.nearbyDevelopments || [];
    let newDevelopments;
    
    if (checked) {
      newDevelopments = [...currentDevelopments, developmentType];
    } else {
      newDevelopments = currentDevelopments.filter(dev => dev !== developmentType);
    }
    
    saveField('nearbyDevelopments', newDevelopments);
  };

  const isNearbyDevelopmentSelected = (developmentType: string) => {
    const developments = localState.nearbyDevelopments || [];
    return developments.includes(developmentType);
  };

  // ✅ ADDED: Handle commercial features selection (mandatory)
  const handleCommercialFeatureChange = (featureType: string, checked: boolean) => {
    const currentFeatures = localState.commercialFeatures || [];
    let newFeatures;
    
    if (checked) {
      newFeatures = [...currentFeatures, featureType];
    } else {
      newFeatures = currentFeatures.filter(feature => feature !== featureType);
    }
    
    saveField('commercialFeatures', newFeatures);
  };

  const isCommercialFeatureSelected = (featureType: string) => {
    const features = localState.commercialFeatures || [];
    return features.includes(featureType);
  };
  const handleDocumentChange = (documentType: string, checked: boolean) => {
    const currentDocs = localState.availableDocuments || [];
    let newDocs;
    
    if (checked) {
      newDocs = [...currentDocs, documentType];
    } else {
      newDocs = currentDocs.filter(doc => doc !== documentType);
    }
    
    saveField('availableDocuments', newDocs);
  };

  const isDocumentSelected = (documentType: string) => {
    const docs = localState.availableDocuments || [];
    return docs.includes(documentType);
  };
  
  return (
    <FormSection
      title="Land/Plot Features"
      description="Provide additional features and specifications for your land or plot"
    >
      {/* ✅ Progress indicator */}
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
        {/* ✅ UPDATED: Nearby Development Features - Now mandatory */}
        <div>
          <RequiredLabel 
            className="text-sm font-medium mb-3 block"
            required={getFieldConfig('nearbyDevelopments').required}
          >
            Nearby Developments
          </RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nearbySchool"
                checked={isNearbyDevelopmentSelected('nearbySchool')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbySchool', e.target.checked)}
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
                checked={isNearbyDevelopmentSelected('nearbyHospital')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbyHospital', e.target.checked)}
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
                checked={isNearbyDevelopmentSelected('nearbyMarket')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbyMarket', e.target.checked)}
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
                checked={isNearbyDevelopmentSelected('nearbyStation')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbyStation', e.target.checked)}
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
                checked={isNearbyDevelopmentSelected('nearbyAirport')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbyAirport', e.target.checked)}
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
                checked={isNearbyDevelopmentSelected('nearbyHighway')}
                onChange={(e) => handleNearbyDevelopmentChange('nearbyHighway', e.target.checked)}
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
          {/* ✅ ADDED: Validation error display for nearby developments */}
          {shouldShowFieldError('nearbyDevelopments') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('nearbyDevelopments').error}
            </p>
          )}
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
            <RequiredLabel 
              className="text-sm font-medium mb-3 block"
              required={getFieldConfig('commercialFeatures').required}
            >
              Commercial Plot Features
            </RequiredLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mainRoadFacing"
                  checked={isCommercialFeatureSelected('mainRoadFacing')}
                  onChange={(e) => handleCommercialFeatureChange('mainRoadFacing', e.target.checked)}
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
                  checked={isCommercialFeatureSelected('cornerCommercialPlot')}
                  onChange={(e) => handleCommercialFeatureChange('cornerCommercialPlot', e.target.checked)}
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
                  checked={isCommercialFeatureSelected('commercialComplex')}
                  onChange={(e) => handleCommercialFeatureChange('commercialComplex', e.target.checked)}
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
                  checked={isCommercialFeatureSelected('industrialZone')}
                  onChange={(e) => handleCommercialFeatureChange('industrialZone', e.target.checked)}
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
                  checked={isCommercialFeatureSelected('businessPark')}
                  onChange={(e) => handleCommercialFeatureChange('businessPark', e.target.checked)}
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
                  checked={isCommercialFeatureSelected('highFootfall')}
                  onChange={(e) => handleCommercialFeatureChange('highFootfall', e.target.checked)}
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
            {/* ✅ ADDED: Validation error display for commercial features */}
            {shouldShowFieldError('commercialFeatures') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('commercialFeatures').error}
              </p>
            )}
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
        
        {/* Distance from Key Landmarks - ✅ FIXED: Added required markings */}
        <div>
          <p className="text-sm font-medium mb-3">Distance from Key Locations</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel 
                htmlFor="distanceFromCity"
                required={getFieldConfig('distanceFromCity').required}
              >
                Distance from City Center
              </RequiredLabel>
              <div className="flex">
                <Input
                  id="distanceFromCity"
                  type="number"
                  placeholder="e.g., 5"
                  className="flex-1 rounded-r-none"
                  value={localState.distanceFromCity}
                  onChange={(e) => saveField('distanceFromCity', e.target.value)}
                />
                <div className="w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-md">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">km</span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel 
                htmlFor="distanceFromHighway"
                required={getFieldConfig('distanceFromHighway').required}
              >
                Distance from Highway
              </RequiredLabel>
              <div className="flex">
                <Input
                  id="distanceFromHighway"
                  type="number"
                  placeholder="e.g., 2"
                  className="flex-1 rounded-r-none"
                  value={localState.distanceFromHighway}
                  onChange={(e) => saveField('distanceFromHighway', e.target.value)}
                />
                <div className="w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-md">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ✅ UPDATED: Available Documents - Now mandatory with "No documents" option */}
        <div>
          <RequiredLabel 
            className="text-sm font-medium mb-3 block"
            required={getFieldConfig('availableDocuments').required}
          >
            Available Documents
          </RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="titleDeed"
                checked={isDocumentSelected('titleDeed')}
                onChange={(e) => handleDocumentChange('titleDeed', e.target.checked)}
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
                checked={isDocumentSelected('encumbranceCertificate')}
                onChange={(e) => handleDocumentChange('encumbranceCertificate', e.target.checked)}
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
                checked={isDocumentSelected('approvalLetters')}
                onChange={(e) => handleDocumentChange('approvalLetters', e.target.checked)}
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
                checked={isDocumentSelected('taxReceipts')}
                onChange={(e) => handleDocumentChange('taxReceipts', e.target.checked)}
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
                checked={isDocumentSelected('landSurveyReport')}
                onChange={(e) => handleDocumentChange('landSurveyReport', e.target.checked)}
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
                checked={isDocumentSelected('conversionOrder')}
                onChange={(e) => handleDocumentChange('conversionOrder', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="conversionOrder"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Conversion Order
              </label>
            </div>
            
            {/* ✅ ADDED: "No documents available" option - Fixed alignment */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="noDocuments"
                checked={isDocumentSelected('noDocuments')}
                onChange={(e) => {
                  if (e.target.checked) {
                    // If "No documents" is selected, clear all other documents
                    saveField('availableDocuments', ['noDocuments']);
                  } else {
                    // If unchecked, just remove it from the list
                    handleDocumentChange('noDocuments', false);
                  }
                }}
                className="w-5 h-5 rounded border-border text-orange-500 focus:ring-orange-500/20"
              />
              <label
                htmlFor="noDocuments"
                className="text-sm font-medium leading-none text-orange-700 dark:text-orange-400"
              >
                No documents available
              </label>
            </div>
          </div>
          {/* ✅ Validation error display for documents */}
          {shouldShowFieldError('availableDocuments') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('availableDocuments').error}
            </p>
          )}
        </div>
        
        {/* ✅ FIXED: Landmarks field - made optional, removed extra helper text */}
        <div className="grid gap-3">
          <RequiredLabel 
            htmlFor="nearbyLandmarks"
            required={getFieldConfig('nearbyLandmarks').required}
          >
            Nearby Landmarks
          </RequiredLabel>
          <Textarea
            id="nearbyLandmarks"
            placeholder="Describe important landmarks near your land/plot..."
            value={localState.nearbyLandmarks}
            onChange={(e) => saveField('nearbyLandmarks', e.target.value)}
            rows={3}
          />
          {/* ✅ Validation error display */}
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