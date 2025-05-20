// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyTitle.ts
// Version: 1.3.0
// Last Modified: 20-05-2025 17:30 IST
// Purpose: Property title management hook with enhanced title generation and storage

import { useState, useEffect, useCallback } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
import { getPropertyTitle } from '../services/titleGenerator';
import { getFieldValue } from '../services/dataExtractor';
// Import seeker's more robust title generator
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
    // First try to get existing title from all possible locations
    const existingTitle = 
      getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title']) || 
      formData.flow?.title ||
      formData.title || 
      '';
    
    if (existingTitle && existingTitle !== "New Property") {
      // If there's a valid existing title, use it and ensure it's stored everywhere
      setEditedTitle(existingTitle);
      
      // Update in all necessary locations
      if (formData.steps?.[stepIds.basicDetails]) {
        formData.steps[stepIds.basicDetails].title = existingTitle.trim();
      }
      
      if (formData.flow) {
        formData.flow.title = existingTitle.trim();
      }
      
      formData.title = existingTitle.trim();
    } else {
      // If no valid title exists, generate a new one using the improved generator
      try {
        // Format formData to match the structure expected by the seeker's utility
        const propertyData = {
          property_details: formData,
          // Include any other needed fields
          address: getFieldValue(formData, stepIds.location || '', 'address', ['address']),
          city: getFieldValue(formData, stepIds.location || '', 'city', ['city']),
          locality: getFieldValue(formData, stepIds.location || '', 'locality', ['locality']),
          bedrooms: getFieldValue(formData, stepIds.basicDetails || '', 'bhkType', ['bhkType'])?.replace('BHK', '').trim(),
        };
        
        // Generate a title using the more robust generator
        const generatedTitle = generatePropertyTitle(propertyData);
        console.log('Generated title using seeker utility:', generatedTitle);
        
        // Update the form data with the new title in all locations
        if (formData.steps?.[stepIds.basicDetails]) {
          formData.steps[stepIds.basicDetails].title = generatedTitle.trim();
        }
        
        if (formData.flow) {
          formData.flow.title = generatedTitle.trim();
        }
        
        formData.title = generatedTitle.trim();
        
        setEditedTitle(generatedTitle);
      } catch (error) {
        console.error('Error generating title with advanced utility:', error);
        // Fallback to the original title generator
        const fallbackTitle = getPropertyTitle(formData, stepIds, flowType);
        setEditedTitle(fallbackTitle);
        
        // Update in all locations
        if (formData.steps?.[stepIds.basicDetails]) {
          formData.steps[stepIds.basicDetails].title = fallbackTitle.trim();
        }
        
        if (formData.flow) {
          formData.flow.title = fallbackTitle.trim();
        }
        
        formData.title = fallbackTitle.trim();
      }
    }
  }, [formData, stepIds, flowType]);

  // Handle title edit completion
  const handleTitleEditComplete = useCallback(() => {
    if (editedTitle.trim()) {
      if (formData.steps?.[stepIds.basicDetails]) {
        formData.steps[stepIds.basicDetails].title = editedTitle.trim();
      }
      
      if (formData.flow) {
        formData.flow.title = editedTitle.trim();
      }
      
      formData.title = editedTitle.trim();
    }
    setIsEditingTitle(false);
  }, [editedTitle, formData, stepIds]);

  // Handle keyboard events
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      const currentTitle = 
        getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title']) || 
        formData.flow?.title ||
        formData.title ||
        '';
      setEditedTitle(currentTitle);
      setIsEditingTitle(false);
    }
  }, [formData, stepIds, handleTitleEditComplete]);

  return {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  };
};