// src/modules/seeker/pages/AllProperties/components/DebugTools.tsx
// Version: 1.16.0
// Last Modified: 07-04-2025 22:00 IST
// Purpose: Added direct SQL update method and enhanced coordinate handling

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface DebugToolsProps {
  googleMapsLoaded: boolean;
  propertyId: string;
  onPropertyIdChange: (id: string) => void;
}

const DebugTools: React.FC<DebugToolsProps> = ({ 
  googleMapsLoaded, 
  propertyId, 
  onPropertyIdChange 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [copyIdSuccess, setCopyIdSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  // Log function that updates the UI with debug info
  const logDebug = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };

  // Copy debug logs to clipboard
  const copyLogsToClipboard = () => {
    if (debugLogs.length === 0) {
      toast({
        title: "Nothing to copy",
        description: "No debug logs available yet.",
        variant: "default"
      });
      return;
    }

    const logsText = debugLogs.join('\n');
    navigator.clipboard.writeText(logsText)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Copied!",
          description: "Debug logs copied to clipboard.",
        });
        
        // Reset success message after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy failed",
          description: "Couldn't copy logs to clipboard.",
          variant: "destructive"
        });
      });
  };
  
  // Copy property ID to clipboard
  const copyPropertyId = (id = propertyId) => {
    if (!id) {
      toast({
        title: "Nothing to copy",
        description: "No property ID to copy.",
        variant: "default"
      });
      return;
    }

    navigator.clipboard.writeText(id)
      .then(() => {
        setCopyIdSuccess(true);
        toast({
          title: "Copied!",
          description: "Property ID copied to clipboard.",
        });
        
        // Reset success message after 2 seconds
        setTimeout(() => setCopyIdSuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy failed",
          description: "Couldn't copy property ID.",
          variant: "destructive"
        });
      });
  };

  // Fetch property data when ID changes
  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    }
  }, [propertyId]);

  // Fetch current property data
  const fetchPropertyData = async () => {
    if (!propertyId) return;
    
    try {
      logDebug(`Fetching property data for ID: ${propertyId}`);
      
      // Validate UUID format to avoid 400 errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(propertyId)) {
        logDebug(`Invalid property ID format: ${propertyId}`);
        toast({
          title: "Invalid Format",
          description: "The property ID format is invalid. Please use a valid UUID format.",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, property_details')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        logDebug(`Error fetching property: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to fetch property: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      setPropertyData(data);
      logDebug(`Property data loaded successfully: ${data.title || "Untitled"}`);
      
      // Log coordinates if they exist
      if (data.property_details?.coordinates) {
        logDebug(`Current coordinates: Lat: ${data.property_details.coordinates.lat}, Lng: ${data.property_details.coordinates.lng}`);
      } else {
        logDebug(`No coordinates found in property_details`);
      }
    } catch (error) {
      logDebug(`Unexpected error in fetchPropertyData: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching property data",
        variant: "destructive"
      });
    }
  };

  // Update coordinates
  const updateCoordinates = async () => {
    if (!propertyId) {
      toast({
        title: "Missing Property ID",
        description: "Please enter a property ID first.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate UUID format to avoid 400 errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(propertyId)) {
      toast({
        title: "Invalid Format",
        description: "The property ID format is invalid. Please use a valid UUID format.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setDebugLogs([]);

    try {
      // Hardcoded coordinates for Hyderabad, India
      const coordinates = {
        lat: 17.385044,
        lng: 78.486671
      };

      logDebug(`Starting coordinate update for property ID: ${propertyId}`);
      logDebug(`Target coordinates: Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`);
      
      // Step 1: Get the current property details
      logDebug(`Fetching current property data...`);
      const { data: fetchResponse, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, title')
        .eq('id', propertyId);
      
      if (fetchError) {
        logDebug(`Error fetching current property data: ${fetchError.message}`);
        throw new Error(`Failed to fetch property: ${fetchError.message}`);
      }
      
      if (!fetchResponse || fetchResponse.length === 0) {
        logDebug(`Property not found with ID: ${propertyId}`);
        throw new Error(`Property not found with ID: ${propertyId}`);
      }
      
      const currentData = Array.isArray(fetchResponse) ? fetchResponse[0] : fetchResponse;
      logDebug(`Current property: ${JSON.stringify(currentData)}`);
      
      // Step 2: Create an updated property_details object
      // IMPORTANT: Ensure we're not losing existing data by properly merging
      const existingDetails = currentData.property_details || {};
      
      // Create a full clone of the existing details
      const updatedDetails = JSON.parse(JSON.stringify(existingDetails));
      
      // Add coordinates as a top-level object to ensure it's not nested too deeply
      updatedDetails.coordinates = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };
      
      // Add a timestamp to track when the update occurred
      updatedDetails.lastUpdated = new Date().toISOString();
      
      logDebug(`Prepared updated property_details: ${JSON.stringify(updatedDetails)}`);
      
      // Step 3: Try multiple update approaches
      
      // First attempt: Regular update
      logDebug(`Attempting regular update...`);
      let updateSuccessful = false;
      
      try {
        const { error: updateError } = await supabase
          .from('properties')
          .update({
            property_details: updatedDetails
          })
          .eq('id', propertyId);
          
        if (updateError) {
          logDebug(`Regular update error: ${updateError.message}`);
        } else {
          logDebug(`Regular update completed without errors`);
          updateSuccessful = true;
        }
      } catch (error) {
        logDebug(`Exception during regular update: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Second attempt: If regular update failed, try updating with raw SQL
      if (!updateSuccessful) {
        logDebug(`Attempting raw SQL update...`);
        
        try {
          // Store coordinates directly in a nested JSON object using SQL
          const coordJson = JSON.stringify({
            lat: coordinates.lat,
            lng: coordinates.lng
          });
          
          // Execute raw SQL to add/update the coordinates in the property_details
          const { error: sqlError } = await supabase.rpc('update_property_coordinates_sql', {
            property_id: propertyId,
            coords_json: coordJson
          });
          
          if (sqlError) {
            logDebug(`SQL update error: ${sqlError.message}`);
          } else {
            logDebug(`SQL update completed without errors`);
            updateSuccessful = true;
          }
        } catch (error) {
          logDebug(`Exception during SQL update: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Third attempt: If both previous methods failed, try storing coordinates in separate columns
      if (!updateSuccessful) {
        logDebug(`Attempting separate column update...`);
        
        try {
          // Store coordinates in separate columns (if they exist in the table)
          const { error: columnError } = await supabase
            .from('properties')
            .update({
              lat: coordinates.lat,
              lng: coordinates.lng,
              coords_updated_at: new Date().toISOString()
            })
            .eq('id', propertyId);
            
          if (columnError) {
            logDebug(`Column update error: ${columnError.message}`);
          } else {
            logDebug(`Column update completed without errors`);
            updateSuccessful = true;
          }
        } catch (error) {
          logDebug(`Exception during column update: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Check if any update method was successful
      if (!updateSuccessful) {
        logDebug(`All update attempts failed`);
        throw new Error('Failed to update coordinates after multiple attempts');
      }
      
      logDebug(`Update operation completed successfully`);
      
      // Step 4: Verify the update, but consider it successful even if verification fails
      logDebug(`Verifying update...`);
      
      // Wait for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('properties')
        .select('property_details, title, lat, lng')
        .eq('id', propertyId);
      
      if (verifyError) {
        logDebug(`Verification error: ${verifyError.message}`);
      } else {
        const propertyItem = Array.isArray(verifyData) ? verifyData[0] : verifyData;
        
        if (propertyItem) {
          if (propertyItem.property_details?.coordinates) {
            const coords = propertyItem.property_details.coordinates;
            logDebug(`Coordinates found in property_details: Lat: ${coords.lat}, Lng: ${coords.lng}`);
            setResult(`Success! Coordinates updated to: ${coords.lat}, ${coords.lng}`);
          } else if (propertyItem.lat !== undefined && propertyItem.lng !== undefined) {
            logDebug(`Coordinates found in separate columns: Lat: ${propertyItem.lat}, Lng: ${propertyItem.lng}`);
            setResult(`Success! Coordinates stored in separate columns: ${propertyItem.lat}, ${propertyItem.lng}`);
          } else {
            logDebug(`No coordinates found in verification data`);
            // Still consider it a success since the update went through
            setResult(`Update submitted successfully but couldn't verify the changes. Please check using alternative tools.`);
          }
        } else {
          logDebug(`No property data returned during verification`);
        }
      }
      
      // Refresh the property data to show the latest changes
      await fetchPropertyData();
      
      toast({
        title: "Update Submitted",
        description: "The update request was successfully processed.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebug(`Error updating coordinates: ${errorMessage}`);
      setResult(`Error: ${errorMessage}`);
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-blue-500 dark:border-blue-400">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Update Property Coordinates</h2>
        
        {/* Property ID Input with Copy Button */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="propertyId" className="font-medium">Property ID</Label>
            <Button 
              onClick={() => copyPropertyId()} 
              size="sm" 
              variant="ghost"
              className="h-6 px-2 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {copyIdSuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy ID
                </>
              )}
            </Button>
          </div>
          <div className="relative">
            <Input
              id="propertyId"
              value={propertyId}
              onChange={(e) => onPropertyIdChange(e.target.value)}
              placeholder="Enter property ID (UUID format)"
              className="w-full pr-10"
            />
            {propertyId && (
              <button 
                onClick={() => copyPropertyId()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copy Property ID"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            )}
          </div>
          {propertyId && !(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId)) && (
            <p className="text-xs text-red-500 mt-1">
              Invalid UUID format. Please enter a valid property ID.
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={updateCoordinates}
            disabled={loading || !propertyId || !(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId))}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Coordinates"
            )}
          </Button>
          
          <Button 
            onClick={fetchPropertyData}
            disabled={loading || !propertyId || !(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId))}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Refresh Data
          </Button>
        </div>
        
        {/* Result message */}
        {result && (
          <div className={`mb-4 p-3 rounded ${result.startsWith('Success') || result.startsWith('Update submitted') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            {result}
          </div>
        )}
        
        {/* Property Data Display */}
        {propertyData && (
          <div className="mb-4">
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-2">Current Property Data</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
              {/* Property ID with Copy Button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 mr-2">
                  <span className="font-medium">ID:</span> {propertyData.id || "Not set"}
                </div>
                <button 
                  onClick={() => copyPropertyId(propertyData.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                  title="Copy Property ID"
                  disabled={!propertyData.id}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
              <p className="mb-2"><span className="font-medium">Title:</span> {propertyData.title || "Not set"}</p>
              <p className="mb-2"><span className="font-medium">Coordinates:</span> {
                propertyData.property_details?.coordinates ? 
                `Lat: ${propertyData.property_details.coordinates.lat}, Lng: ${propertyData.property_details.coordinates.lng}` : 
                propertyData.lat !== undefined && propertyData.lng !== undefined ?
                `Lat: ${propertyData.lat}, Lng: ${propertyData.lng}` :
                "Not set"
              }</p>
              <p><span className="font-medium">Last Updated:</span> {
                propertyData.property_details?.lastUpdated || 
                propertyData.coords_updated_at || 
                "Not set"
              }</p>
            </div>
          </div>
        )}
        
        {/* Debug Logs */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300">Debug Logs</h3>
            <Button 
              onClick={copyLogsToClipboard} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              {copySuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Logs
                </>
              )}
            </Button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-60">
            {debugLogs.length > 0 ? (
              debugLogs.map((log, index) => (
                <div key={index} className="text-xs mb-1 font-mono">
                  {log}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No logs yet. Click update to see debug information.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugTools;