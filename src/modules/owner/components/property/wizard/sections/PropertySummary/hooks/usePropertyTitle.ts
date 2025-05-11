// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyTitle.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:40 IST
// Purpose: Property title management hook

import { useState, useEffect, useCallback } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
import { getPropertyTitle } from '../services/titleGenerator';
import { getFieldValue } from '../services/dataExtractor';

export const usePropertyTitle = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string
) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Get property title and update state
  useEffect(() => {
    const title = getPropertyTitle(formData, stepIds, flowType);
    setEditedTitle(title);
  }, [formData, stepIds, flowType]);

  // Handle title edit completion
  const handleTitleEditComplete = useCallback(() => {
    if (editedTitle.trim()) {
      if (formData.steps?.[stepIds.basicDetails]) {
        formData.steps[stepIds.basicDetails].title = editedTitle.trim();
      } else {
        formData.title = editedTitle.trim();
      }
    }
    setIsEditingTitle(false);
  }, [editedTitle, formData, stepIds]);

  // Handle keyboard events
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      const currentTitle = getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title']) || '';
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