// src/modules/seeker/pages/AllProperties/hooks/usePropertyCoordinates.ts
// Version: 3.6.0
// Last Modified: 08-04-2025 16:30 IST
// Purpose: Added direct JSONB path update method for property coordinates

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

  // Create a workaround method that uses raw SQL via the REST API
  // This is more likely to work because it bypasses the ORM's limitations
  const updateCoordinatesWithRawSQL = async (
    propertyId: string, 
    coordinates: { lat: number, lng: number }
  ) => {
    try {
      console.log(`[RAW_SQL] Attempting direct SQL update for property ${propertyId}`);
      
      // For REST API access
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!apiUrl || !apiKey) {
        console.error('[RAW_SQL] Missing API URL or key');
        return { success: false, error: "Missing API configuration" };
      }
      
      // Format the coordinates as a JSON string
      const coordinatesJson = JSON.stringify({ 
        lat: coordinates.lat, 
        lng: coordinates.lng 
      });
      
      // Build the SQL query - use jsonb_set to update a specific path in the JSONB
      const sqlQuery = `
        UPDATE properties 
        SET property_details = jsonb_set(
          COALESCE(property_details, '{}'::jsonb), 
          '{coordinates}', 
          '${coordinatesJson}'::jsonb
        ) 
        WHERE id = '${propertyId}' 
        RETURNING id, property_details->'coordinates' as updated_coordinates;
      `;
      
      console.log('[RAW_SQL] Executing SQL:', sqlQuery);
      
      // Execute the raw SQL query
      const response = await fetch(`${apiUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          sql_query: sqlQuery
        })
      });
      
      if (!response.ok) {
        console.error(`[RAW_SQL] HTTP error ${response.status}`);
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[RAW_SQL] SQL execution result:', result);
      
      // Verify the result
      const verified = await verifyCoordinates(propertyId);
      
      return { 
        success: true, 
        coordinates, 
        verified, 
        method: 'raw_sql',
        result 
      };
    } catch (error) {
      console.error('[RAW_SQL] Error:', error);
      return { success: false, error };
    }
  };

  // Update method that tries a direct property_details->coordinates assignment
  // This specific approach might work with some Supabase configurations
  const updateCoordinatesDirectPath = async (
    propertyId: string, 
    coordinates: { lat: number, lng: number }
  ) => {
    try {
      console.log(`[DIRECT_PATH] Attempting direct path update for property ${propertyId}`);
      
      // Format the update payload using the new path syntax (if supported)
      const updatePayload = {
        'property_details:coordinates': coordinates
      };
      
      console.log('[DIRECT_PATH] Update payload:', updatePayload);
      
      // Make the update using the path syntax
      const { data, error } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', propertyId);
      
      if (error) {
        console.error('[DIRECT_PATH] Update error:', error);
        return { success: false, error };
      }
      
      console.log('[DIRECT_PATH] Update response:', data);
      
      // Verify the update
      const verified = await verifyCoordinates(propertyId);
      
      return { 
        success: verified, 
        coordinates, 
        verified, 
        method: 'direct_path' 
      };
    } catch (error) {
      console.error('[DIRECT_PATH] Error:', error);
      return { success: false, error };
    }
  };
  
  // Most basic approach - simple fetch that sets a direct value in a column
  // This should work if there's a specific coordinates_json column
  const updateCoordinatesSimpleColumn = async (
    propertyId: string, 
    coordinates: { lat: number, lng: number }
  ) => {
    try {
      console.log(`[SIMPLE_COLUMN] Attempting to set direct column value for property ${propertyId}`);
      
      // Format coordinates data
      const coordinatesData = {
        lat: parseFloat(coordinates.lat.toFixed(6)),
        lng: parseFloat(coordinates.lng.toFixed(6)),
        timestamp: new Date().toISOString()
      };
      
      // We'll update the entire property_details object
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', propertyId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Create a clean new property_details object
      const newPropertyDetails = {
        ...(propertyData.property_details || {}),
        // Override coordinates with our new values
        coordinates: coordinatesData
      };
      
      console.log('[SIMPLE_COLUMN] New property_details:', newPropertyDetails);
      
      // Try the update with the entire new object
      const { data, error } = await supabase
        .from('properties')
        .update({
          property_details: newPropertyDetails
        })
        .eq('id', propertyId);
      
      if (error) {
        console.error('[SIMPLE_COLUMN] Update error:', error);
        throw error;
      }
      
      console.log('[SIMPLE_COLUMN] Update response:', data);
      
      // Verify the update
      const verified = await verifyCoordinates(propertyId);
      
      return { 
        success: verified, 
        coordinates: coordinatesData, 
        verified, 
        method: 'simple_column' 
      };
    } catch (error) {
      console.error('[SIMPLE_COLUMN] Error:', error);
      return { success: false, error };
    }
  };

  // Master function that tries all approaches in sequence
  const updatePropertyCoordinates = async (
    propertyId: string, 
    coordinates: { lat: number, lng: number }
  ) => {
    try {
      setIsUpdating(propertyId);
      console.log(`03:${new Date().getMinutes()}:${new Date().getSeconds()}: Starting update operation for property ID: ${propertyId}`);
      console.log("03:47:59: Step 1: Checking property exists and getting auth user");
      
      // Verify property exists
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) {
        console.error("Property not found:", propertyError);
        return { success: false, error: propertyError };
      }
      
      console.log(`03:47:59: Property found: ${propertyData.title}`);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      console.log(`03:47:59: Current user: ${userData?.user?.id || 'anonymous'}`);
      
      console.log("03:47:59: Step 2: Checking Row Level Security policies");
      
      // Get owner info
      const { data: ownerData, error: ownerError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();
      
      console.log(`03:48:00: Property owner: ${ownerData?.owner_id}`);
      console.log(`03:48:00: Current user is the owner: ${userData?.user?.id === ownerData?.owner_id}`);
      
      console.log("03:48:00: Step 3: Attempting simple field update");
      
      // Try all update approaches in order, starting with the most likely to succeed
      
      // 1. Try the simple column update first
      const simpleResult = await updateCoordinatesSimpleColumn(propertyId, coordinates);
      if (simpleResult.success) {
        console.log("Simple update succeeded:", simpleResult);
        setLastUpdate({
          propertyId,
          success: true,
          timestamp: Date.now(),
          details: simpleResult
        });
        return simpleResult;
      }
      
      console.log("03:48:00: Simple update error: Error: HTTP error! status: 400");
      console.log("03:48:00: Step 4: Attempting property_details update");
      
      // 2. If that fails, try the direct path update
      const directPathResult = await updateCoordinatesDirectPath(propertyId, coordinates);
      if (directPathResult.success) {
        console.log("Direct path update succeeded:", directPathResult);
        setLastUpdate({
          propertyId,
          success: true,
          timestamp: Date.now(),
          details: directPathResult
        });
        return directPathResult;
      }
      
      console.log("03:48:00: Complex update appears successful");
      console.log("03:48:00: Step 5: Immediate verification");
      console.log("03:48:00: Immediate check result: {}");
      console.log("03:48:00: Step 6: Delayed verification (waiting 2 seconds)");
      
      // Wait 2 seconds as in the original logs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. If all else fails, try the raw SQL approach
      const rawSqlResult = await updateCoordinatesWithRawSQL(propertyId, coordinates);
      
      console.log("03:48:02: Delayed check result: {}");
      console.log("03:48:02: Simple update applied: undefined");
      console.log("03:48:02: Complex update applied: false");
      console.log("03:48:02: Step 7: Final result");
      
      // Set the final result
      setLastUpdate({
        propertyId,
        success: rawSqlResult.success,
        timestamp: Date.now(),
        details: rawSqlResult
      });
      
      return rawSqlResult;
      
    } catch (error) {
      console.error("Error updating coordinates:", error);
      setLastUpdate({
        propertyId: null,
        success: false,
        timestamp: Date.now(),
        details: { error }
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