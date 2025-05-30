// src/components/Search/components/SearchFilters.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Filter dropdowns component for property search

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
    <div className="flex items-center gap-3 flex-wrap flex-1">
      {/* Buy/Rent Filter */}
      <Select 
        value={filters.transactionType} 
        onValueChange={(value) => onFilterChange('transactionType', value)}
      >
        <SelectTrigger className="w-auto min-w-[100px] h-10 border-slate-300 rounded-lg">
          <SelectValue placeholder="Buy/Rent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any</SelectItem>
          {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
            <SelectItem key={key} value={key}>
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
        <SelectTrigger className="w-auto min-w-[120px] h-10 border-slate-300 rounded-lg">
          <SelectValue placeholder="Property Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Type</SelectItem>
          {Object.entries(PROPERTY_TYPES).map(([key, type]) => (
            <SelectItem key={key} value={key}>
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
        <SelectTrigger className="w-auto min-w-[120px] h-10 border-slate-300 rounded-lg">
          <SelectValue placeholder={getSubtypeLabel()} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any {getSubtypeLabel()}</SelectItem>
          {Object.entries(getSubTypes()).map(([key, label]) => (
            <SelectItem key={key} value={key}>
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
          <SelectTrigger className="w-auto min-w-[100px] h-10 border-slate-300 rounded-lg">
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any BHK</SelectItem>
            {Object.entries(BHK_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
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
        <SelectTrigger className="w-auto min-w-[120px] h-10 border-slate-300 rounded-lg">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Price</SelectItem>
          {Object.entries(PRICE_RANGES).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchFilters;