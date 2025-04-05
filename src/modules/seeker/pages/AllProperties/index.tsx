// src/modules/seeker/pages/AllProperties/index.tsx
// Version: 1.12.0
// Last Modified: 08-04-2025 16:00 IST
// Purpose: Fixed syntax issues and simplified direct update function

import React, { useEffect, useState } from 'react';
import { fetchProperties } from '../../services/seekerService';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

// Components
import DebugTools from './components/DebugTools';
import FiltersSection from './components/FiltersSection';
import PropertyGrid from './components/PropertyGrid';
import Pagination from './components/Pagination';

// Hooks
import { useLoadGoogleMaps } from './hooks/useLoadGoogleMaps';
import { usePropertyFilters } from './hooks/usePropertyFilters';

// UI Components
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const AllProperties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [geocodingInProgress, setGeocodingInProgress] = useState<string | null>(null);
  const [uniqueOwners, setUniqueOwners] = useState<{id: string, email: string}[]>([]);
  const [directUpdateStatus, setDirectUpdateStatus] = useState<string | null>(null);
  
  // Custom hooks
  const { googleMapsLoaded } = useLoadGoogleMaps();
  const { 
    filters, 
    setFilters, 
    filteredProperties,
    resetFilters
  } = usePropertyFilters(properties);

  // Toast notifications
  const { toast } = useToast();

  // Direct update function for specific property
  const handleDirectUpdate = async () => {
    setDirectUpdateStatus('updating');
    
    const targetPropertyId = '4eab82e3-eea0-4c07-9ba0-b64691d59410';
    const coordinates = { lat: 37.7749, lng: -122.4194 };
    
    try {
      console.log("[DIRECT] Starting update for property:", targetPropertyId);
      
      // First, get the current property
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', targetPropertyId)
        .single();
        
      if (fetchError) {
        console.error("[DIRECT] Fetch error:", fetchError);
        toast({
          title: "Error fetching property",
          description: fetchError.message,
          variant: "destructive"
        });
        setDirectUpdateStatus('error');
        return;
      }
      
      console.log("[DIRECT] Current property data:", propertyData);
      
      // Create update data with a completely new object
      const updatedDetails = {
        ...(propertyData.property_details || {}),
        coordinates: coordinates,
        direct_update: true,
        last_updated: new Date().toISOString()
      };
      
      console.log("[DIRECT] New property details:", updatedDetails);
      
      // Update the database
      const { data: updateResult, error: updateError } = await supabase
        .from('properties')
        .update({ property_details: updatedDetails })
        .eq('id', targetPropertyId)
        .select();
      
      if (updateError) {
        console.error("[DIRECT] Update error:", updateError);
        toast({
          title: "Error updating property",
          description: updateError.message,
          variant: "destructive"
        });
        setDirectUpdateStatus('error');
        return;
      }
      
      console.log("[DIRECT] Update result:", updateResult);
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', targetPropertyId)
        .single();
      
      if (verifyError) {
        console.error("[DIRECT] Verify error:", verifyError);
        setDirectUpdateStatus('error');
        return;
      }
      
      console.log("[DIRECT] Verification data:", verifyData);
      
      if (verifyData.property_details?.coordinates?.lat && 
          verifyData.property_details?.coordinates?.lng) {
        
        setDirectUpdateStatus('success');
        toast({
          title: "Coordinates updated successfully",
          description: `Coordinates for property updated to ${coordinates.lat}, ${coordinates.lng}`,
        });
        
        // Refresh the properties list
        loadProperties();
      } else {
        console.error("[DIRECT] Coordinates not found after update");
        setDirectUpdateStatus('error');
        toast({
          title: "Update failed verification",
          description: "Coordinates were not found in the database after update",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[DIRECT] Error:", error);
      toast({
        title: "Direct update failed",
        description: "See console for details",
        variant: "destructive"
      });
      setDirectUpdateStatus('error');
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const result = await fetchProperties({
        page: currentPage,
        pageSize: pageSize,
      });
      
      setProperties(result.properties);
      
      // Extract unique owners for the owner filter dropdown
      const owners = new Map();
      result.properties.forEach(property => {
        if (property.profiles && property.profiles.id && property.profiles.email) {
          owners.set(property.profiles.id, {
            id: property.profiles.id,
            email: property.profiles.email
          });
        }
      });
      setUniqueOwners(Array.from(owners.values()));
      
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading && properties.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">All Properties</h1>
        <PropertyGrid isLoading={true} properties={[]} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Debug Tools */}
      <DebugTools googleMapsLoaded={googleMapsLoaded} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProperties.length} of {totalCount} properties
        </div>
      </div>
      
      {/* Direct Update Button for Specific Property */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Direct Database Update</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          This button will directly update coordinates for property ID: 4eab82e3-eea0-4c07-9ba0-b64691d59410
        </p>
        <Button
          onClick={handleDirectUpdate}
          disabled={directUpdateStatus === 'updating'}
          className={`${
            directUpdateStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 
            directUpdateStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 
            'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {directUpdateStatus === 'updating' ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : directUpdateStatus === 'success' ? (
            'Coordinates Updated Successfully'
          ) : directUpdateStatus === 'error' ? (
            'Update Failed - Try Again'
          ) : (
            'Update Coordinates for Target Property'
          )}
        </Button>
      </div>

      {/* Filters Section */}
      <FiltersSection 
        filters={filters}
        setFilters={setFilters}
        uniqueOwners={uniqueOwners}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={resetFilters}
      />

      {/* Property Grid */}
      <PropertyGrid 
        properties={filteredProperties}
        googleMapsLoaded={googleMapsLoaded}
        geocodingInProgress={geocodingInProgress}
        setGeocodingInProgress={setGeocodingInProgress}
      />

      {/* Pagination */}
      {totalPages > 1 && filteredProperties.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllProperties;