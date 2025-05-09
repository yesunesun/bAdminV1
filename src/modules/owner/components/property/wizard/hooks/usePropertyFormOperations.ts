// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 6.4.0
// Last Modified: 12-05-2025 14:00 IST
// Purpose: Enhanced location data handling for all flows

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { propertyService } from '../../../../services/propertyService';
import { autoFillService } from '../services/autoFillService';
import { FLOW_TYPES, FLOW_STEPS, STEP_FIELD_MAPPINGS } from '../constants/flows';

interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any;
  mode: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string) => void;
  handleNextStep?: () => void;
}

export function usePropertyFormOperations({
  form,
  user,
  mode,
  existingPropertyId,
  adType,
  isSaleMode,
  isPGHostelMode,
  status,
  setStatus,
  setSavedPropertyId,
  setSaving,
  setError,
  handleNextStep
}: UsePropertyFormOperationsProps) {
  const navigate = useNavigate();
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  /**
   * Determine the correct flow type from various sources
   * Enhanced to prioritize sale flow detection
   */
  const determineFlowType = (): { flowKey: string, category: string, listingType: string } => {
    let category = 'residential';
    let listingType = 'rent';

    // First check for explicit sale mode prop
    if (isSaleMode) {
      console.log('Sale mode detected via props');
      listingType = 'sale';
    }
    
    // Check URL path (highest priority)
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 3) {
      const urlCategory = pathParts[pathParts.length - 3].toLowerCase();
      const urlListingType = pathParts[pathParts.length - 2].toLowerCase();
      
      console.log(`URL path flow info - Category: ${urlCategory}, ListingType: ${urlListingType}`);
      
      // Set category based on URL
      if (urlCategory.includes('commercial')) {
        category = 'commercial';
      } else if (urlCategory.includes('land') || urlCategory.includes('plot')) {
        category = 'land';
      }
      
      // Set listing type based on URL (with special emphasis on sale detection)
      if (urlListingType.includes('sale') || urlListingType.includes('sell')) {
        console.log('Sale mode detected via URL path');
        listingType = 'sale';
      } else if (urlListingType.includes('rent')) {
        listingType = 'rent';
      } else if (urlListingType.includes('flatmate')) {
        listingType = 'flatmates';
      } else if (urlListingType.includes('pg') || urlListingType.includes('hostel')) {
        listingType = 'pghostel';
      } else if (urlListingType.includes('coworking') || urlListingType.includes('co-working')) {
        listingType = 'coworking';
      }
    }
    
    // Check form data fields - look specifically for sale flow indicators
    const formData = form.getValues();
    
    // Look for explicit sale indicators in form data
    if (formData.flow?.listingType === 'sale' || 
        (formData.flow?.listingType || '').toLowerCase().includes('sale') || 
        (formData.flow?.listingType || '').toLowerCase().includes('sell')) {
      console.log('Sale mode detected via form flow.listingType');
      listingType = 'sale';
    }
    
    // Look for sale-specific fields across various locations in the form data
    if (formData.steps?.sale && Object.keys(formData.steps.sale).length > 0) {
      console.log('Sale mode detected via steps.sale');
      listingType = 'sale';
    }
    
    if (formData.sale && Object.keys(formData.sale).length > 0) {
      console.log('Sale mode detected via root sale object');
      listingType = 'sale';
    }
    
    if (formData.expectedPrice || 
        formData.steps?.sale?.expectedPrice || 
        formData.sale?.expectedPrice || 
        formData.details?.saleInfo?.expectedPrice) {
      console.log('Sale mode detected via expectedPrice field');
      listingType = 'sale';
    }
    
    // If adType parameter includes 'sale', it's definitely sale
    if (adType) {
      const adTypeLower = adType.toLowerCase();
      
      if (adTypeLower.includes('sale') || adTypeLower.includes('sell')) {
        console.log('Sale mode detected via adType parameter');
        listingType = 'sale';
      }
      
      if (adTypeLower.includes('commercial')) {
        category = 'commercial';
      } else if (adTypeLower.includes('land') || adTypeLower.includes('plot')) {
        category = 'land';
      }
    }
    
    // Final check - always set to sale if isSaleMode prop is true (highest priority)
    if (isSaleMode) {
      console.log('Final override: Sale mode forced via isSaleMode prop');
      listingType = 'sale';
    }
    
    const flowKey = `${category}_${listingType}`;
    console.log(`Final determined flow - Category: ${category}, ListingType: ${listingType}, FlowKey: ${flowKey}`);
    
    return { flowKey, category, listingType };
  };

  /**
   * Prepare form data before saving - Enhanced with better location and sale handling
   */
  const prepareFormData = (): FormData => {
    // Get the current form data
    const rawFormData = form.getValues();
    console.log('Raw form data:', JSON.stringify(rawFormData, null, 2));
    
    // Determine correct flow type
    const { flowKey, category, listingType } = determineFlowType();
    
    // Is this a sale flow?
    const isSale = listingType === 'sale';
    if (isSale) {
      console.log('Preparing data for SALE flow');
    }
    
    // Get the steps for this flow
    const flowSteps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
    
    // Create the output structure with base sections
    const output: any = {
      meta: {
        _version: 'v3',
        created_at: rawFormData.meta?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: rawFormData.meta?.status || 'draft',
        id: rawFormData.meta?.id,
        owner_id: rawFormData.meta?.owner_id || user?.id
      },
      flow: {
        category,
        listingType
      },
      media: rawFormData.media || {
        photos: { images: [] },
        videos: { urls: [] }
      }
    };
    
    // Process each step in the flow
    flowSteps.forEach(step => {
      if (step === 'review') return; // Skip review step
      
      if (step === 'basic_details') {
        // Map basic_details to details
        output.details = {};
        
        // Get data from the steps container first
        if (rawFormData.steps?.basic_details) {
          output.details = { ...rawFormData.steps.basic_details };
          console.log('Found details data in steps.basic_details', rawFormData.steps.basic_details);
        }
        
        // Check for details at root level
        if (rawFormData.basic_details) {
          output.details = { ...output.details, ...rawFormData.basic_details };
          console.log('Found details at root level', rawFormData.basic_details);
        }
        
        // Check for legacy details structure
        if (rawFormData.details?.basicDetails) {
          output.details = { ...output.details, ...rawFormData.details.basicDetails };
          console.log('Found details in details.basicDetails', rawFormData.details.basicDetails);
        }
        
        // Look for individual basic details fields directly on the form
        const basicDetailsFields = [
          'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 
          'builtUpArea', 'builtUpAreaUnit', 'bathrooms', 'balconies', 
          'facing', 'propertyAge', 'propertyCondition', 'hasBalcony', 'hasAC'
        ];
        
        basicDetailsFields.forEach(field => {
          if (rawFormData[field] !== undefined) {
            output.details[field] = rawFormData[field];
            console.log(`Found basic detail field ${field} at root level:`, rawFormData[field]);
          }
        });
      } 
      else if (step === 'location') {
        // Map location data
        output.location = {};
        
        // Get data from the steps container first
        if (rawFormData.steps?.location) {
          output.location = { ...rawFormData.steps.location };
          console.log('Found location data in steps.location', rawFormData.steps.location);
        }
        
        // Check for location data at root level
        if (rawFormData.location) {
          output.location = { ...output.location, ...rawFormData.location };
          console.log('Found location data at root level', rawFormData.location);
        }
        
        // Check for legacy location structure
        if (rawFormData.details?.location) {
          output.location = { ...output.location, ...rawFormData.details.location };
          console.log('Found location data in details.location', rawFormData.details.location);
        }
        
        // Look for individual location fields directly on the form
        const locationFields = [
          'address', 'flatPlotNo', 'landmark', 'locality', 'area', 
          'city', 'district', 'state', 'pinCode'
        ];
        
        locationFields.forEach(field => {
          if (rawFormData[field] !== undefined) {
            output.location[field] = rawFormData[field];
            console.log(`Found location field ${field} at root level:`, rawFormData[field]);
          }
        });
        
        // Handle coordinates separately since it's a nested object
        if (rawFormData.coordinates) {
          output.location.coordinates = rawFormData.coordinates;
          console.log('Found coordinates at root level', rawFormData.coordinates);
        } else if (rawFormData.latitude !== undefined && rawFormData.longitude !== undefined) {
          output.location.coordinates = {
            latitude: rawFormData.latitude,
            longitude: rawFormData.longitude
          };
          console.log('Created coordinates from latitude/longitude fields', output.location.coordinates);
        }
        
        // Check if coordinates were stored in a flat structure in location
        if (rawFormData.location?.latitude !== undefined && rawFormData.location?.longitude !== undefined) {
          output.location.coordinates = {
            latitude: rawFormData.location.latitude,
            longitude: rawFormData.location.longitude
          };
          console.log('Created coordinates from location.latitude/longitude', output.location.coordinates);
        }
        
        // If location is still empty, check for common address fields anywhere in the form data
        if (Object.keys(output.location).length === 0) {
          // Deep search for any field that might contain location data
          Object.keys(rawFormData).forEach(key => {
            if (typeof rawFormData[key] === 'object' && rawFormData[key] !== null) {
              // Check if this object has location-like fields
              const obj = rawFormData[key];
              if (obj.address || obj.city || obj.state || obj.pinCode) {
                console.log(`Found possible location data in ${key}`, obj);
                locationFields.forEach(field => {
                  if (obj[field] !== undefined) {
                    output.location[field] = obj[field];
                  }
                });
              }
              
              // Check for nested coordinates
              if (obj.coordinates || (obj.latitude !== undefined && obj.longitude !== undefined)) {
                console.log(`Found possible coordinates in ${key}`, obj);
                if (obj.coordinates) {
                  output.location.coordinates = obj.coordinates;
                } else {
                  output.location.coordinates = {
                    latitude: obj.latitude,
                    longitude: obj.longitude
                  };
                }
              }
            }
          });
        }
        
        // If location is still empty, set some defaults to prevent API issues
        if (Object.keys(output.location).length === 0) {
          console.log('No location data found, setting defaults');
          output.location = {
            address: '',
            city: '',
            state: '',
            pinCode: '',
            coordinates: {
              latitude: null,
              longitude: null
            }
          };
        }
      } 
      else if (step === 'sale' && isSale) {
        // Special handling for sale step data
        output.sale = {};
        
        // Get data from the steps container first
        if (rawFormData.steps?.sale) {
          output.sale = { ...rawFormData.steps.sale };
          console.log('Found sale data in steps.sale', rawFormData.steps.sale);
        }
        
        // Check for sale data in other locations
        if (rawFormData.sale) {
          output.sale = { ...output.sale, ...rawFormData.sale };
          console.log('Found sale data at root level', rawFormData.sale);
        }
        
        // Check for sale data in legacy locations
        if (rawFormData.details?.saleInfo) {
          output.sale = { ...output.sale, ...rawFormData.details.saleInfo };
          console.log('Found sale data in details.saleInfo', rawFormData.details.saleInfo);
        }
        
        // Look for individual sale fields directly on the form
        const saleFields = [
          'expectedPrice', 'priceNegotiable', 'possessionDate', 
          'hasSimilarUnits', 'propertyShowOption', 'propertyShowPerson', 
          'secondaryNumber', 'secondaryContactNumber'
        ];
        
        saleFields.forEach(field => {
          if (rawFormData[field] !== undefined) {
            output.sale[field] = rawFormData[field];
            console.log(`Found sale field ${field} at root level:`, rawFormData[field]);
          }
        });
        
        // Ensure critical sale fields have a default value
        if (output.sale.expectedPrice === undefined) {
          console.log('Setting default expectedPrice to 0');
          output.sale.expectedPrice = 0;
        }
        
        if (output.sale.priceNegotiable === undefined) {
          console.log('Setting default priceNegotiable to false');
          output.sale.priceNegotiable = false;
        }
      }
      else if (step === 'rental' && !isSale) {
        // Handle rental step data
        output.rental = {};
        
        // Get data from the steps container first
        if (rawFormData.steps?.rental) {
          output.rental = { ...rawFormData.steps.rental };
          console.log('Found rental data in steps.rental', rawFormData.steps.rental);
        }
        
        // Check for rental data in other locations
        if (rawFormData.rental) {
          output.rental = { ...output.rental, ...rawFormData.rental };
          console.log('Found rental data at root level', rawFormData.rental);
        }
        
        // Check for rental data in legacy locations
        if (rawFormData.details?.rentalInfo) {
          output.rental = { ...output.rental, ...rawFormData.details.rentalInfo };
          console.log('Found rental data in details.rentalInfo', rawFormData.details.rentalInfo);
        }
        
        // Look for individual rental fields directly on the form
        const rentalFields = [
          'rentAmount', 'securityDeposit', 'maintenanceCharges', 
          'rentNegotiable', 'availableFrom', 'preferredTenants', 
          'leaseDuration', 'furnishingStatus', 'hasSimilarUnits', 
          'propertyShowOption', 'propertyShowPerson', 'secondaryNumber'
        ];
        
        rentalFields.forEach(field => {
          if (rawFormData[field] !== undefined) {
            output.rental[field] = rawFormData[field];
            console.log(`Found rental field ${field} at root level:`, rawFormData[field]);
          }
        });
      }
      else {
        // Handle all other flow-specific steps (flatmate_details, pg_details, etc.)
        output[step] = {};
        
        // Get data from the steps container first
        if (rawFormData.steps?.[step]) {
          output[step] = { ...rawFormData.steps[step] };
          console.log(`Found ${step} data in steps.${step}`, rawFormData.steps[step]);
        }
        
        // Also check for data at the root level
        if (rawFormData[step]) {
          output[step] = { ...output[step], ...rawFormData[step] };
          console.log(`Found ${step} data at root level`, rawFormData[step]);
        }
      }
    });
    
    // Process features separately since it's common across many flows
    if (flowSteps.includes('features')) {
      output.features = {};
      if (rawFormData.steps?.features) {
        output.features = { ...rawFormData.steps.features };
        console.log('Found features data in steps.features', rawFormData.steps.features);
      } else if (rawFormData.features) {
        output.features = { ...rawFormData.features };
        console.log('Found features data at root level', rawFormData.features);
      } else if (rawFormData.details?.features) {
        output.features = { ...rawFormData.details.features };
        console.log('Found features data in details.features', rawFormData.details.features);
      }
      
      // Check for individual feature fields at the root level
      const featureFields = [
        'amenities', 'parking', 'petFriendly', 'nonVegAllowed', 'waterSupply',
        'powerBackup', 'gatedSecurity', 'description', 'isSmokingAllowed',
        'isDrinkingAllowed', 'hasAttachedBathroom'
      ];
      
      featureFields.forEach(field => {
        if (rawFormData[field] !== undefined) {
          output.features[field] = rawFormData[field];
          console.log(`Found feature field ${field} at root level:`, rawFormData[field]);
        }
      });
    }
    
    // For sale flows, make sure common fields belong to the right section
    if (isSale) {
      // Move fields that should be in 'sale' section from 'features'
      const saleSpecificFields = [
        'hasSimilarUnits', 'propertyShowOption', 'propertyShowPerson'
      ];
      
      saleSpecificFields.forEach(field => {
        if (output.features?.[field] !== undefined) {
          if (!output.sale) output.sale = {};
          output.sale[field] = output.features[field];
          delete output.features[field];
          console.log(`Moved ${field} from features to sale section`);
        }
      });
    }
    
    // Log the final output structure for debugging
    console.log('Final structured output:', JSON.stringify(output, null, 2));
    
    return output as FormData;
  };

  /**
   * Save the property as a draft
   */
  const handleSaveAsDraft = async (): Promise<string> => {
    try {
      setLastOperation('saveAsDraft');
      setSaving(true);
      setError('');
      
      // Check if user is logged in
      if (!user || !user.id) {
        throw new Error('You need to be logged in to save a property');
      }
      
      const formData = prepareFormData();
      
      // Set status as draft
      formData.meta.status = 'draft';
      
      // Save the property
      let result;
      
      if (mode === 'create' || !existingPropertyId) {
        console.log('Creating new property as draft');
        result = await propertyService.createProperty(formData, user.id, 'draft');
      } else {
        console.log('Updating existing property as draft');
        result = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'draft');
      }
      
      // Set the status and saved property ID
      setStatus('draft');
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property saved successfully with ID:', result.id);
      }
      
      if (handleNextStep) {
        handleNextStep();
      }
      
      return result.id;
    } catch (error) {
      console.error('Error saving property as draft:', error);
      setError('Failed to save property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save the property and publish it
   */
  const handleSaveAndPublish = async (): Promise<string> => {
    try {
      setLastOperation('saveAndPublish');
      setSaving(true);
      setError('');
      
      // Check if user is logged in
      if (!user || !user.id) {
        throw new Error('You need to be logged in to publish a property');
      }
      
      const formData = prepareFormData();
      
      // Set status as published
      formData.meta.status = 'published';
      
      // Save the property
      let result;
      
      if (mode === 'create' || !existingPropertyId) {
        console.log('Creating new property as published');
        result = await propertyService.createProperty(formData, user.id, 'published');
      } else {
        console.log('Updating existing property as published');
        result = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'published');
      }
      
      // Set the status and saved property ID
      setStatus('published');
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property published successfully with ID:', result.id);
        
        // Navigate to the property details page after publishing
        setTimeout(() => {
          navigate(`/properties/${result.id}`);
        }, 1000);
      }
      
      return result.id;
    } catch (error) {
      console.error('Error publishing property:', error);
      setError('Failed to publish property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update an existing property
   */
  const handleUpdate = async (): Promise<string> => {
    try {
      setLastOperation('update');
      setSaving(true);
      setError('');
      
      // Check if user is logged in and property ID exists
      if (!user || !user.id) {
        throw new Error('You need to be logged in to update a property');
      }
      
      if (!existingPropertyId) {
        throw new Error('No property ID found for update');
      }
      
      const formData = prepareFormData();
      
      // Keep the current status
      formData.meta.status = status;
      
      // Update the property
      console.log('Updating existing property');
      const result = await propertyService.updateProperty(existingPropertyId, formData, user.id);
      
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property updated successfully with ID:', result.id);
      }
      
      return result.id;
    } catch (error) {
      console.error('Error updating property:', error);
      setError('Failed to update property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    lastOperation
  };
}