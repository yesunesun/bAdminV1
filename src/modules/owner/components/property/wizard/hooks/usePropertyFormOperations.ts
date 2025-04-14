// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 2.4.0
// Last Modified: 14-04-2025 18:30 IST
// Purpose: Fixed Commercial Co-working flow detection and property title generation

import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { supabase } from '@/lib/supabase';
import { TEST_DATA } from '../test-data';

interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any;
  mode?: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  isPGHostelMode?: boolean; 
  isCommercialRentMode?: boolean;
  isCommercialSaleMode?: boolean;
  isCoworkingMode?: boolean;
  isLandSaleMode?: boolean;
  isFlatmatesMode?: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string | null) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  handleNextStep: () => void;
}

export function usePropertyFormOperations({
  form,
  user,
  mode = 'create',
  existingPropertyId,
  adType,
  isSaleMode,
  isPGHostelMode = false,
  isCommercialRentMode = false,
  isCommercialSaleMode = false,
  isCoworkingMode = false,
  isLandSaleMode = false,
  isFlatmatesMode = false,
  status,
  setStatus,
  setSavedPropertyId,
  setSaving,
  setError,
  handleNextStep
}: UsePropertyFormOperationsProps) {
  // Handle form auto-fill (development only)
  const handleAutoFill = useCallback(() => {
    try {
      setError('');
      
      console.log("AUTO FILL TRIGGERED in usePropertyFormOperations");
      console.log("isPGHostelMode:", isPGHostelMode);
      console.log("isCoworkingMode:", isCoworkingMode);
      console.log("isSaleMode:", isSaleMode);
      console.log("adType:", adType);
      
      if (!form || typeof form.setValue !== 'function') {
        console.error('Form is not properly initialized for auto-fill');
        return;
      }
      
      // Try to fill each field directly from TEST_DATA top-level object
      try {
        console.log("Attempting basic auto fill");
        Object.entries(TEST_DATA).forEach(([section, sectionData]) => {
          console.log(`Filling section: ${section}`);
          
          if (typeof sectionData === 'object' && sectionData !== null) {
            Object.entries(sectionData).forEach(([field, value]) => {
              try {
                // Skip roomType since we'll handle it separately
                if (field !== 'roomType') {
                  console.log(`Setting ${field} = `, value);
                  form.setValue(field as any, value, { 
                    shouldValidate: true, 
                    shouldDirty: true, 
                    shouldTouch: true 
                  });
                }
              } catch (err) {
                console.error(`Error setting ${field}:`, err);
              }
            });
          }
        });
      } catch (err) {
        console.error("Error in basic auto fill:", err);
      }
      
      // Explicitly set amenities as an array
      try {
        console.log("Setting amenities array");
        form.setValue('amenities', TEST_DATA.amenities, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      } catch (err) {
        console.error("Error setting amenities:", err);
      }
      
      // Specifically handle PG and Room details
      if (isPGHostelMode) {
        console.log("Specifically filling PG/Hostel sections");
        
        // Fill room details first with special handling for roomType
        try {
          console.log("Filling room_details");
          
          // Set roomType explicitly using direct string
          // IMPORTANT: This needs to match exactly one of the values in ROOM_TYPES array
          try {
            console.log("Setting roomType = Single");
            
            // Force delay to let React properly handle the select input
            setTimeout(() => {
              form.setValue('roomType', 'Single', { 
                shouldValidate: true, 
                shouldDirty: true,
                shouldTouch: true
              });
              console.log("roomType value after setting:", form.getValues('roomType'));
            }, 0);
          } catch (err) {
            console.error("Error setting roomType:", err);
          }
          
          // Set all other room details fields
          setTimeout(() => {
            Object.entries(TEST_DATA.room_details).forEach(([field, value]) => {
              if (field !== 'roomType') {
                console.log(`Room Detail: Setting ${field} = `, value);
                form.setValue(field as any, value, { 
                  shouldValidate: true, 
                  shouldDirty: true,
                  shouldTouch: true
                });
              }
            });
          }, 10);
        } catch (err) {
          console.error("Error filling room_details:", err);
        }
        
        // Fill PG details after a slight delay
        setTimeout(() => {
          try {
            console.log("Filling pg_details");
            Object.entries(TEST_DATA.pg_details).forEach(([field, value]) => {
              console.log(`PG Detail: Setting ${field} = `, value);
              form.setValue(field as any, value, { 
                shouldValidate: true, 
                shouldDirty: true,
                shouldTouch: true
              });
            });
          } catch (err) {
            console.error("Error filling pg_details:", err);
          }
        }, 20);
      }
      
      // Trigger validation after all values are set
      if (typeof form.trigger === 'function') {
        setTimeout(() => {
          console.log("Triggering form validation");
          form.trigger();
        }, 100);
      }
    } catch (err) {
      console.error('Error in handleAutoFill:', err);
    }
  }, [form, setError, isSaleMode, isPGHostelMode, isCoworkingMode, adType]);

  // Helper function to determine property category and flow
  const determinePropertyFlow = (formData: FormData): { propertyCategory: string, propertyFlow: string } => {
    console.log("==== DETERMINING PROPERTY FLOW ====");
    console.log("Property Type:", formData.propertyType);
    console.log("Listing Type:", formData.listingType);
    console.log("isPGHostelMode:", isPGHostelMode);
    console.log("isCoworkingMode:", isCoworkingMode);
    console.log("isCommercialRentMode:", isCommercialRentMode);
    console.log("isCommercialSaleMode:", isCommercialSaleMode);
    console.log("isLandSaleMode:", isLandSaleMode);
    console.log("isFlatmatesMode:", isFlatmatesMode);
    
    // Directly use the flow flags from the wizard
    if (isCoworkingMode) {
      console.log("Detected Co-working flow based on isCoworkingMode flag");
      return { 
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING'
      };
    }
    
    if (isPGHostelMode) {
      console.log("Detected PG/Hostel flow based on isPGHostelMode flag");
      return { 
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL'
      };
    }
    
    if (isFlatmatesMode) {
      console.log("Detected Flatmates flow based on isFlatmatesMode flag");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_FLATMATES'
      };
    }
    
    if (isLandSaleMode) {
      console.log("Detected Land Sale flow based on isLandSaleMode flag");
      return {
        propertyCategory: 'land',
        propertyFlow: 'LAND_SALE'
      };
    }
    
    if (isCommercialSaleMode) {
      console.log("Detected Commercial Sale flow based on isCommercialSaleMode flag");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_SALE'
      };
    }
    
    if (isCommercialRentMode) {
      console.log("Detected Commercial Rent flow based on isCommercialRentMode flag");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_RENT'
      };
    }
    
    // Fallback to determining from form data if flags aren't set
    console.log("No specific flow flag set, determining from form data");
    
    // Determine property category
    let propertyCategory = 'residential';
    const propertyType = formData.propertyType?.toLowerCase() || '';
    
    if (
      propertyType.includes('office') || 
      propertyType.includes('shop') || 
      propertyType.includes('commercial') || 
      propertyType.includes('coworking')
    ) {
      propertyCategory = 'commercial';
    } else if (
      propertyType.includes('land') || 
      propertyType.includes('plot') ||
      propertyType.includes('agriculture')
    ) {
      propertyCategory = 'land';
    }
    
    // Check for special property types
    if (propertyType.includes('pg') || propertyType.includes('hostel')) {
      console.log("Detected PG/Hostel from property type");
      return { 
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL'
      };
    }
    
    if (propertyType.includes('flatmate') || formData.listingType?.toLowerCase() === 'flatmates') {
      console.log("Detected Flatmates from property type or listing type");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_FLATMATES'
      };
    }
    
    if (propertyType.includes('coworking') || formData.listingType?.toLowerCase() === 'coworking') {
      console.log("Detected Co-working from property type or listing type");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING'
      };
    }
    
    if (propertyCategory === 'land') {
      console.log("Detected Land Sale from property category");
      return {
        propertyCategory: 'land',
        propertyFlow: 'LAND_SALE'
      };
    }
    
    // Standard flows based on category and sale/rent
    if (propertyCategory === 'commercial') {
      if (isSaleMode) {
        console.log("Detected Commercial Sale from category and isSaleMode");
        return {
          propertyCategory: 'commercial',
          propertyFlow: 'COMMERCIAL_SALE'
        };
      } else {
        console.log("Detected Commercial Rent from category");
        return {
          propertyCategory: 'commercial',
          propertyFlow: 'COMMERCIAL_RENT'
        };
      }
    }
    
    // Default residential cases
    if (isSaleMode) {
      console.log("Detected Residential Sale");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_SALE'
      };
    } else {
      console.log("Detected Residential Rent (default)");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_RENT'
      };
    }
  };

  // Generate property title based on form data
  const generatePropertyTitle = (formData: FormData): string => {
    // If a title is already provided, use it
    if (formData.title && formData.title !== 'Sample Property') {
      return formData.title;
    }
    
    let title = '';
    
    // Handle different property types
    if (isPGHostelMode) {
      // For PG/Hostel
      const roomType = formData.roomType || '';
      const locality = formData.locality || '';
      return `${roomType} PG in ${locality}`;
    } else if (isCoworkingMode) {
      // For Co-working
      const seats = formData.seats || '';
      const locality = formData.locality || '';
      return `Co-working Space with ${seats} seats in ${locality}`;
    } else if (isLandSaleMode) {
      // For Land/Plot
      const plotSize = formData.plotSize || '';
      const plotUnit = formData.plotUnit || 'sqft';
      const locality = formData.locality || '';
      return `${plotSize} ${plotUnit} Plot for Sale in ${locality}`;
    } else if (isFlatmatesMode) {
      // For Flatmates
      const bhkType = formData.bhkType || '';
      const locality = formData.locality || '';
      return `Flatmate wanted for ${bhkType} in ${locality}`;
    } else {
      // For standard residential/commercial properties
      const bhkType = formData.bhkType || '';
      const propertyType = formData.propertyType || '';
      const locality = formData.locality || '';
      
      // Only include bhkType for residential properties that have bedrooms
      if (bhkType && !isCommercialRentMode && !isCommercialSaleMode) {
        title = `${bhkType} `;
      }
      
      title += `${propertyType} `;
      
      // Add "for Sale" or "for Rent" based on listing type
      if (isSaleMode || isCommercialSaleMode) {
        title += 'for Sale ';
      } else {
        title += 'for Rent ';
      }
      
      title += `in ${locality}`;
      return title;
    }
  };

  // Save property and return the saved property ID
  const saveProperty = async (isPublished: boolean): Promise<string> => {
    try {
      console.log('=========== DEBUG: SAVE OPERATION START ===========');
      
      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for saving');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      
      // Determine if this is a sale or rental property
      const isSaleType = 
        formData.listingType?.toLowerCase() === 'sale' || 
        formData.listingType?.toLowerCase() === 'sell' ||
        adType?.toLowerCase() === 'sale';
      
      // Get property flow information
      const { propertyCategory, propertyFlow } = determinePropertyFlow(formData);
      console.log('Determined property flow:', propertyFlow);
      console.log('Property category:', propertyCategory);
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || '',
        isSaleProperty: isSaleType,
        propertyPriceType: isSaleType ? 'sale' : 'rental',
        expectedPrice: isSaleType ? (formData.expectedPrice || '') : '',
        maintenanceCost: isSaleType ? (formData.maintenanceCost || '') : '',
        kitchenType: isSaleType ? (formData.kitchenType || '') : '',
        priceNegotiable: isSaleType ? (formData.priceNegotiable || false) : false,
        rentAmount: !isSaleType ? (formData.rentAmount || '') : '',
        securityDeposit: !isSaleType ? (formData.securityDeposit || '') : '',
        rentNegotiable: !isSaleType ? (formData.rentNegotiable || false) : false,
        // Add explicit property flow information
        propertyCategory: propertyCategory,
        propertyFlow: propertyFlow
      };
      
      // Determine price based on property type
      const price = isSaleType 
        ? parseFloat(safeFormData.expectedPrice) || 0 
        : parseFloat(safeFormData.rentAmount) || 0;
      
      // Generate proper title
      const title = generatePropertyTitle(safeFormData);
      console.log('Generated property title:', title);
      
      const propertyData = {
        owner_id: user.id,
        title: title,
        description: safeFormData.description || '',
        price: price,
        bedrooms: safeFormData.bhkType ? parseInt(safeFormData.bhkType.split(' ')[0]) : 0,
        bathrooms: safeFormData.bathrooms ? parseInt(safeFormData.bathrooms) : 0,
        square_feet: safeFormData.builtUpArea ? parseFloat(safeFormData.builtUpArea) : null,
        address: safeFormData.address || '',
        city: safeFormData.locality,
        state: 'Telangana',
        zip_code: safeFormData.pinCode || '',
        status: isPublished ? 'published' : 'draft',
        property_details: safeFormData
      };

      console.log('Saving property data:', propertyData);

      // Use an explicit ID variable
      let propertyId: string;

      if (mode === 'edit' && existingPropertyId) {
        console.log('Updating existing property:', existingPropertyId);
        
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`Failed to update property: ${updateError.message}`);
        }
        
        propertyId = existingPropertyId;
      } else {
        console.log('Creating new property');
        
        try {
          // Create a timestamp-based unique identifier for logging only
          const timestamp = new Date().toISOString();
          console.log(`Creating property at timestamp: ${timestamp}`);
          
          // Insert the property WITHOUT the marker_timestamp field
          const { data: newProperty, error: insertError } = await supabase
            .from('properties')
            .insert([propertyData])
            .select('id')
            .single();
          
          if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error(`Failed to create property: ${insertError.message}`);
          }
          
          if (!newProperty || !newProperty.id) {
            console.error('Insert succeeded but no ID returned');
            
            // Fallback query to get the most recently created property
            const { data: fallbackProperties, error: fallbackError } = await supabase
              .from('properties')
              .select('id, title, created_at')
              .eq('owner_id', propertyData.owner_id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (fallbackError || !fallbackProperties || fallbackProperties.length === 0) {
              console.error('Fallback query failed:', fallbackError);
              throw new Error('Failed to retrieve property ID after creation');
            }
            
            propertyId = fallbackProperties[0].id;
            console.log('Retrieved property ID via fallback:', propertyId);
          } else {
            propertyId = newProperty.id;
            console.log('Successfully created property with ID:', propertyId);
          }
        } catch (insertError) {
          console.error('Error during property creation process:', insertError);
          throw new Error(`Failed to process property: ${insertError.message}`);
        }
      }

      // Set state immediately
      setSavedPropertyId(propertyId);
      setStatus(isPublished ? 'published' : 'draft');
      
      console.log('Save operation completed with ID:', propertyId);
      console.log('=========== DEBUG: SAVE OPERATION END ===========');
      
      // Explicitly return the ID
      return propertyId;
    } catch (err) {
      console.error('Error saving property:', err);
      throw err;
    }
  };

  // Handle form submissions
  const handleSaveAsDraft = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleSaveAsDraft...');
      savedId = await saveProperty(false);
      
      console.log('Property saved as draft with ID:', savedId);
      handleNextStep();
      return savedId;
    } catch (err) {
      console.error('Error in handleSaveAsDraft:', err);
      setError('Failed to save property as draft. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleSaveAndPublish...');
      savedId = await saveProperty(true);
      
      // Do not call handleNextStep() here - let the caller control navigation
      console.log('Property saved successfully with ID:', savedId);
      return savedId;
    } catch (err) {
      console.error('Error in handleSaveAndPublish:', err);
      setError('Failed to publish property. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleUpdate...');
      savedId = await saveProperty(status === 'published');
      
      console.log('Property updated successfully with ID:', savedId);
      handleNextStep();
      return savedId;
    } catch (err) {
      console.error('Error in handleUpdate:', err);
      setError('Failed to update property. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleAutoFill
  };
}