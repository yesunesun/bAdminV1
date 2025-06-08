// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 10.0.0
// Last Modified: 25-05-2025 21:15 IST
// Purpose: Completely simplified using FlowContext - removed all complex flow detection logic

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { useFlow } from '@/contexts/FlowContext';
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
  mode?: 'create';
}

export function usePropertyFormState({
  initialData,
  existingPropertyId,
  initialStatus = 'draft',
  mode = 'create'
}: UsePropertyFormStateProps) {
  const { user } = useAuth();
  const { flowType, isValidFlow, isLoading } = useFlow();
  
  // State hooks
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);
  const [isFormReady, setIsFormReady] = useState(false);

  console.log('[usePropertyFormState] Initialized with FlowContext:', {
    flowType,
    isValidFlow,
    isLoading,
    mode
  });

  // Determine if we're in sale mode
  const isSaleMode = flowType === FLOW_TYPES.RESIDENTIAL_SALE || 
                    flowType === FLOW_TYPES.COMMERCIAL_SALE || 
                    flowType === FLOW_TYPES.LAND_SALE;

  // Determine if we're in PG/Hostel mode
  const isPGHostelMode = flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL;

  // Get the initial form values based on the current flow type
  const getInitialFormValues = useCallback((): FormData => {
    if (!flowType || !isValidFlow) {
      console.warn('[usePropertyFormState] No valid flow type available, using residential rent template');
      return JSON.parse(JSON.stringify(residentialRentTemplate));
    }

    console.log(`[usePropertyFormState] Getting template for flow type: ${flowType}`);

    const template = FLOW_TEMPLATES[flowType];
    if (!template) {
      console.error(`[usePropertyFormState] No template found for flow type: ${flowType}`);
      return JSON.parse(JSON.stringify(residentialRentTemplate));
    }
    
    // Create a clean copy of the template
    const newFormData = JSON.parse(JSON.stringify(template));
    
    // Update timestamps and status
    const now = new Date().toISOString();
    newFormData.meta.created_at = now;
    newFormData.meta.updated_at = now;
    newFormData.meta.status = initialStatus;
    
    // Set flow information from context
    newFormData.flow = {
      flowType,
      category: flowType.split('_')[0],
      listingType: flowType.split('_').slice(1).join('_')
    };
    
    console.log(`[usePropertyFormState] Created form data for flow: ${flowType}`, newFormData);
    return newFormData;
  }, [flowType, isValidFlow, initialStatus]);

  // Initialize form with default values
  const form = useForm<FormData>({
    defaultValues: getInitialFormValues()
  });

  // Update form ready status when flow context is ready
  useEffect(() => {
    if (!isLoading) {
      if (isValidFlow) {
        setIsFormReady(true);
        setError('');
      } else {
        setIsFormReady(false);
        setError('Invalid property flow. Please select a valid property type and listing option.');
      }
    }
  }, [isLoading, isValidFlow]);

  // Reset form when flow type changes
  useEffect(() => {
    if (flowType && isValidFlow) {
      const newFormData = getInitialFormValues();
      form.reset(newFormData);
      console.log('[usePropertyFormState] Form reset for new flow type:', flowType);
    }
  }, [flowType, isValidFlow, form, getInitialFormValues]);

  // Legacy compatibility functions (kept as stubs)
  const migrateDataBetweenSteps = useCallback(() => {
    console.log('[usePropertyFormState] Data migration is disabled with FlowContext');
    return;
  }, []);

  const cleanupSteps = useCallback(() => {
    console.log('[usePropertyFormState] Step cleanup is disabled with FlowContext');
    return;
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
    hasValidFlow: isValidFlow
  };
}