// src/components/Search/components/SearchHeader.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Header component with search bar and location selector

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { SearchHeaderProps } from '../types/search.types';
import { TELANGANA_LOCATIONS } from '../constants/searchConstants';

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  selectedLocation,
  onSearchQueryChange,
  onLocationChange,
  onSearch
}) => {
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
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Search by property name, location, or code..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="flex-1 h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50"
            />
            <Button 
              onClick={onSearch}
              className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg whitespace-nowrap"
            >
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
              placeholder="Search by property name, location, or code..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Search Button */}
          <Button 
            onClick={onSearch}
            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;