// src/components/Search/components/SearchResults.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Display search results and current search summary

import React from 'react';
import { Card } from '@/components/ui/card';
import { SearchFilters } from '../types/search.types';
import { 
  TRANSACTION_TYPES, 
  PROPERTY_TYPES, 
  TELANGANA_LOCATIONS,
  BHK_TYPES,
  PRICE_RANGES
} from '../constants/searchConstants';

interface SearchResultsProps {
  filters: SearchFilters;
  getSubTypes: () => Record<string, string>;
  getSubtypeLabel: () => string;
  loading?: boolean;
  totalCount?: number;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  filters,
  getSubTypes,
  getSubtypeLabel,
  loading = false,
  totalCount = 0,
  className = ''
}) => {
  const getDisplayValue = (value: string, options: Record<string, string>, defaultValue = 'Any') => {
    if (!value) return defaultValue;
    return value === 'any' ? defaultValue : options[value] || value;
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Search Results
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Searching properties...</span>
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              {totalCount > 0 
                ? `Found ${totalCount} properties matching your criteria.`
                : 'Your search results will appear here. This is Phase 1 - UI only.'
              }
            </p>
            
            {/* Current Search Summary */}
            <div className="bg-slate-50 rounded-lg p-4 text-left">
              <h3 className="font-medium text-slate-800 mb-2">Current Search:</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <SearchSummaryRow 
                  label="Query" 
                  value={filters.searchQuery || 'None'} 
                />
                <SearchSummaryRow 
                  label="Location" 
                  value={getDisplayValue(
                    filters.selectedLocation, 
                    TELANGANA_LOCATIONS, 
                    'Any Location'
                  )} 
                />
                <SearchSummaryRow 
                  label="Transaction Type" 
                  value={getDisplayValue(filters.transactionType, TRANSACTION_TYPES)} 
                />
                <SearchSummaryRow 
                  label="Property Type" 
                  value={getDisplayValue(
                    filters.selectedPropertyType, 
                    Object.fromEntries(
                      Object.entries(PROPERTY_TYPES).map(([key, type]) => [key, type.label])
                    ), 
                    'Any Type'
                  )} 
                />
                <SearchSummaryRow 
                  label={getSubtypeLabel()} 
                  value={getDisplayValue(
                    filters.selectedSubType, 
                    getSubTypes(), 
                    `Any ${getSubtypeLabel()}`
                  )} 
                />
                {filters.selectedPropertyType === 'residential' && (
                  <SearchSummaryRow 
                    label="BHK Type" 
                    value={getDisplayValue(filters.selectedBHK, BHK_TYPES, 'Any BHK')} 
                  />
                )}
                <SearchSummaryRow 
                  label="Price Range" 
                  value={getDisplayValue(filters.selectedPriceRange, PRICE_RANGES, 'Any Price')} 
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

interface SearchSummaryRowProps {
  label: string;
  value: string;
}

const SearchSummaryRow: React.FC<SearchSummaryRowProps> = ({ label, value }) => (
  <p>
    <strong>{label}:</strong> {value}
  </p>
);

export default SearchResults;