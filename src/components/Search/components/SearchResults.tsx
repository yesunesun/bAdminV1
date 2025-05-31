// src/components/Search/components/SearchResults.tsx
// Version: 2.1.0
// Last Modified: 01-06-2025 16:45 IST
// Purpose: Display search results using SearchResultsTable component

import React from 'react';
import { Card } from '@/components/ui/card';
import { SearchFilters, SearchResult } from '../types/search.types';
import SearchResultsTable from './SearchResultsTable';
import { 
  TRANSACTION_TYPES, 
  PROPERTY_TYPES, 
  TELANGANA_LOCATIONS,
  BHK_TYPES,
  PRICE_RANGES
} from '../constants/searchConstants';

interface SearchResultsProps {
  filters: SearchFilters;
  results: SearchResult[];
  getSubTypes: () => Record<string, string>;
  getSubtypeLabel: () => string;
  loading?: boolean;
  totalCount?: number;
  error?: string | null;
  className?: string;
  onViewDetails?: (propertyId: string) => void;
  onContactOwner?: (propertyId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  filters,
  results,
  getSubTypes,
  getSubtypeLabel,
  loading = false,
  totalCount = 0,
  error = null,
  className = '',
  onViewDetails,
  onContactOwner
}) => {
  const handleViewDetails = (propertyId: string) => {
    console.log('View details for property:', propertyId);
    if (onViewDetails) {
      onViewDetails(propertyId);
    }
  };

  const handleContactOwner = (propertyId: string) => {
    console.log('Contact owner for property:', propertyId);
    if (onContactOwner) {
      onContactOwner(propertyId);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Search Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {/* Search Summary */}
      {(totalCount > 0 || loading) && (
        <Card className="p-4 mb-6 bg-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-800 mb-1">Search Summary</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                {filters.searchQuery && (
                  <span><strong>Query:</strong> "{filters.searchQuery}"</span>
                )}
                {filters.selectedLocation && filters.selectedLocation !== 'any' && (
                  <span><strong>Location:</strong> {TELANGANA_LOCATIONS[filters.selectedLocation as keyof typeof TELANGANA_LOCATIONS]}</span>
                )}
                {filters.transactionType && (
                  <span><strong>Type:</strong> {TRANSACTION_TYPES[filters.transactionType as keyof typeof TRANSACTION_TYPES]}</span>
                )}
                {filters.selectedPropertyType && (
                  <span><strong>Property:</strong> {PROPERTY_TYPES[filters.selectedPropertyType as keyof typeof PROPERTY_TYPES].label}</span>
                )}
                {filters.selectedPriceRange && (
                  <span><strong>Price:</strong> {PRICE_RANGES[filters.selectedPriceRange as keyof typeof PRICE_RANGES]}</span>
                )}
              </div>
            </div>
            
            {!loading && totalCount > 0 && (
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-800">{totalCount} Properties</p>
                <p className="text-sm text-slate-600">Found matching your criteria</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Table */}
      <SearchResultsTable
        results={results}
        loading={loading}
        totalCount={totalCount}
        onViewDetails={handleViewDetails}
        onContactOwner={handleContactOwner}
      />

      {/* No filters applied and no search initiated */}
      {!loading && totalCount === 0 && !hasAnyFilters(filters) && (
        <Card className="p-8 text-center mt-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Your Property Search</h3>
          <p className="text-slate-600">
            Use the search bar and filters above to find properties that match your requirements.
          </p>
        </Card>
      )}
    </div>
  );
};

// Helper function to check if any filters are applied
const hasAnyFilters = (filters: SearchFilters): boolean => {
  return !!(
    filters.searchQuery ||
    (filters.selectedLocation && filters.selectedLocation !== 'any') ||
    filters.transactionType ||
    filters.selectedPropertyType ||
    filters.selectedSubType ||
    filters.selectedBHK ||
    filters.selectedPriceRange
  );
};

export default SearchResults;