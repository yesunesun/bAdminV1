// src/components/Search/SearchContainer.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Main search container component orchestrating all search functionality

import React from 'react';
import { SearchContainerProps } from './types/search.types';
import { useSearch } from './hooks/useSearch';
import SearchHeader from './components/SearchHeader';
import SearchFilters from './components/SearchFilters';
import ActiveFilters from './components/ActiveFilters';
import SearchResults from './components/SearchResults';

const SearchContainer: React.FC<SearchContainerProps> = ({
  onSearch,
  showResults = true,
  className = ''
}) => {
  const search = useSearch(onSearch);

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
        <SearchResults
          filters={search.filters}
          getSubTypes={search.getSubTypes}
          getSubtypeLabel={search.getSubtypeLabel}
          loading={search.loading}
          totalCount={search.totalCount}
        />
      )}
    </div>
  );
};

export default SearchContainer;