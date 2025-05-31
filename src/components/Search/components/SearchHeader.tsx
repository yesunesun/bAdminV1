// src/components/Search/components/SearchHeader.tsx
// Version: 1.1.0
// Last Modified: 01-06-2025 23:58 IST
// Purpose: Enhanced search with property code detection and suggestions

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { SearchHeaderProps } from '../types/search.types';
import { TELANGANA_LOCATIONS } from '../constants/searchConstants';
import { searchService } from '../services/searchService';

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  selectedLocation,
  onSearchQueryChange,
  onLocationChange,
  onSearch
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPropertyCode, setIsPropertyCode] = useState(false);

  // Check if query looks like a property code
  useEffect(() => {
    const isCode = searchService.isPropertyCode(searchQuery);
    setIsPropertyCode(isCode);
    
    if (isCode) {
      console.log('🎯 Property code detected in search header:', searchQuery);
    }
  }, [searchQuery]);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await searchService.getSearchSuggestions(searchQuery);
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
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchQueryChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // If it's a code suggestion, extract the code
    if (suggestion.startsWith('Search by code:')) {
      const code = suggestion.replace('Search by code:', '').trim();
      onSearchQueryChange(code);
    } else {
      onSearchQueryChange(suggestion);
    }
    setShowSuggestions(false);
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getPlaceholderText = () => {
    if (isPropertyCode) {
      return `Property code: ${searchQuery.toUpperCase()}`;
    }
    return 'Search by property name, location, or code...';
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-4">
          {/* Location on mobile */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 w-fit">
            <MapPin className="h-4 w-4" />
            <Select value={selectedLocation} onValueChange={onLocationChange}>
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
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className={`
                  h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50
                  ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
                `}
              />
              {isPropertyCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    CODE
                  </span>
                </div>
              )}
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.startsWith('Search by code:') ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
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
              onClick={onSearch}
              className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg whitespace-nowrap"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          {/* Location */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 min-w-[140px]">
            <MapPin className="h-4 w-4" />
            <Select value={selectedLocation} onValueChange={onLocationChange}>
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
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`
                w-full h-12 pl-4 pr-12 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50
                ${isPropertyCode ? 'border-2 border-orange-300 bg-orange-50' : ''}
              `}
            />
            {isPropertyCode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                  CODE
                </span>
              </div>
            )}
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.startsWith('Search by code:') ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
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
            onClick={onSearch}
            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;