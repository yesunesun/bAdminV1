// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 9.2.0
// Last Modified: 25-05-2025 18:15 IST
// Purpose: Fixed React hooks violations by ensuring consistent return values and stable hooks order

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation } from 'react-router-dom';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { FLOW_TYPES } from '../constants/flows';

// Import JSON templates
import residentialRentTemplate from '../templates/residential_rent.json';
import residentialSaleTemplate from '../templates/residential_sale.json';
import residentialPGHostelTemplate from '../templates/residential_pghostel.json';
import residentialFlatmatesTemplate from '../templates/residential_flatmates.json';
import commercialRentTemplate from '../templates/commercial_rent.json';
import commercialSaleTemplate from '../templates/commercial_sale.json';
import commercialCoworkingTemplate from '../templates/commercial_coworking.json';
import landSaleTemplate from '../templates/land_sale.json';

// Template lookup by flow type
const FLOW_TEMPLATES = {
  [FLOW_TYPES.RESIDENTIAL_RENT]: residentialRentTemplate,
  [FLOW_TYPES.RESIDENTIAL_SALE]: residentialSaleTemplate,
  [FLOW_TYPES.RESIDENTIAL_PGHOSTEL]: residentialPGHostelTemplate,
  [FLOW_TYPES.RESIDENTIAL_FLATMATES]: residentialFlatmatesTemplate,
  [FLOW_TYPES.COMMERCIAL_RENT]: commercialRentTemplate,
  [FLOW_TYPES.COMMERCIAL_SALE]: commercialSaleTemplate,
  [FLOW_TYPES.COMMERCIAL_COWORKING]: commercialCoworkingTemplate,
  [FLOW_TYPES.LAND_SALE]: landSaleTemplate
};

interface UsePropertyFormStateProps {
  initialData?: FormData;
  propertyCategory?: string;
  adType?: string;
  city?: string;
  existingPropertyId?: string;
  initialStatus?: 'draft' | 'published';
  mode?: 'create'; // Only create mode supported
}

export function usePropertyFormState({
  initialData,
  propertyCategory,
  adType,
  city,
  existingPropertyId,
  initialStatus = 'draft',
  mode = 'create'
}: UsePropertyFormStateProps) {
  const { category, type } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // FIXED: Always initialize all state hooks in the same order
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);
  const [isFormReady, setIsFormReady] = useState(false);
  const [isPGHostelMode, setIsPGHostelMode] = useState(false);
  const [hasValidFlow, setHasValidFlow] = useState(true);

  // Get the current URL path for flow detection
  const currentPath = location.pathname;
  
  // Log current parameters for debugging
  console.log('[usePropertyFormState] Initialized with:', {
    propertyCategory,
    adType,
    category,
    type,
    path: currentPath,
    initialData: initialData ? 'Present' : 'None',
    mode
  });

  // FIXED: Determine the flow type - now always returns a valid flow type (never null)
  const flowType = useMemo(() => {
    // Extract path segments to determine flow type
    const pathSegments = currentPath.toLowerCase().split('/');
    console.log('[usePropertyFormState] Path segments:', pathSegments);
    
    // Look for category and type in URL path segments
    let urlCategory = '';
    let urlType = '';
    
    // Look for patterns like /residential/sale/ or /properties/list/residential/sale/
    for (let i = 0; i < pathSegments.length - 1; i++) {
      const segment = pathSegments[i];
      if (
        segment === 'residential' || 
        segment === 'commercial' || 
        segment === 'land'
      ) {
        urlCategory = segment;
        // Next segment should be the type
        if (i + 1 < pathSegments.length) {
          urlType = pathSegments[i + 1];
        }
        break;
      }
    }
    
    console.log('[usePropertyFormState] Detected from URL path:', { urlCategory, urlType });
    
    // If we found category and type in URL, use them
    if (urlCategory && urlType) {
      if (urlCategory === 'residential') {
        if (urlType.includes('sale') || urlType.includes('sell')) {
          console.log('[usePropertyFormState] Detected residential sale from URL');
          return FLOW_TYPES.RESIDENTIAL_SALE;
        }
        if (urlType.includes('flatmate')) {
          console.log('[usePropertyFormState] Detected flatmates from URL');
          return FLOW_TYPES.RESIDENTIAL_FLATMATES;
        }
        if (urlType.includes('pg') || urlType.includes('hostel')) {
          console.log('[usePropertyFormState] Detected PG/Hostel from URL');
          return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
        }
        if (urlType.includes('rent')) {
          console.log('[usePropertyFormState] Detected residential rent from URL');
          return FLOW_TYPES.RESIDENTIAL_RENT;
        }
      }
      else if (urlCategory === 'commercial') {
        if (urlType.includes('sale') || urlType.includes('sell')) {
          console.log('[usePropertyFormState] Detected commercial sale from URL');
          return FLOW_TYPES.COMMERCIAL_SALE;
        }
        if (urlType.includes('coworking') || urlType.includes('co-working')) {
          console.log('[usePropertyFormState] Detected coworking from URL');
          return FLOW_TYPES.COMMERCIAL_COWORKING;
        }
        if (urlType.includes('rent')) {
          console.log('[usePropertyFormState] Detected commercial rent from URL');
          return FLOW_TYPES.COMMERCIAL_RENT;
        }
      }
      else if (urlCategory === 'land') {
        console.log('[usePropertyFormState] Detected land sale from URL');
        return FLOW_TYPES.LAND_SALE;
      }
    }
    
    // If not found in URL, try props and route params
    const effectiveCategory = (propertyCategory || category || '').toLowerCase();
    const effectiveType = (adType || type || '').toLowerCase();
    
    console.log('[usePropertyFormState] Using from props/params:', { effectiveCategory, effectiveType });
    
    if (effectiveCategory && effectiveType) {
      if (effectiveCategory === 'residential') {
        if (effectiveType.includes('sale') || effectiveType.includes('sell')) {
          console.log('[usePropertyFormState] Using residential sale from props/params');
          return FLOW_TYPES.RESIDENTIAL_SALE;
        }
        if (effectiveType.includes('flatmate')) {
          console.log('[usePropertyFormState] Using flatmates from props/params');
          return FLOW_TYPES.RESIDENTIAL_FLATMATES;
        }
        if (effectiveType.includes('pg') || effectiveType.includes('hostel')) {
          console.log('[usePropertyFormState] Using PG/Hostel from props/params');
          return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
        }
        if (effectiveType.includes('rent')) {
          console.log('[usePropertyFormState] Using residential rent from props/params');
          return FLOW_TYPES.RESIDENTIAL_RENT;
        }
      }
      else if (effectiveCategory === 'commercial') {
        if (effectiveType.includes('sale') || effectiveType.includes('sell')) {
          console.log('[usePropertyFormState] Using commercial sale from props/params');
          return FLOW_TYPES.COMMERCIAL_SALE;
        }
        if (effectiveType.includes('coworking') || effectiveType.includes('co-working')) {
          console.log('[usePropertyFormState] Using coworking from props/params');
          return FLOW_TYPES.COMMERCIAL_COWORKING;
        }
        if (effectiveType.includes('rent')) {
          console.log('[usePropertyFormState] Using commercial rent from props/params');
          return FLOW_TYPES.COMMERCIAL_RENT;
        }
      }
      else if (effectiveCategory === 'land') {
        console.log('[usePropertyFormState] Using land sale from props/params');
        return FLOW_TYPES.LAND_SALE;
      }
    }
    
    // Check for specific keywords in URL path
    if (currentPath.toLowerCase().includes('pghostel') || 
        currentPath.toLowerCase().includes('pg-hostel')) {
      console.log('[usePropertyFormState] Detected PG/Hostel from URL keyword');
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    }
    
    if (currentPath.toLowerCase().includes('flatmate')) {
      console.log('[usePropertyFormState] Detected flatmates from URL keyword');
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
    
    if (currentPath.toLowerCase().includes('coworking') || 
        currentPath.toLowerCase().includes('co-working')) {
      console.log('[usePropertyFormState] Detected coworking from URL keyword');
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
    
    if (currentPath.toLowerCase().includes('land') || 
        currentPath.toLowerCase().includes('plot')) {
      console.log('[usePropertyFormState] Detected land from URL keyword');
      return FLOW_TYPES.LAND_SALE;
    }

    // FIXED: Always return a valid flow type - never return null to prevent hooks violations
    console.warn(`[usePropertyFormState] Unable to determine property flow type from URL path: ${currentPath}. Using fallback: ${FLOW_TYPES.RESIDENTIAL_RENT}`);
    return FLOW_TYPES.RESIDENTIAL_RENT; // Safe fallback instead of null
  }, [currentPath, propertyCategory, adType, category, type]);

  // FIXED: Set hasValidFlow based on whether we could determine a proper flow type
  useEffect(() => {
    const couldDetermineFlow = flowType !== FLOW_TYPES.RESIDENTIAL_RENT || 
                              currentPath.toLowerCase().includes('rent') ||
                              (!propertyCategory && !adType && !category && !type);
    
    if (!couldDetermineFlow) {
      setError('Unable to determine property flow type. Please select a valid property type and listing option.');
      setHasValidFlow(false);
    } else {
      setError('');
      setHasValidFlow(true);
    }
  }, [flowType, currentPath, propertyCategory, adType, category, type]);

  // Set isPGHostelMode based on flow type
  useEffect(() => {
    if (flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL) {
      setIsPGHostelMode(true);
    } else {
      setIsPGHostelMode(false);
    }
  }, [flowType]);

  // Determine if we're in sale mode
  const isSaleMode = useMemo(() => {
    return flowType === FLOW_TYPES.RESIDENTIAL_SALE || 
           flowType === FLOW_TYPES.COMMERCIAL_SALE || 
           flowType === FLOW_TYPES.LAND_SALE;
  }, [flowType]);

  // FIXED: Get the initial form values - always returns a valid FormData object
  const getInitialFormValues = useCallback((): FormData => {
    console.log(`[usePropertyFormState] Getting initial form values for flow type: ${flowType}`);

    // Get the appropriate template - since flowType is never null, this will always work
    const template = FLOW_TEMPLATES[flowType];
    if (!template) {
      console.error(`[usePropertyFormState] No template found for flow type: ${flowType}. Available templates: ${Object.keys(FLOW_TEMPLATES).join(', ')}`);
      // Return fallback template instead of throwing error
      console.warn('[usePropertyFormState] Using fallback template (residential_rent)');
      return JSON.parse(JSON.stringify(residentialRentTemplate));
    }
    
    // Create a clean copy of the template
    const newFormData = JSON.parse(JSON.stringify(template));
    
    // Only update timestamps and status
    const now = new Date().toISOString();
    newFormData.meta.created_at = now;
    newFormData.meta.updated_at = now;
    newFormData.meta.status = initialStatus;
    
    console.log(`[usePropertyFormState] Created new form with template for: ${flowType}`, newFormData);
    return newFormData;
  }, [flowType, initialStatus]);

  // FIXED: Always initialize form with valid default values - this prevents undefined errors
  const form = useForm<FormData>({
    defaultValues: getInitialFormValues()
  });

  // Mark form as ready immediately since we don't support edit mode
  useEffect(() => {
    setIsFormReady(true);
  }, []);

  // These functions are kept as stubs for compatibility but don't do anything
  const migrateDataBetweenSteps = useCallback(() => {
    console.log('[usePropertyFormState] Data migration is disabled to preserve template structure');
    return; // Do nothing
  }, []);

  const cleanupSteps = useCallback(() => {
    console.log('[usePropertyFormState] Step cleanup is disabled to preserve template structure');
    return; // Do nothing
  }, []);

  return {
    form,
    error,
    setError,
    saving,
    setSaving,
    savedPropertyId,
    setSavedPropertyId,
    status,
    setStatus,
    isSaleMode,
    isPGHostelMode,
    user,
    isFormReady,
    migrateDataBetweenSteps,
    cleanupSteps,
    flowType,
    hasValidFlow
  };
}