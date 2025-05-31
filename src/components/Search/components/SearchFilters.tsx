// src/components/Search/components/SearchFilters.tsx
// Version: 2.0.0
// Last Modified: 31-05-2025 20:45 IST
// Purpose: Enhanced filter dropdowns with better visual integration

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFiltersProps } from '../types/search.types';
import { 
  PROPERTY_TYPES, 
  TRANSACTION_TYPES, 
  BHK_TYPES, 
  PRICE_RANGES,
  COWORKING_SUBTYPES
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
  const handlePropertyTypeChange = (value: string) => {
    onFilterChange('selectedPropertyType', value);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap flex-1">
      {/* Buy/Rent Filter */}
      <Select 
        value={filters.transactionType} 
        onValueChange={(value) => onFilterChange('transactionType', value)}
      >
        <SelectTrigger className="w-auto min-w-[100px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <SelectValue placeholder="Buy/Rent" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any</SelectItem>
          {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
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
          <SelectValue placeholder="Property Type" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any Type</SelectItem>
          {Object.entries(PROPERTY_TYPES).map(([key, type]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subtype Filter */}
      <Select 
        value={filters.selectedSubType} 
        onValueChange={(value) => onFilterChange('selectedSubType', value)}
        disabled={!filters.selectedPropertyType || filters.selectedPropertyType === 'any'}
      >
        <SelectTrigger className="w-auto min-w-[120px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
          <SelectValue placeholder={getSubtypeLabel()} />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any {getSubtypeLabel()}</SelectItem>
          {Object.entries(getSubTypes()).map(([key, label]) => (
            <SelectItem key={key} value={key} className="hover:bg-slate-50">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* BHK Filter - Only for Residential (not PG/Hostel or Flatmates) */}
      {filters.selectedPropertyType === 'residential' && (
        <Select 
          value={filters.selectedBHK} 
          onValueChange={(value) => onFilterChange('selectedBHK', value)}
        >
          <SelectTrigger className="w-auto min-w-[100px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 shadow-lg">
            <SelectItem value="any" className="hover:bg-slate-50">Any BHK</SelectItem>
            {Object.entries(BHK_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key} className="hover:bg-slate-50">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Price Range Filter */}
      <Select 
        value={filters.selectedPriceRange} 
        onValueChange={(value) => onFilterChange('selectedPriceRange', value)}
      >
        <SelectTrigger className="w-auto min-w-[130px] h-11 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent className="border-slate-200 shadow-lg">
          <SelectItem value="any" className="hover:bg-slate-50">Any Price</SelectItem>
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