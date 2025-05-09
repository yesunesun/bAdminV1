// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 5.3.0
// Last Modified: 09-05-2025 18:00 IST
// Purpose: Comprehensive fix for incorrect listing type in Residential Sale flow

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { propertyService } from '../../../../services/propertyService';
import { autoFillService } from '../services/autoFillService';
import { FLOW_TYPES } from '../constants/flows';

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
   */
  const determineFlowType = (): { category: string, listingType: string } => {
    let category = 'residential';
    let listingType = 'rent';

    // 1. Check URL path first (highest priority)
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
      
      // Set listing type based on URL
      if (urlListingType.includes('sale') || urlListingType.includes('sell')) {
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
    
    // 2. Check form data fields (second priority)
    const formData = form.getValues();
    
    // Check explicit flow indicators in form data
    if (formData.flow_property_type) {
      const flowPropertyType = formData.flow_property_type.toLowerCase();
      if (flowPropertyType.includes('commercial')) {
        category = 'commercial';
      } else if (flowPropertyType.includes('land')) {
        category = 'land';
      }
    }
    
    if (formData.flow_listing_type) {
      const flowListingType = formData.flow_listing_type.toLowerCase();
      if (flowListingType.includes('sale') || flowListingType.includes('sell')) {
        listingType = 'sale';
      } else if (flowListingType.includes('rent')) {
        listingType = 'rent';
      } else if (flowListingType.includes('flatmate')) {
        listingType = 'flatmates';
      } else if (flowListingType.includes('pg') || flowListingType.includes('hostel')) {
        listingType = 'pghostel';
      } else if (flowListingType.includes('coworking')) {
        listingType = 'coworking';
      }
    }
    
    // 3. Check form data content indicators
    if (formData.expectedPrice && !formData.rentAmount) {
      listingType = 'sale';
    }
    
    if (formData.rentAmount && !formData.expectedPrice) {
      listingType = 'rent';
    }
    
    // 4. Check props passed to hook (third priority)
    if (isPGHostelMode) {
      listingType = 'pghostel';
    } else if (isSaleMode) {
      listingType = 'sale';
    }
    
    if (adType) {
      const adTypeLower = adType.toLowerCase();
      if (adTypeLower.includes('commercial')) {
        category = 'commercial';
      } else if (adTypeLower.includes('land') || adTypeLower.includes('plot')) {
        category = 'land';
      }
      
      if (adTypeLower.includes('sale') || adTypeLower.includes('sell')) {
        listingType = 'sale';
      } else if (adTypeLower.includes('rent')) {
        listingType = 'rent';
      } else if (adTypeLower.includes('flatmate')) {
        listingType = 'flatmates';
      } else if (adTypeLower.includes('pg') || adTypeLower.includes('hostel')) {
        listingType = 'pghostel';
      } else if (adTypeLower.includes('coworking')) {
        listingType = 'coworking';
      }
    }
    
    // Double-check for sale-specific fields as final check
    if (formData.steps?.sale && Object.keys(formData.steps.sale).length > 0) {
      listingType = 'sale';
    }
    
    console.log(`Final determined flow - Category: ${category}, ListingType: ${listingType}`);
    
    return { category, listingType };
  };

  /**
   * Prepare form data before saving
   */
  const prepareFormData = (): FormData => {
    // Get the current form data
    const formData = form.getValues();
    
    // Ensure the meta section exists
    if (!formData.meta) {
      formData.meta = {
        _version: 'v3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft'
      };
    } else {
      // Update the updated_at timestamp
      formData.meta.updated_at = new Date().toISOString();
    }
    
    // Determine correct flow type
    const { category, listingType } = determineFlowType();
    
    // Set or update flow section with determined values
    formData.flow = {
      category,
      listingType
    };
    
    // Force the proper listingType for the Sale flow
    if (isSaleMode || listingType === 'sale') {
      formData.flow.listingType = 'sale';
      formData.listingType = 'sale';
    }
    
    // Also set the listingType at the root level for backward compatibility
    formData.listingType = formData.flow.listingType;
    
    // Log final flow settings
    console.log(`Setting final flow data:`, {
      category: formData.flow.category,
      listingType: formData.flow.listingType
    });
    
    // Ensure steps section exists
    if (!formData.steps) {
      formData.steps = {};
    }
    
    // Ensure media section exists
    if (!formData.media) {
      formData.media = {
        photos: { images: [] },
        videos: { urls: [] }
      };
    } else if (!formData.media.videos) {
      formData.media.videos = { urls: [] };
    }
    
    return formData;
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
      
      // IMPORTANT: Log the final data structure before saving
      console.log('Saving property with flow.listingType:', formData.flow.listingType);
      
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
      
      // IMPORTANT: Log the final data structure before saving
      console.log('Publishing property with flow.listingType:', formData.flow.listingType);
      
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
      
      // IMPORTANT: Log the final data structure before saving
      console.log('Updating property with flow.listingType:', formData.flow.listingType);
      
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