// src/components/Search/components/SearchFilters.tsx
// Version: 3.0.0
// Last Modified: 31-01-2025 16:40 IST
// Purpose: Implemented new dropdown logic with Action Type, conditional Land for Sell, and BHK for Residential only

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFiltersProps } from '../types/search.types';
import { 
  ACTION_TYPES,
  getAvailablePropertyTypes,
  getSubtypesForProperty,
  BHK_TYPES, 
  PRICE_RANGES,
  shouldShowBHK
} from '../constants/searchConstants';

interface SearchFiltersComponentProps extends SearchFiltersProps {
  getSubTypes: () => Record<string, string>;
  getSubtypeLabel: () => string;
}

const SearchFilters: React.FC<SearchFiltersComponentProps> = ({
  filters,
  onFilterChange,
  getSubTypes,
  getSubtypeLabel
}) => {
  const handleActionTypeChange = (value: string) => {
    onFilterChange('actionType', value);
  };

  const handlePropertyTypeChange = (value: string) => {
    onFilterChange('selectedPropertyType', value);
  };

  // Get available property types based on action type
  const availablePropertyTypes = getAvailablePropertyTypes(filters.actionType);

  // Check if current subtype needs special handling (coworking)
  const isCoworkingSelected = filters.selectedSubType === 'coworking';

  // Get available subtypes
  const availableSubtypes = getSubtypesForProperty(
    filters.selectedPropertyType, 
    filters.actionType, 
    isCoworkingSelected
  );

  // Determine if BHK should be shown
  const showBHK = shouldShowBHK(filters.selectedPropertyType);

  return (
    <div className="flex items-center gap-2 flex-wrap flex-1">
      {/* Action Type Filter (Buy/Sell/Any) */}
      <Select 
        value={filters.actionType} 
        onValueChange={handleActionTypeChange}
      >
        <SelectTrigger className="w-auto min-w-[100px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          {Object.entries(ACTION_TYPES).map(([key, label]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Property Type Filter */}
      <Select 
        value={filters.selectedPropertyType} 
        onValueChange={handlePropertyTypeChange}
      >
        <SelectTrigger className="w-auto min-w-[130px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any</SelectItem>
          {Object.entries(availablePropertyTypes).map(([key, type]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subtype Filter - Conditional based on Property Type and Action Type */}
      <Select 
        value={filters.selectedSubType} 
        onValueChange={(value) => onFilterChange('selectedSubType', value)}
        disabled={!filters.selectedPropertyType || 
                 filters.selectedPropertyType === 'any' ||
                 Object.keys(availableSubtypes).length === 0}
      >
        <SelectTrigger className="w-auto min-w-[120px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
          <SelectValue placeholder={getSubtypeLabel()} />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any</SelectItem>
          {Object.entries(availableSubtypes).map(([key, label]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* BHK Filter - Only for Residential (not PG/Hostel or Flatmates) */}
      {showBHK && (
        <Select 
          value={filters.selectedBHK} 
          onValueChange={(value) => onFilterChange('selectedBHK', value)}
        >
          <SelectTrigger className="w-auto min-w-[100px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 shadow-lg">
            <SelectItem value="any" className="hover:bg-slate-50">Any</SelectItem>
            {Object.entries(BHK_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key} className="hover:bg-slate-50">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Price Range Filter - Always available */}
      <Select 
        value={filters.selectedPriceRange} 
        onValueChange={(value) => onFilterChange('selectedPriceRange', value)}
      >
        <SelectTrigger className="w-auto min-w-[130px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any</SelectItem>
          {Object.entries(PRICE_RANGES).map(([key, label]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchFilters;