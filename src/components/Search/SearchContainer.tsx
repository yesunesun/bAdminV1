// src/components/Search/SearchContainer.tsx
// Version: 5.0.0
// Last Modified: 19-07-2025 12:00 IST
// Purpose: Integrated NLP search processing with visual indicators and entity extraction display

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, RotateCcw, Brain, Loader2, Sparkles } from 'lucide-react';
import { SearchContainerProps } from './types/search.types';
import { useSearch } from './hooks/useSearch';
import { TELANGANA_LOCATIONS, ACTION_TYPES, getAvailablePropertyTypes, getSubtypesForProperty, BHK_TYPES, PRICE_RANGES, shouldShowBHK } from './constants/searchConstants';
import { searchService } from './services/searchService';
import { nlpService } from './services/nlpService';
import SearchResultsView from './components/SearchResultsView';

const SearchContainer: React.FC<SearchContainerProps> = ({
  onSearch,
  showResults = true,
  className = ''
}) => {
  // ✅ ALL useState hooks FIRST - maintain consistent order
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPropertyCode, setIsPropertyCode] = useState(false);
  const [isNLPCandidate, setIsNLPCandidate] = useState(false);
  const [showEntityTags, setShowEntityTags] = useState(false);
  
  // ✅ useRef hooks
  const isFirstRender = useRef(true);

  // ✅ Custom hooks AFTER useState hooks
  const search = useSearch(onSearch);

  // ✅ ALL useCallback hooks AFTER useState and custom hooks
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    search.updateSearchQuery(e.target.value);
  }, [search]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // If it's a code suggestion, extract the code
    if (suggestion.startsWith('Search by code:')) {
      const code = suggestion.replace('Search by code:', '').trim();
      search.updateSearchQuery(code);
    } else {
      search.updateSearchQuery(suggestion);
    }
    setShowSuggestions(false);
    search.handleSearch();
  }, [search]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      search.handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [search]);

  const getPlaceholderText = useCallback(() => {
    if (search.isNLPProcessing) {
      return 'Processing your query...';
    }
    if (isPropertyCode) {
      return `Property code: ${search.filters.searchQuery.toUpperCase()}`;
    }
    if (isNLPCandidate) {
      return 'Type naturally: "3bhk apartment in gachibowli"...';
    }
    return 'Search by property name, location, or code…';
  }, [isPropertyCode, isNLPCandidate, search.isNLPProcessing, search.filters.searchQuery]);

  const handleViewDetails = useCallback((propertyId: string) => {
    console.log('Viewing property details for:', propertyId);
  }, []);

  const handleContactOwner = useCallback((propertyId: string) => {
    console.log('Contacting owner for property:', propertyId);
  }, []);

  const handleActionTypeChange = useCallback((value: string) => {
    console.log('🎯 SearchContainer: Action type changing to:', value);
    console.log('🎯 SearchContainer: Current filters before change:', search.filters);
    search.updateFilter('actionType', value);
    console.log('🎯 SearchContainer: This should trigger search in useEffect...');
  }, [search]);

  const handlePropertyTypeChange = useCallback((value: string) => {
    search.updateFilter('selectedPropertyType', value);
  }, [search]);

  const handleSubTypeChange = useCallback((value: string) => {
    search.updateFilter('selectedSubType', value);
  }, [search]);

  const handleBHKChange = useCallback((value: string) => {
    search.updateFilter('selectedBHK', value);
  }, [search]);

  const handlePriceRangeChange = useCallback((value: string) => {
    search.updateFilter('selectedPriceRange', value);
  }, [search]);

  const handleSuggestionFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  const handleSuggestionBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleClearSearch = useCallback(() => {
    search.updateSearchQuery('');
    setShowSuggestions(false);
  }, [search]);

  const handleResetFilters = useCallback(() => {
    search.clearAllFilters();
    setShowSuggestions(false);
  }, [search]);

  // ✅ ALL useEffect hooks AFTER all other hooks
  // Check if query looks like a property code or NLP candidate
  useEffect(() => {
    const query = search.filters.searchQuery;
    const isCode = searchService.isPropertyCode(query);
    const isNLP = nlpService.shouldUseNLP(query);
    
    setIsPropertyCode(isCode);
    setIsNLPCandidate(isNLP);
    
    // Show entity tags when NLP processing completes with entities
    setShowEntityTags(isNLP && search.extractedEntities && Object.keys(search.extractedEntities).some(key => search.extractedEntities[key]));
    
    if (isCode) {
      console.log('🎯 Property code detected in unified search:', query);
    } else if (isNLP) {
      console.log('🧠 NLP candidate detected:', query);
    }
  }, [search.filters.searchQuery, search.extractedEntities]);

  // Auto-trigger search when filters change - DISABLED for NLP integration
  // This was causing searches to trigger on every filter change, interfering with NLP search
  useEffect(() => {
    // Skip the first render to avoid triggering search on component mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('🚀 SearchContainer: Skipping first render, filters initialized:', search.filters);
      return;
    }

    const {
      selectedLocation,
      actionType,
      selectedPropertyType,
      selectedSubType,
      selectedBHK,
      selectedPriceRange
    } = search.filters;

    console.log('🔍 SearchContainer: Filter change detected (auto-search disabled):', {
      selectedLocation,
      actionType,
      selectedPropertyType,
      selectedSubType,
      selectedBHK,
      selectedPriceRange
    });

    // DISABLED: Auto-search on filter changes - Users must now explicitly search
    // This prevents interference with NLP search functionality
    console.log('🚫 Auto-search disabled - Users must click Search button or press Enter');
    
    // OLD CODE (commented out):
    // const timeoutId = setTimeout(() => {
    //   console.log('🔄 SearchContainer: Auto-triggering search after filter change...');
    //   console.log('🔄 SearchContainer: Current filters during auto-trigger:', search.filters);
    //   search.handleSearch();
    // }, 300); // 300ms debounce
    // return () => clearTimeout(timeoutId);
  }, [
    search.filters.selectedLocation,
    search.filters.actionType,
    search.filters.selectedPropertyType,
    search.filters.selectedSubType,
    search.filters.selectedBHK,
    search.filters.selectedPriceRange,
    search.handleSearch
  ]);

  // Get search suggestions - DISABLED to prevent interference with NLP search
  // This was causing API calls on every keystroke, interfering with NLP search integration
  useEffect(() => {
    const getSuggestions = async () => {
      // DISABLED: Local search suggestions that interfere with NLP search
      // Keeping the structure but disabling the actual API calls
      console.log('🚫 Search suggestions disabled to prevent interference with NLP search');
      setSuggestions([]);
      setShowSuggestions(false);
      
      // OLD CODE (commented out):
      // if (search.filters.searchQuery.length >= 2) {
      //   try {
      //     const results = await searchService.getSearchSuggestions(search.filters.searchQuery);
      //     setSuggestions(results);
      //     setShowSuggestions(true);
      //   } catch (error) {
      //     console.error('Error getting suggestions:', error);
      //     setSuggestions([]);
      //   }
      // } else {
      //   setSuggestions([]);
      //   setShowSuggestions(false);
      // }
    };

    // Still keep the debounce structure but with disabled functionality
    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [search.filters.searchQuery]);

  // ✅ Compute derived values after all hooks
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

  // ✅ JSX render
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
                    onFocus={handleSuggestionFocus}
                    onBlur={handleSuggestionBlur}
                    className={`
                      h-12 pl-4 ${search.filters.searchQuery ? (isPropertyCode ? 'pr-20' : search.isNLPProcessing ? 'pr-12' : 'pr-10') : 'pr-4'} text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 shadow-sm
                      ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
                      ${isNLPCandidate && !isPropertyCode ? 'border-2 border-blue-200 bg-blue-50' : ''}
                      ${search.isNLPProcessing ? 'border-2 border-purple-300 bg-purple-50' : ''}
                    `}
                  />
                  {search.filters.searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {/* Processing/Type Indicators */}
                  {search.isNLPProcessing && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    </div>
                  )}
                  {isPropertyCode && !search.isNLPProcessing && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                        CODE
                      </span>
                    </div>
                  )}
                  {isNLPCandidate && !isPropertyCode && !search.isNLPProcessing && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <Brain className="h-4 w-4 text-blue-600" />
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
                  onFocus={handleSuggestionFocus}
                  onBlur={handleSuggestionBlur}
                  className={`
                    w-full h-12 pl-4 ${search.filters.searchQuery ? (isPropertyCode ? 'pr-20' : search.isNLPProcessing ? 'pr-12' : 'pr-10') : 'pr-4'} text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 shadow-sm
                    ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
                    ${isNLPCandidate && !isPropertyCode ? 'border-2 border-blue-200 bg-blue-50' : ''}
                    ${search.isNLPProcessing ? 'border-2 border-purple-300 bg-purple-50' : ''}
                  `}
                />
                {search.filters.searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* Processing/Type Indicators for Desktop */}
                {search.isNLPProcessing && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  </div>
                )}
                {isPropertyCode && !search.isNLPProcessing && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs bg-[#FF6A00] text-white px-2 py-1 rounded-full">
                      CODE
                    </span>
                  </div>
                )}
                {isNLPCandidate && !isPropertyCode && !search.isNLPProcessing && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Brain className="h-4 w-4 text-blue-600" />
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

          {/* NLP Processing Indicator and Entity Tags */}
          {(search.isNLPProcessing || showEntityTags || search.queryInterpretation) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-t border-blue-100">
              {/* NLP Processing Indicator */}
              {search.isNLPProcessing && (
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    Understanding your query...
                  </span>
                </div>
              )}

              {/* Query Interpretation */}
              {search.queryInterpretation && search.queryInterpretation !== search.filters.searchQuery && (
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                      Query Understanding
                    </div>
                    <div className="text-sm text-purple-700">
                      Interpreted as: "{search.queryInterpretation}"
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Entity Tags */}
              {showEntityTags && search.extractedEntities && (
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">
                      Detected Information
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {search.extractedEntities.location && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            {search.extractedEntities.location}
                          </span>
                        </div>
                      )}
                      
                      {search.extractedEntities.bhk && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                          <span className="text-xs font-medium text-green-700">
                            {search.extractedEntities.bhk}
                          </span>
                        </div>
                      )}
                      
                      {search.extractedEntities.propertyType && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-purple-200 shadow-sm">
                          <span className="text-xs font-medium text-purple-700">
                            {search.extractedEntities.propertyType}
                          </span>
                        </div>
                      )}
                      
                      {search.extractedEntities.priceRange && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                          <span className="text-xs font-medium text-orange-700">
                            ₹{search.extractedEntities.priceRange}
                          </span>
                        </div>
                      )}
                      
                      {search.extractedEntities.transactionType && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-rose-200 shadow-sm">
                          <span className="text-xs font-medium text-rose-700">
                            {search.extractedEntities.transactionType === 'rent' ? 'For Rent' : 'For Sale'}
                          </span>
                        </div>
                      )}
                      
                      {search.extractedEntities.confidence && (
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                          <span className="text-xs text-gray-600">
                            {Math.round(search.extractedEntities.confidence * 100)}% confidence
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Section - Filter Row */}
          <div className="bg-white p-4 border-t border-gray-100">
            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Reset Button */}
              {search.hasActiveFilters && (
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="h-11 px-4 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              {/* Action Type Filter (Buy/Rent/Any) */}
              <Select 
                value={search.filters.actionType} 
                onValueChange={handleActionTypeChange}
              >
                <SelectTrigger className="w-auto min-w-[140px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <SelectValue placeholder="All Transaction Type" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  {Object.entries(ACTION_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="hover:bg-gray-50">
                      {key === 'any' ? 'All Transaction Type' : `${label} Properties`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Property Type Filter */}
              <Select 
                value={search.filters.selectedPropertyType} 
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className="w-auto min-w-[130px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <SelectValue placeholder="All Property Types" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="any" className="hover:bg-gray-50">All Property Types</SelectItem>
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
                onValueChange={handleSubTypeChange}
                disabled={!search.filters.selectedPropertyType || 
                         search.filters.selectedPropertyType === 'any' ||
                         Object.keys(availableSubtypes).length === 0}
              >
                <SelectTrigger className="w-auto min-w-[150px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50">
                  <SelectValue placeholder={search.filters.selectedPropertyType === 'any' ? 'Select Property Type First' : `All ${search.getSubtypeLabel()}s`} />
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="any" className="hover:bg-gray-50">All {search.getSubtypeLabel()}s</SelectItem>
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
                  onValueChange={handleBHKChange}
                >
                  <SelectTrigger className="w-auto min-w-[100px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue placeholder="All BHK Types" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="any" className="hover:bg-gray-50">All BHK Types</SelectItem>
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
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger className="w-auto min-w-[130px] h-11 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <SelectValue placeholder="All Price Ranges" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="any" className="hover:bg-gray-50">All Price Ranges</SelectItem>
                  {Object.entries(PRICE_RANGES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="hover:bg-gray-50">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          onLoadMore={search.loadMoreResults}
          canLoadMore={search.canLoadMore()}
          isLoadingMore={search.isLoadingMore}
        />
      )}
    </div>
  );
};

export default SearchContainer;