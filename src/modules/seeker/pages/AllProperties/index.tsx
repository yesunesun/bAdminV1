// src/modules/seeker/pages/AllProperties/index.tsx
// Version: 1.20.0
// Last Modified: 07-04-2025 12:30 IST
// Purpose: Remove direct database update section

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
  const [targetPropertyId, setTargetPropertyId] = useState<string>('4eab82e3-eea0-4c07-9ba0-b64691d59410');
  
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
      <DebugTools 
        googleMapsLoaded={googleMapsLoaded} 
        propertyId={targetPropertyId}
        onPropertyIdChange={setTargetPropertyId}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProperties.length} of {totalCount} properties
        </div>
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