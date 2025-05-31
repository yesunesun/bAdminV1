// src/components/Search/SearchContainer.tsx
// Version: 2.0.0
// Last Modified: 01-06-2025 16:30 IST
// Purpose: Main search container component orchestrating all search functionality

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
    <div className={`min-h-screen bg-slate-50 ${className}`}>
      {/* Header Search Bar */}
      <SearchHeader
        searchQuery={search.filters.searchQuery}
        selectedLocation={search.filters.selectedLocation}
        onSearchQueryChange={search.updateSearchQuery}
        onLocationChange={search.updateLocation}
        onSearch={search.handleSearch}
      />

      {/* Filters Row */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Dropdowns */}
            <SearchFilters
              filters={search.filters}
              onFilterChange={search.updateFilter}
              getSubTypes={search.getSubTypes}
              getSubtypeLabel={search.getSubtypeLabel}
            />

            {/* Active Filter Tags and Clear All */}
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