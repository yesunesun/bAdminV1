// src/modules/owner/components/property/wizard/hooks/useFormDataChangeTracking.ts
// Version: 1.0.0
// Last Modified: 19-05-2025 11:15 IST
// Purpose: Debug hook to track what code is modifying form data

import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

export function useFormDataChangeTracking(form: UseFormReturn<FormData>) {
  const previousDataRef = useRef<FormData>({});
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return; // Only run in development
    }
    
    // List of old structure fields we want to track
    const oldStructureFields = ['basic_details', 'features', 'location', 'rental_details', 'sale_details'];
    
    // Subscribe to form changes
    const subscription = form.watch((value, { name, type }) => {
      // Get current full form data
      const currentData = form.getValues();
      
      // Check if any of the old structure fields have been added or modified
      oldStructureFields.forEach(field => {
        // Check if this field was just added or modified
        if (
          (currentData[field] && !previousDataRef.current[field]) || 
          (currentData[field] && 
           JSON.stringify(currentData[field]) !== JSON.stringify(previousDataRef.current[field]))
        ) {
          // Log the change with stack trace
          console.warn(`[FormDataDebug] Old structure field "${field}" was modified:`, {
            field,
            value: currentData[field],
            formChangeName: name,
            changeType: type,
            stackTrace: new Error().stack
          });
        }
      });
      
      // Update the previous data reference
      previousDataRef.current = {...currentData};
    });
    
    // Initial data
    previousDataRef.current = {...form.getValues()};
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  return null; // This hook doesn't return anything, it just tracks changes
}