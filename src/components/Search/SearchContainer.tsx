// src/components/Search/SearchContainer.tsx
// Version: 4.0.0
// Last Modified: 01-06-2025 18:30 IST
// Purpose: Unified, visually appealing search component with gradient header and integrated filters

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { SearchContainerProps } from './types/search.types';
import { useSearch } from './hooks/useSearch';
import { TELANGANA_LOCATIONS, ACTION_TYPES, getAvailablePropertyTypes, getSubtypesForProperty, BHK_TYPES, PRICE_RANGES, shouldShowBHK } from './constants/searchConstants';
import { searchService } from './services/searchService';
import ActiveFilters from './components/ActiveFilters';
import SearchResultsView from './components/SearchResultsView';

const SearchContainer: React.FC<SearchContainerProps> = ({
  onSearch,
  showResults = true,
  className = ''
}) => {
  const search = useSearch(onSearch);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPropertyCode, setIsPropertyCode] = useState(false);

  // Check if query looks like a property code
  useEffect(() => {
    const isCode = searchService.isPropertyCode(search.filters.searchQuery);
    setIsPropertyCode(isCode);
    
    if (isCode) {
      console.log('🎯 Property code detected in unified search:', search.filters.searchQuery);
    }
  }, [search.filters.searchQuery]);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (search.filters.searchQuery.length >= 2) {
        try {
          const results = await searchService.getSearchSuggestions(search.filters.searchQuery);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [search.filters.searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search.updateSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // If it's a code suggestion, extract the code
    if (suggestion.startsWith('Search by code:')) {
      const code = suggestion.replace('Search by code:', '').trim();
      search.updateSearchQuery(code);
    } else {
      search.updateSearchQuery(suggestion);
    }
    setShowSuggestions(false);
    search.handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      search.handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getPlaceholderText = () => {
    if (isPropertyCode) {
      return `Property code: ${search.filters.searchQuery.toUpperCase()}`;
    }
    return 'Search by property name, location, or code…';
  };

  // Get available property types based on action type
  const availablePropertyTypes = getAvailablePropertyTypes(search.filters.actionType);

  // Check if current subtype needs special handling (coworking)
  const isCoworkingSelected = search.filters.selectedSubType === 'coworking';

  // Get available subtypes
  const availableSubtypes = getSubtypesForProperty(
    search.filters.selectedPropertyType, 
    search.filters.actionType, 
    isCoworkingSelected
  );

  // Determine if BHK should be shown
  const showBHK = shouldShowBHK(search.filters.selectedPropertyType);

  const handleViewDetails = (propertyId: string) => {
    console.log('Viewing property details for:', propertyId);
  };

  const handleContactOwner = (propertyId: string) => {
    console.log('Contacting owner for property:', propertyId);
  };

  return (
    <div className={`bg-background ${className}`}>
      {/* Unified Search Card */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Top Section - Gradient Header */}
          <div className="bg-gradient-to-r from-[#1877F2] via-[#6543D2] to-[#1877F2] text-white p-5 md:p-6">
            
            {/* Mobile Layout */}
            <div className="block md:hidden space-y-4">
              {/* Location on mobile */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                <Select value={search.filters.selectedLocation} onValueChange={search.updateLocation}>
                  <SelectTrigger className="border-0 bg-transparent text-white placeholder:text-white/80 focus:ring-0 h-auto p-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    {Object.entries(TELANGANA_LOCATIONS).map(([key, city]) => (
                      <SelectItem key={key} value={key}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search bar and button on mobile */}
              <div className="flex gap-3 relative">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={search.filters.searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={`
                      h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 shadow-sm
                      ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
                    `}
                  />
                  {isPropertyCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                        CODE
                      </span>
                    </div>
                  )}
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.startsWith('Search by code:') ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                                CODE
                              </span>
                              <span>{suggestion.replace('Search by code:', '').trim()}</span>
                            </div>
                          ) : (
                            suggestion
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={search.handleSearch}
                  className="h-12 px-6 bg-[#FF6A00] hover:bg-[#e85c00] text-white font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-4">
              {/* Location */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-3 min-w-[140px] backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                <Select value={search.filters.selectedLocation} onValueChange={search.updateLocation}>
                  <SelectTrigger className="border-0 bg-transparent text-white placeholder:text-white/80 focus:ring-0 h-auto p-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    {Object.entries(TELANGANA_LOCATIONS).map(([key, city]) => (
                      <SelectItem key={key} value={key}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <Input
                  type="text"
                  placeholder={getPlaceholderText()}
                  value={search.filters.searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={`
                    w-full h-12 pl-4 pr-12 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 shadow-sm
                    ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
                  `}
                />
                {isPropertyCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                      CODE
                    </span>
                  </div>
                )}
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.startsWith('Search by code:') ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                              CODE
                            </span>
                            <span>{suggestion.replace('Search by code:', '').trim()}</span>
                          </div>
                        ) : (
                          suggestion
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button 
                onClick={search.handleSearch}
                className="h-12 px-8 bg-[#FF6A00] hover:bg-[#e85c00] text-white font-semibold rounded-lg transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Bottom Section - Filter Row */}
          <div className="bg-white p-4 border-t border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Filter Dropdowns */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {/* Action Type Filter (Buy/Sell/Any) */}
                <Select 
                  value={search.filters.actionType} 
                  onValueChange={(value) => search.updateFilter('actionType', value)}
                >
                  <SelectTrigger className="w-auto min-w-[100px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    {Object.entries(ACTION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-50">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Property Type Filter */}
                <Select 
                  value={search.filters.selectedPropertyType} 
                  onValueChange={(value) => search.updateFilter('selectedPropertyType', value)}
                >
                  <SelectTrigger className="w-auto min-w-[130px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="any" className="hover:bg-gray-50">Any</SelectItem>
                    {Object.entries(availablePropertyTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-50">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subtype Filter */}
                <Select 
                  value={search.filters.selectedSubType} 
                  onValueChange={(value) => search.updateFilter('selectedSubType', value)}
                  disabled={!search.filters.selectedPropertyType || 
                           search.filters.selectedPropertyType === 'any' ||
                           Object.keys(availableSubtypes).length === 0}
                >
                  <SelectTrigger className="w-auto min-w-[120px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50">
                    <SelectValue placeholder={search.getSubtypeLabel()} />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="any" className="hover:bg-gray-50">Any</SelectItem>
                    {Object.entries(availableSubtypes).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-50">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* BHK Filter - Only for Residential */}
                {showBHK && (
                  <Select 
                    value={search.filters.selectedBHK} 
                    onValueChange={(value) => search.updateFilter('selectedBHK', value)}
                  >
                    <SelectTrigger className="w-auto min-w-[100px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 shadow-lg">
                      <SelectItem value="any" className="hover:bg-gray-50">Any</SelectItem>
                      {Object.entries(BHK_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="hover:bg-gray-50">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Price Range Filter */}
                <Select 
                  value={search.filters.selectedPriceRange} 
                  onValueChange={(value) => search.updateFilter('selectedPriceRange', value)}
                >
                  <SelectTrigger className="w-auto min-w-[130px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="any" className="hover:bg-gray-50">Any</SelectItem>
                    {Object.entries(PRICE_RANGES).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-50">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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