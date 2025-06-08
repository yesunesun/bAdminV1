// src/modules/owner/components/property/wizard/hooks/useFormDataChangeTracking.ts
// Version: 1.2.0
// Last Modified: 25-05-2025 18:15 IST
// Purpose: Fixed React hooks violations and undefined access errors

import { useEffect, useRef, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

export function useFormDataChangeTracking(form: UseFormReturn<FormData> | null) {
  const previousDataRef = useRef<FormData>({});
  const isInitializedRef = useRef(false);
  
  // FIXED: Memoize the old structure fields array to prevent re-creation
  const oldStructureFields = useRef(['basic_details', 'features', 'location', 'rental_details', 'sale_details']);
  
  // FIXED: Create a stable callback for handling form changes with comprehensive safety checks
  const handleFormChange = useCallback((value: any, info?: { name?: string; type?: string }) => {
    // CRITICAL SAFETY CHECKS - prevent all undefined access errors
    if (!form || typeof form.getValues !== 'function') {
      console.warn('[useFormDataChangeTracking] Form not available or getValues method missing');
      return;
    }
    
    try {
      // Get current full form data with safety check
      const currentData = form.getValues();
      
      // FIXED: Ensure currentData is valid before processing
      if (!currentData || typeof currentData !== 'object') {
        console.warn('[useFormDataChangeTracking] Form data is not available or invalid');
        return;
      }
      
      // FIXED: Ensure oldStructureFields.current exists and is an array before using forEach
      if (!oldStructureFields.current || !Array.isArray(oldStructureFields.current)) {
        console.warn('[useFormDataChangeTracking] oldStructureFields is not available');
        return;
      }
      
      // Check if any of the old structure fields have been added or modified
      oldStructureFields.current.forEach(field => {
        // FIXED: Add safety checks before accessing properties
        if (!field || typeof field !== 'string') {
          return;
        }
        
        try {
          // Check if this field was just added or modified
          const currentFieldValue = currentData[field];
          const previousFieldValue = previousDataRef.current ? previousDataRef.current[field] : undefined;
          
          if (
            (currentFieldValue && !previousFieldValue) || 
            (currentFieldValue && 
             JSON.stringify(currentFieldValue) !== JSON.stringify(previousFieldValue))
          ) {
            // Log the change with stack trace
            console.warn(`[FormDataDebug] Old structure field "${field}" was modified:`, {
              field,
              value: currentFieldValue,
              formChangeName: info?.name,
              changeType: info?.type,
              stackTrace: new Error().stack
            });
          }
        } catch (fieldError) {
          console.error(`[useFormDataChangeTracking] Error checking field "${field}":`, fieldError);
        }
      });
      
      // FIXED: Safely update the previous data reference
      if (currentData && typeof currentData === 'object') {
        previousDataRef.current = {...currentData};
      }
    } catch (error) {
      console.error('[useFormDataChangeTracking] Error in form data change tracking:', error);
    }
  }, [form]);
  
  // FIXED: Use consistent useEffect with stable dependencies and comprehensive error handling
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    // CRITICAL SAFETY CHECK - ensure form exists and has required methods
    if (!form || typeof form.watch !== 'function' || typeof form.getValues !== 'function') {
      console.warn('[useFormDataChangeTracking] Form is not available or missing required methods');
      return;
    }
    
    let subscription: any = null;
    
    try {
      // FIXED: Subscribe to form changes with proper error handling
      subscription = form.watch(handleFormChange);
      
      // FIXED: Initialize previous data only once with safety checks
      if (!isInitializedRef.current) {
        try {
          const initialData = form.getValues();
          if (initialData && typeof initialData === 'object') {
            previousDataRef.current = {...initialData};
            isInitializedRef.current = true;
          }
        } catch (initError) {
          console.error('[useFormDataChangeTracking] Error initializing previous data:', initError);
        }
      }
    } catch (error) {
      console.error('[useFormDataChangeTracking] Error setting up form data change tracking:', error);
    }
    
    // FIXED: Enhanced cleanup function with proper error handling
    return () => {
      if (subscription) {
        try {
          // Check if subscription has unsubscribe method
          if (typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          } else if (typeof subscription === 'function') {
            // Some versions of react-hook-form return a function directly
            subscription();
          }
        } catch (cleanupError) {
          console.error('[useFormDataChangeTracking] Error during cleanup:', cleanupError);
        }
      }
    };
  }, [form, handleFormChange]); // FIXED: Stable dependency array
  
  // This hook doesn't return anything, it just tracks changes
  return null;
}