// src/modules/seeker/pages/AllProperties/index.tsx
// Version: 2.0.0
// Last Modified: 25-05-2025 16:25 IST
// Purpose: Updated to use new data structure exclusively and properties_v2 table

import React, { useEffect, useState } from 'react';
import { fetchProperties } from '../../services/propertyService';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

// Components
import DebugTools from './components/DebugTools';
import FiltersSection from './components/FiltersSection';
import PropertyGrid from './components/PropertyGrid';
import Pagination from './components/Pagination';

// Hooks
import { usePropertyFilters } from './hooks/usePropertyFilters';

// Utils
import { getPropertyFlow } from './utils/propertyUtils';

// UI Components
import { useToast } from '@/components/ui/use-toast';

const AllProperties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [uniqueOwners, setUniqueOwners] = useState<{id: string, email: string}[]>([]);
  const [targetPropertyId, setTargetPropertyId] = useState<string>('4eab82e3-eea0-4c07-9ba0-b64691d59410');
  const [propertyFlows, setPropertyFlows] = useState<string[]>([]);
  
  // Custom hooks
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
      console.log('Loading properties from properties_v2 table...');
      
      // Fetch properties from properties_v2 table only
      const result = await fetchProperties({
        page: currentPage,
        pageSize: pageSize,
      });
      
      console.log(`Loaded ${result.properties.length} properties`);
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
      
      // Extract unique property flows
      const flows = new Set<string>();
      result.properties.forEach(property => {
        const flow = getPropertyFlow(property);
        if (flow !== "UNKNOWN") {
          flows.add(flow);
        }
      });
      setPropertyFlows(Array.from(flows));
      
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      
      console.log(`Total properties: ${result.totalCount}, Pages: ${result.totalPages}`);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties. Please try again later.');
      toast({
        title: "Error loading properties",
        description: "Failed to load properties from the database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for property deletion
  const handlePropertyDeleted = () => {
    // Refresh the property list after deletion
    toast({
      title: "Property deleted",
      description: "The property list will refresh automatically.",
    });
    loadProperties();
  };
  
  // Handler for property updates
  const handlePropertyUpdated = () => {
    // Refresh the property list after update
    toast({
      title: "Property updated",
      description: "The property has been updated successfully.",
    });
    loadProperties();
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading properties from database...</p>
        </div>
        <PropertyGrid isLoading={true} properties={[]} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-semibold mb-2">Error Loading Properties</h3>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => {
              setError(null);
              loadProperties();
            }}
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
        propertyId={targetPropertyId}
        onPropertyIdChange={setTargetPropertyId}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Properties from database (new structure)
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProperties.length} of {totalCount} properties
          {loading && <span className="ml-2 text-blue-600">• Loading...</span>}
        </div>
      </div>

      {/* Filters Section */}
      <FiltersSection 
        filters={filters}
        setFilters={setFilters}
        uniqueOwners={uniqueOwners}
        propertyFlows={propertyFlows}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={resetFilters}
      />

      {/* Property Grid */}
      <PropertyGrid 
        properties={filteredProperties}
        isLoading={loading && properties.length === 0}
        onPropertyDeleted={handlePropertyDeleted}
        onPropertyUpdated={handlePropertyUpdated}
      />

      {/* Pagination */}
      {totalPages > 1 && filteredProperties.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Total Properties: {totalCount}</p>
          <p>Filtered Properties: {filteredProperties.length}</p>
          <p>Current Page: {currentPage} of {totalPages}</p>
          <p>Unique Flows: {propertyFlows.join(', ')}</p>
          <p>Data Source: properties_v2 table</p>
        </div>
      )}
    </div>
  );
};

export default AllProperties;