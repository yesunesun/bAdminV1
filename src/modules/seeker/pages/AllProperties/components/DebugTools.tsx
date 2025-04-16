// src/modules/seeker/pages/AllProperties/components/DebugTools.tsx
// Version: 1.5.0
// Last Modified: 15-04-2025 13:45 IST
// Purpose: Added functionality to set default version for properties

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { setDefaultVersionForProperties } from '../services/propertyVersionService';
import { supabase } from '@/lib/supabase';

interface DebugToolsProps {
  propertyId: string;
  onPropertyIdChange: (id: string) => void;
}

const DebugTools: React.FC<DebugToolsProps> = ({ 
  propertyId, 
  onPropertyIdChange 
}) => {
  const [isSettingDefaultVersion, setIsSettingDefaultVersion] = useState(false);
  const [isUpdatingCoordinates, setIsUpdatingCoordinates] = useState(false);
  const { toast } = useToast();

  const handleSetDefaultVersion = async () => {
    try {
      setIsSettingDefaultVersion(true);
      const updatedCount = await setDefaultVersionForProperties();
      
      toast({
        title: "Version Update Complete",
        description: `Updated ${updatedCount} properties to version 1`,
      });
    } catch (error) {
      toast({
        title: "Version Update Failed",
        description: error instanceof Error ? error.message : "An error occurred during update",
        variant: "destructive"
      });
    } finally {
      setIsSettingDefaultVersion(false);
    }
  };

  const updatePropertyCoordinates = async () => {
    if (!propertyId) {
      toast({
        title: "No Property Selected",
        description: "Please enter a property ID first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingCoordinates(true);
      
      // Example coordinates (Bangalore city center)
      const lat = 12.9716;
      const lng = 77.5946;
      
      // Call the function to update coordinates
      const { data, error } = await supabase.rpc(
        'update_property_coordinates',
        { 
          p_id: propertyId,
          p_lat: lat,
          p_lng: lng
        }
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Coordinates Updated",
        description: "Property coordinates have been updated successfully",
      });
      
    } catch (err) {
      console.error('Error updating coordinates:', err);
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update coordinates",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingCoordinates(false);
    }
  };

  return (
    <Card className="mb-6 p-4 border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-xl font-semibold mb-3">Debug Tools</h2>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm mb-1 block text-gray-600 dark:text-gray-400">
            Property ID:
          </label>
          <Input 
            value={propertyId}
            onChange={(e) => onPropertyIdChange(e.target.value)}
            placeholder="Enter property ID"
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updatePropertyCoordinates}
            disabled={isUpdatingCoordinates}
            className="flex items-center gap-1"
          >
            {isUpdatingCoordinates ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Set Coordinates'
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetDefaultVersion}
            disabled={isSettingDefaultVersion}
            className="flex items-center gap-1"
          >
            {isSettingDefaultVersion ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Versions...
              </>
            ) : (
              'Set All to v1'
            )}
          </Button>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Admin tools for property management and debugging
      </div>
    </Card>
  );
};

export default DebugTools;