// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyTitle.ts
// Version: 3.0.0
// Last Modified: 25-05-2025 14:30 IST
// Purpose: Enhanced property title management hook with better integration of seeker's utility

import { useState, useEffect, useCallback } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
import { generatePropertyTitle, cleanupPropertyTitle } from '@/modules/seeker/utils/propertyTitleUtils';

export const usePropertyTitle = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string
) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Helper function to format formData for seeker's utility
  const formatPropertyDataForTitleGeneration = useCallback((formData: FormData, stepIds: StepIds) => {
    const locationStep = formData.steps?.[stepIds.location || ''];
    const basicDetailsStep = formData.steps?.[stepIds.basicDetails || ''];
    const rentalStep = formData.steps?.[stepIds.rental || ''];
    const saleStep = formData.steps?.[stepIds.saleDetails || ''];

    return {
      property_details: formData,
      // Address and location information
      address: locationStep?.address || '',
      city: locationStep?.city || locationStep?.selectedCity || '',
      locality: locationStep?.locality || locationStep?.selectedLocality || '',
      // Property type and size information
      bedrooms: basicDetailsStep?.bhkType?.replace('BHK', '').trim() || '',
      property_type: basicDetailsStep?.propertyType || '',
      // Pricing information for flow detection
      price: rentalStep?.rent || saleStep?.price || rentalStep?.totalRent || 0,
      listing_type: formData.flow?.listingType || (saleStep ? 'sale' : 'rent'),
      // Additional context
      title: formData.flow?.title || ''
    };
  }, []);

  // Generate or update property title
  const generateTitle = useCallback(() => {
    try {
      // Format data for the utility
      const propertyData = formatPropertyDataForTitleGeneration(formData, stepIds);
      
      console.log('Formatted property data for title generation:', propertyData);
      
      // Check if we have an existing title that might need cleanup
      if (propertyData.title && propertyData.title !== "New Property") {
        // Use cleanup function to improve existing title
        const cleanedTitle = cleanupPropertyTitle(propertyData);
        console.log('Cleaned up existing title:', cleanedTitle);
        return cleanedTitle;
      } else {
        // Generate a completely new title
        const generatedTitle = generatePropertyTitle(propertyData);
        console.log('Generated new title:', generatedTitle);
        return generatedTitle;
      }
    } catch (error) {
      console.error('Error generating/cleaning title with seeker utility:', error);
      // Return a safe fallback title
      return 'Property Listing';
    }
  }, [formData, stepIds, formatPropertyDataForTitleGeneration]);

  // Initialize and update title when dependencies change
  useEffect(() => {
    if (!formData) return;
    
    // Generate the best possible title
    const newTitle = generateTitle();
    
    // Update the form data's flow.title
    if (formData.flow) {
      formData.flow.title = newTitle;
    } else {
      formData.flow = { title: newTitle };
    }
    
    // Update local state
    setEditedTitle(newTitle);
    
    console.log('Title updated in usePropertyTitle:', newTitle);
  }, [formData, stepIds, flowType, generateTitle]);

  // Handle title edit completion
  const handleTitleEditComplete = useCallback(() => {
    if (editedTitle.trim()) {
      // Update the form data
      if (formData.flow) {
        formData.flow.title = editedTitle.trim();
      } else {
        formData.flow = { title: editedTitle.trim() };
      }
      
      console.log('Title manually updated:', editedTitle.trim());
    }
    setIsEditingTitle(false);
  }, [editedTitle, formData]);

  // Handle keyboard events for title editing
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      // Reset to current saved title
      const currentTitle = formData.flow?.title || '';
      setEditedTitle(currentTitle);
      setIsEditingTitle(false);
    }
  }, [formData, handleTitleEditComplete]);

  // Function to regenerate title (can be called manually)
  const regenerateTitle = useCallback(() => {
    const newTitle = generateTitle();
    
    // Update form data
    if (formData.flow) {
      formData.flow.title = newTitle;
    } else {
      formData.flow = { title: newTitle };
    }
    
    // Update local state
    setEditedTitle(newTitle);
    
    console.log('Title regenerated:', newTitle);
    return newTitle;
  }, [generateTitle, formData]);

  return {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown,
    regenerateTitle,
    currentTitle: formData.flow?.title || editedTitle || 'Property Listing'
  };
};