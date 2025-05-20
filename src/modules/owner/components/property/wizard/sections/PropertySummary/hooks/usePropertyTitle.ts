// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyTitle.ts
// Version: 2.0.0
// Last Modified: 21-05-2025 15:45 IST
// Purpose: Simplified property title management hook that only uses flow.title and seeker's title generator

import { useState, useEffect, useCallback } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
// Import only the seeker's title generator
import { generatePropertyTitle } from '@/modules/seeker/utils/propertyTitleUtils';

export const usePropertyTitle = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string
) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Get property title and update state
  useEffect(() => {
    // First try to get existing title from flow.title
    const existingTitle = formData.flow?.title || '';
    
    if (existingTitle && existingTitle !== "New Property") {
      // If there's a valid existing title, use it
      setEditedTitle(existingTitle);
    } else {
      // If no valid title exists, generate a new one using the seeker's utility
      try {
        // Format formData to match the structure expected by the seeker's utility
        const propertyData = {
          property_details: formData,
          // Include any other needed fields
          address: formData.steps?.[stepIds.location || '']?.address || '',
          city: formData.steps?.[stepIds.location || '']?.city || '',
          locality: formData.steps?.[stepIds.location || '']?.locality || '',
          bedrooms: formData.steps?.[stepIds.basicDetails || '']?.bhkType?.replace('BHK', '').trim() || '',
        };
        
        // Generate a title using the seeker's generator
        const generatedTitle = generatePropertyTitle(propertyData);
        console.log('Generated title using seeker utility:', generatedTitle);
        
        // Update only flow.title
        if (formData.flow) {
          formData.flow.title = generatedTitle.trim();
        } else {
          formData.flow = { title: generatedTitle.trim() };
        }
        
        setEditedTitle(generatedTitle);
      } catch (error) {
        console.error('Error generating title with seeker utility:', error);
        // Set a generic title as fallback
        const fallbackTitle = 'New Property Listing';
        
        // Update only flow.title
        if (formData.flow) {
          formData.flow.title = fallbackTitle;
        } else {
          formData.flow = { title: fallbackTitle };
        }
        
        setEditedTitle(fallbackTitle);
      }
    }
  }, [formData, stepIds, flowType]);

  // Handle title edit completion
  const handleTitleEditComplete = useCallback(() => {
    if (editedTitle.trim()) {
      // Update only flow.title
      if (formData.flow) {
        formData.flow.title = editedTitle.trim();
      } else {
        formData.flow = { title: editedTitle.trim() };
      }
    }
    setIsEditingTitle(false);
  }, [editedTitle, formData]);

  // Handle keyboard events
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      const currentTitle = formData.flow?.title || '';
      setEditedTitle(currentTitle);
      setIsEditingTitle(false);
    }
  }, [formData, handleTitleEditComplete]);

  return {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  };
};