// src/components/Search/SearchContainer.tsx
// Version: 3.0.0
// Last Modified: 31-05-2025 20:45 IST
// Purpose: Enhanced search container with improved visual integration

import React from 'react';
import { SearchContainerProps } from './types/search.types';
import { useSearch } from './hooks/useSearch';
import SearchHeader from './components/SearchHeader';
import SearchFilters from './components/SearchFilters';
import ActiveFilters from './components/ActiveFilters';
import SearchResultsView from './components/SearchResultsView';

const SearchContainer: React.FC<SearchContainerProps> = ({
  onSearch,
  showResults = true,
  className = ''
}) => {
  const search = useSearch(onSearch);

  const handleViewDetails = (propertyId: string) => {
    console.log('Viewing property details for:', propertyId);
    // In a real app, this would navigate to property details page
    // Example: navigate(`/property/${propertyId}`);
  };

  const handleContactOwner = (propertyId: string) => {
    console.log('Contacting owner for property:', propertyId);
    // In a real app, this would open a contact modal or form
    // Example: openContactModal(propertyId);
  };

  return (
    <div className={`bg-background ${className}`}>
      {/* Header Search Bar with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <SearchHeader
          searchQuery={search.filters.searchQuery}
          selectedLocation={search.filters.selectedLocation}
          onSearchQueryChange={search.updateSearchQuery}
          onLocationChange={search.updateLocation}
          onSearch={search.handleSearch}
        />
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Filter Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-700">Refine your search:</h3>
              <span className="text-xs text-slate-500">Use filters to find your perfect property</span>
            </div>
            {search.hasActiveFilters && (
              <div className="text-sm text-slate-600">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  {Object.values(search.filters).filter(v => v && v !== 'any').length} filters active
                </span>
              </div>
            )}
          </div>

          {/* Filters Container */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Filter Dropdowns */}
              <div className="flex-1">
                <SearchFilters
                  filters={search.filters}
                  onFilterChange={search.updateFilter}
                  getSubTypes={search.getSubTypes}
                  getSubtypeLabel={search.getSubtypeLabel}
                />
              </div>

              {/* Active Filter Tags and Clear All */}
              <div className="lg:flex-shrink-0">
                <ActiveFilters
                  filters={search.filters}
                  onClearFilter={search.clearFilter}
                  onClearAll={search.clearAllFilters}
                  hasActiveFilters={search.hasActiveFilters}
                  getFilterDisplayValue={search.getFilterDisplayValue}
                  getSubTypes={search.getSubTypes}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <SearchResultsView
          filters={search.filters}
          results={search.results}
          getSubTypes={search.getSubTypes}
          getSubtypeLabel={search.getSubtypeLabel}
          loading={search.loading}
          totalCount={search.totalCount}
          error={search.error}
          onViewDetails={handleViewDetails}
          onContactOwner={handleContactOwner}
        />
      )}
    </div>
  );
};

export default SearchContainer;