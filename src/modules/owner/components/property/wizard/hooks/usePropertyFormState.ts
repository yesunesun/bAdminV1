// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 8.2.0
// Last Modified: 19-05-2025 22:00 IST
// Purpose: Fix template loading to ensure correct template is loaded for each flow

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation } from 'react-router-dom';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
  mode?: 'create' | 'edit';
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
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);
  const [isFormReady, setIsFormReady] = useState(false);
  const [isPGHostelMode, setIsPGHostelMode] = useState(false);

  // Get the current URL path for flow detection
  const currentPath = location.pathname;
  
  // Log current parameters for debugging
  console.log('UsePropertyFormState initialized with:', {
    propertyCategory,
    adType,
    category,
    type,
    path: currentPath,
    initialData: initialData ? 'Present' : 'None'
  });

  // Determine the flow type based on parameters, URL, or initialData
  const flowType = useMemo(() => {
    // First, check initialData for flow type if in edit mode
    if (mode === 'edit' && initialData?.flow?.flowType && FLOW_TEMPLATES[initialData.flow.flowType]) {
      console.log(`Using flow type from initialData: ${initialData.flow.flowType}`);
      return initialData.flow.flowType;
    }

    // Extract path segments to determine flow type
    const pathSegments = currentPath.toLowerCase().split('/');
    console.log('Path segments:', pathSegments);
    
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
    
    console.log('Detected from URL path:', { urlCategory, urlType });
    
    // If we found category and type in URL, use them
    if (urlCategory && urlType) {
      if (urlCategory === 'residential') {
        if (urlType.includes('sale') || urlType.includes('sell')) {
          console.log('Detected residential sale from URL');
          return FLOW_TYPES.RESIDENTIAL_SALE;
        }
        if (urlType.includes('flatmate')) {
          console.log('Detected flatmates from URL');
          return FLOW_TYPES.RESIDENTIAL_FLATMATES;
        }
        if (urlType.includes('pg') || urlType.includes('hostel')) {
          console.log('Detected PG/Hostel from URL');
          return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
        }
        // Default residential is rent
        console.log('Detected residential rent from URL');
        return FLOW_TYPES.RESIDENTIAL_RENT;
      }
      else if (urlCategory === 'commercial') {
        if (urlType.includes('sale') || urlType.includes('sell')) {
          console.log('Detected commercial sale from URL');
          return FLOW_TYPES.COMMERCIAL_SALE;
        }
        if (urlType.includes('coworking') || urlType.includes('co-working')) {
          console.log('Detected coworking from URL');
          return FLOW_TYPES.COMMERCIAL_COWORKING;
        }
        // Default commercial is rent
        console.log('Detected commercial rent from URL');
        return FLOW_TYPES.COMMERCIAL_RENT;
      }
      else if (urlCategory === 'land') {
        console.log('Detected land sale from URL');
        return FLOW_TYPES.LAND_SALE;
      }
    }
    
    // If not found in URL, try props and route params
    const effectiveCategory = (propertyCategory || category || '').toLowerCase();
    const effectiveType = (adType || type || '').toLowerCase();
    
    console.log('Using from props/params:', { effectiveCategory, effectiveType });
    
    if (effectiveCategory && effectiveType) {
      if (effectiveCategory === 'residential') {
        if (effectiveType.includes('sale') || effectiveType.includes('sell')) {
          console.log('Using residential sale from props/params');
          return FLOW_TYPES.RESIDENTIAL_SALE;
        }
        if (effectiveType.includes('flatmate')) {
          console.log('Using flatmates from props/params');
          return FLOW_TYPES.RESIDENTIAL_FLATMATES;
        }
        if (effectiveType.includes('pg') || effectiveType.includes('hostel')) {
          console.log('Using PG/Hostel from props/params');
          return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
        }
        console.log('Using residential rent from props/params');
        return FLOW_TYPES.RESIDENTIAL_RENT;
      }
      else if (effectiveCategory === 'commercial') {
        if (effectiveType.includes('sale') || effectiveType.includes('sell')) {
          console.log('Using commercial sale from props/params');
          return FLOW_TYPES.COMMERCIAL_SALE;
        }
        if (effectiveType.includes('coworking') || effectiveType.includes('co-working')) {
          console.log('Using coworking from props/params');
          return FLOW_TYPES.COMMERCIAL_COWORKING;
        }
        console.log('Using commercial rent from props/params');
        return FLOW_TYPES.COMMERCIAL_RENT;
      }
      else if (effectiveCategory === 'land') {
        console.log('Using land sale from props/params');
        return FLOW_TYPES.LAND_SALE;
      }
    }
    
    // Check for PG/Hostel explicit indicators in URL
    if (currentPath.toLowerCase().includes('pghostel') || 
        currentPath.toLowerCase().includes('pg-hostel')) {
      console.log('Detected PG/Hostel from URL keyword');
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    }
    
    // Check for flatmates explicit indicators
    if (currentPath.toLowerCase().includes('flatmate')) {
      console.log('Detected flatmates from URL keyword');
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
    
    // Check for coworking explicit indicators
    if (currentPath.toLowerCase().includes('coworking') || 
        currentPath.toLowerCase().includes('co-working')) {
      console.log('Detected coworking from URL keyword');
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
    
    // Check for land explicit indicators
    if (currentPath.toLowerCase().includes('land') || 
        currentPath.toLowerCase().includes('plot')) {
      console.log('Detected land from URL keyword');
      return FLOW_TYPES.LAND_SALE;
    }

    // Default fallback to residential rent if nothing else matched
    console.log('No specific flow detected, using default residential rent');
    return FLOW_TYPES.RESIDENTIAL_RENT;
  }, [currentPath, initialData, mode, propertyCategory, adType, category, type]);

  // Set isPGHostelMode based on flow type
  useEffect(() => {
    if (flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL) {
      setIsPGHostelMode(true);
    }
  }, [flowType]);

  // Determine if we're in sale mode
  const isSaleMode = useMemo(() => {
    return flowType === FLOW_TYPES.RESIDENTIAL_SALE || 
           flowType === FLOW_TYPES.COMMERCIAL_SALE || 
           flowType === FLOW_TYPES.LAND_SALE;
  }, [flowType]);

  // Get the initial form values based on the detected flow type
  const getInitialFormValues = useCallback((): FormData => {
    // If we have existing data (edit mode), use it
    if (initialData && mode === 'edit') {
      console.log('Using initial data for edit mode');
      return JSON.parse(JSON.stringify(initialData));
    }
    
    // Otherwise use the appropriate template without modification
    const template = FLOW_TEMPLATES[flowType];
    if (!template) {
      console.warn(`No template found for flow type: ${flowType}, using default`);
      return JSON.parse(JSON.stringify(FLOW_TEMPLATES[FLOW_TYPES.RESIDENTIAL_RENT]));
    }
    
    // Create a clean copy of the template
    const newFormData = JSON.parse(JSON.stringify(template));
    
    // Only update timestamps and status
    const now = new Date().toISOString();
    newFormData.meta.created_at = now;
    newFormData.meta.updated_at = now;
    newFormData.meta.status = initialStatus;
    
    console.log(`Created new form with template for: ${flowType}`, newFormData);
    return newFormData;
  }, [flowType, initialData, mode, initialStatus]);

  // Initialize form with the default values
  const form = useForm<FormData>({
    defaultValues: getInitialFormValues()
  });

  // Fetch property details from database if in edit mode
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      // Only run this for existing properties in edit mode
      if (!existingPropertyId || mode !== 'edit') {
        setIsFormReady(true);
        return;
      }

      try {
        console.log('Fetching property details:', existingPropertyId);
        
        // Query the property record
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', existingPropertyId)
          .single();
        
        if (error) {
          console.error('Error fetching property details:', error);
          setIsFormReady(true);
          return;
        }
        
        if (data && data.property_details) {
          console.log('Property details fetched:', data.property_details);
          
          // Get property details
          const propertyDetails = data.property_details;
          
          // Reset the form with the database data
          form.reset(propertyDetails);
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setIsFormReady(true);
      }
    };

    fetchPropertyDetails();
  }, [existingPropertyId, mode, form]);

  // These functions are kept as stubs for compatibility but don't do anything
  const migrateDataBetweenSteps = useCallback(() => {
    console.log('Data migration is disabled to preserve template structure');
    return; // Do nothing
  }, []);

  const cleanupSteps = useCallback(() => {
    console.log('Step cleanup is disabled to preserve template structure');
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
    flowType
  };
}