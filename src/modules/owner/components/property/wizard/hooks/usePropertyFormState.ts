// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 4.0.0
// Last Modified: 04-05-2025 17:45 IST
// Purpose: Updated to only support v3 data structure

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  detectDataVersion, 
  detectSpecializedPropertyType,
  DATA_VERSION_V3,
  ensureV3Structure,
  createNewPropertyData
} from '../utils/propertyDataAdapter';

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
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);
  const [isFormReady, setIsFormReady] = useState(false);
  const [isPGHostelMode, setIsPGHostelMode] = useState(false);

  // Extract property type and listing type from URL path
  const getFlowFromURL = (): { urlPropertyType: string; urlListingType: string } => {
    const pathParts = window.location.pathname.split('/');
    
    // Extract the last two path components that would indicate property type and listing type
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    return { urlPropertyType, urlListingType };
  };

  // Enhanced logic to determine if we're in a specialized mode
  const { urlPropertyType, urlListingType } = getFlowFromURL();
  
  // Determine if we're in sale mode
  const isSaleMode = 
    adType?.toLowerCase() === 'sale' || 
    type?.toLowerCase() === 'sale' || 
    urlListingType?.toLowerCase() === 'sale' ||
    (initialData && 
     detectDataVersion(initialData) === DATA_VERSION_V3 &&
     initialData.flow?.listingType === 'sale');
  
  // Determine if we're in PG/Hostel mode
  const isURLPGHostelMode = urlListingType?.toLowerCase() === 'pghostel';
  
  // Update the PG/Hostel mode flag based on URL
  useEffect(() => {
    if (isURLPGHostelMode) {
      setIsPGHostelMode(true);
    }
  }, [isURLPGHostelMode]);
  
  // Determine the actual property category and listing type to use
  const determinePropertyTypeAndListingType = (): { 
    propertyTypeToUse: string, 
    listingTypeToUse: string 
  } => {
    // Prioritize URL values
    let propertyTypeToUse = 
      urlPropertyType || 
      propertyCategory || 
      category || 
      'residential';
    
    let listingTypeToUse = 
      urlListingType || 
      adType || 
      type || 
      (isSaleMode ? 'sale' : 'rent');
    
    // Normalize the values
    propertyTypeToUse = propertyTypeToUse.toLowerCase();
    listingTypeToUse = listingTypeToUse.toLowerCase();
    
    // Check for special cases
    if (isPGHostelMode) {
      listingTypeToUse = 'pghostel';
    }
    
    if (initialData) {
      // If we have initial data, extract values from it
      const { isCoworking, isPGHostel, isFlatmate, isLand } = 
        detectSpecializedPropertyType(initialData);
      
      if (isCoworking) {
        propertyTypeToUse = 'commercial';
        listingTypeToUse = 'coworking';
      } else if (isPGHostel) {
        propertyTypeToUse = 'residential';
        listingTypeToUse = 'pghostel';
      } else if (isFlatmate) {
        propertyTypeToUse = 'residential';
        listingTypeToUse = 'flatmates';
      } else if (isLand) {
        propertyTypeToUse = 'land';
        listingTypeToUse = 'sale';
      }
    }
    
    return { propertyTypeToUse, listingTypeToUse };
  };

  // Function to create basic form values 
  const getBasicFormValues = () => {
    const { propertyTypeToUse, listingTypeToUse } = determinePropertyTypeAndListingType();
    
    // For brand new forms, create a default structure
    if (!initialData) {
      return createNewPropertyData(propertyTypeToUse, listingTypeToUse);
    }
    
    // If we have initialData, ensure it's in v3 format
    return ensureV3Structure(initialData);
  };

  // Initialize form with processed values
  const form = useForm<FormData>({
    defaultValues: getBasicFormValues()
  });

  // Directly query the database for property details in edit mode
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      // Only run this for existing properties in edit mode
      if (!existingPropertyId || mode !== 'edit') {
        setIsFormReady(true);
        return;
      }

      try {
        console.log('Directly querying database for property:', existingPropertyId);
        
        // Query the entire property record
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
        
        console.log('Direct database query result:', data);
        
        if (data) {
          // Get the property details and ensure v3 structure
          let propertyDetails = data.property_details;
          
          // Detect specialized property types
          const { isPGHostel } = detectSpecializedPropertyType(propertyDetails);
          
          // Update PG/Hostel mode flag
          setIsPGHostelMode(isPGHostel);
          
          // Convert to v3 format if needed
          const formData = ensureV3Structure(propertyDetails);
          
          // Make sure city is set if we have one from props
          if (city && formData.details?.location && !formData.details.location.city) {
            formData.details.location.city = city;
          }
          
          // Update all form fields
          console.log('Setting form values:', formData);
          form.reset(formData);
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setIsFormReady(true);
      }
    };

    fetchPropertyDetails();
  }, [existingPropertyId, mode, form, isSaleMode, city]);

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
    isFormReady
  };
}