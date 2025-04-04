// src/modules/seeker/pages/AllProperties/hooks/usePropertyCoordinates.ts
// Version: 3.3.0
// Last Modified: 08-04-2025 12:30 IST
// Purpose: Fixed handling of undefined property_details during verification and update

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const usePropertyCoordinates = () => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<{
    propertyId: string | null;
    success: boolean;
    timestamp: number;
    details: any;
  }>({
    propertyId: null,
    success: false,
    timestamp: 0,
    details: null
  });
  const { toast } = useToast();

  // Debug function to check if coordinates were actually saved
  const verifyCoordinates = async (propertyId: string) => {
    try {
      console.log(`[VERIFY] Checking if coordinates were saved for property ${propertyId}`);
      
      const { data, error } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('[VERIFY] Error fetching property:', error);
        return false;
      }
      
      console.log('[VERIFY] Retrieved property_details:', data.property_details);
      
      // Check if coordinates exist
      if (data.property_details && 
          data.property_details.coordinates && 
          data.property_details.coordinates.lat !== undefined && 
          data.property_details.coordinates.lng !== undefined) {
        console.log('[VERIFY] FOUND COORDINATES:', data.property_details.coordinates);
        return true;
      }
      
      console.log('[VERIFY] NO COORDINATES FOUND!');
      return false;
    } catch (error) {
      console.error('[VERIFY] Error during verification:', error);
      return false;
    }
  };

  const updatePropertyCoordinates = async (
    propertyId: string, 
    coordinates: { lat: number, lng: number }
  ) => {
    try {
      setIsUpdating(propertyId);
      console.log(`[UPDATE] Starting update for property ${propertyId}`);
      console.log(`[UPDATE] Coordinates to save: ${JSON.stringify(coordinates)}`);
      
      // First, get the current property details
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', propertyId)
        .single();
      
      if (fetchError) {
        console.error('[UPDATE] Error fetching property:', fetchError);
        throw fetchError;
      }
      
      // Create a new property_details object, handling the case where it might be undefined
      const newPropertyDetails = {
        ...(propertyData.property_details || {}),
        coordinates: coordinates,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('[UPDATE] New property_details to save:', newPropertyDetails);
      
      // Update the database using direct JSON patch to ensure the update is applied correctly
      console.log('[UPDATE] Executing direct database update');
      
      // Try a direct SQL approach
      const { data: updateData, error: updateError } = await supabase
        .from('properties')
        .update({ 
          property_details: newPropertyDetails 
        })
        .eq('id', propertyId)
        .select();
      
      if (updateError) {
        console.error('[UPDATE] Update error:', updateError);
        throw updateError;
      }
      
      console.log('[UPDATE] Update result:', updateData);
      
      // Verify the update immediately
      console.log('[UPDATE] Verifying coordinates after update');
      const verified = await verifyCoordinates(propertyId);
      
      // Save update details
      setLastUpdate({
        propertyId,
        success: true,
        timestamp: Date.now(),
        details: { coordinates, verified }
      });
      
      toast({
        title: "Coordinates updated",
        description: `Coordinates saved: ${verified ? 'Verified' : 'Not verified'}`,
      });
      
      return { success: true, coordinates, verified };
    } catch (error) {
      console.error('[UPDATE] Error updating coordinates:', error);
      
      setLastUpdate({
        propertyId,
        success: false,
        timestamp: Date.now(),
        details: { error }
      });
      
      toast({
        title: "Update failed",
        description: "Could not save coordinates to database",
        variant: "destructive"
      });
      
      return { success: false, error };
    } finally {
      setIsUpdating(null);
    }
  };

  const geocodeAddress = async (
    propertyId: string,
    address: string,
    onSuccess?: (coordinates: { lat: number, lng: number }) => void
  ) => {
    if (!window.google || !window.google.maps) {
      toast({
        title: "Google Maps not loaded",
        description: "Please wait for Google Maps to load and try again.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setIsUpdating(propertyId);
      console.log(`[GEOCODE] Starting geocoding for address: ${address}`);
      
      // Create a new Geocoder instance
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise<{success: boolean, coordinates?: {lat: number, lng: number}, verified?: boolean}>((resolve) => {
        // Use the geocoder to get coordinates
        geocoder.geocode({ address }, async (results, status) => {
          try {
            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
              const location = results[0].geometry.location;
              const coordinates = {
                lat: location.lat(),
                lng: location.lng()
              };
              
              console.log('[GEOCODE] Geocoded coordinates:', coordinates);
              
              // Update coordinates in database
              const updateResult = await updatePropertyCoordinates(propertyId, coordinates);
              
              if (updateResult.success) {
                // Call onSuccess callback if provided
                if (onSuccess) {
                  onSuccess(coordinates);
                }
                resolve({ 
                  success: true, 
                  coordinates, 
                  verified: updateResult.verified 
                });
              } else {
                resolve({ success: false });
              }
            } else {
              console.error('[GEOCODE] Geocoding failed:', status);
              toast({
                title: "Geocoding failed",
                description: `Could not find coordinates for this address: ${status}`,
                variant: "destructive"
              });
              
              resolve({ success: false });
            }
          } catch (error) {
            console.error('[GEOCODE] Error processing geocoding result:', error);
            resolve({ success: false });
          } finally {
            setIsUpdating(null);
          }
        });
      });
    } catch (error) {
      console.error('[GEOCODE] Error during geocoding:', error);
      toast({
        title: "Error",
        description: "An error occurred while trying to get coordinates.",
        variant: "destructive"
      });
      setIsUpdating(null);
      return { success: false };
    }
  };

  // Debug effect to log updates
  useEffect(() => {
    if (lastUpdate.propertyId) {
      console.log('[DEBUG] Last update:', lastUpdate);
    }
  }, [lastUpdate]);

  return {
    isUpdating,
    updatePropertyCoordinates,
    geocodeAddress,
    verifyCoordinates,
    lastUpdate
  };
};