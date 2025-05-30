// src/components/Search/components/ActiveFilters.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Display and manage active filter tags

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, XCircle } from 'lucide-react';
import { ActiveFiltersProps, FilterType } from '../types/search.types';
import { 
  TRANSACTION_TYPES, 
  PROPERTY_TYPES, 
  BHK_TYPES, 
  PRICE_RANGES 
} from '../constants/searchConstants';

interface ActiveFiltersComponentProps extends ActiveFiltersProps {
  hasActiveFilters: boolean;
  getFilterDisplayValue: (filterType: FilterType, value: string) => string;
  getSubTypes: () => Record<string, string>;
}

const ActiveFilters: React.FC<ActiveFiltersComponentProps> = ({
  filters,
  onClearFilter,
  onClearAll,
  hasActiveFilters,
  getFilterDisplayValue,
  getSubTypes
}) => {
  const filterTags = [];

  // Transaction Type Tag
  if (filters.transactionType) {
    filterTags.push({
      id: 'transactionType',
      label: TRANSACTION_TYPES[filters.transactionType as keyof typeof TRANSACTION_TYPES],
      color: 'orange',
      onClear: () => onClearFilter('transactionType')
    });
  }

  // Property Type Tag
  if (filters.selectedPropertyType) {
    filterTags.push({
      id: 'propertyType',
      label: PROPERTY_TYPES[filters.selectedPropertyType as keyof typeof PROPERTY_TYPES].label,
      color: 'blue',
      onClear: () => onClearFilter('propertyType')
    });
  }

  // Subtype Tag
  if (filters.selectedSubType) {
    filterTags.push({
      id: 'subType',
      label: getSubTypes()[filters.selectedSubType],
      color: 'green',
      onClear: () => onClearFilter('subType')
    });
  }

  // BHK Tag
  if (filters.selectedBHK) {
    filterTags.push({
      id: 'bhkType',
      label: BHK_TYPES[filters.selectedBHK as keyof typeof BHK_TYPES],
      color: 'indigo',
      onClear: () => onClearFilter('bhkType')
    });
  }

  // Price Range Tag
  if (filters.selectedPriceRange) {
    filterTags.push({
      id: 'priceRange',
      label: PRICE_RANGES[filters.selectedPriceRange as keyof typeof PRICE_RANGES],
      color: 'purple',
      onClear: () => onClearFilter('priceRange')
    });
  }

  const getTagClasses = (color: string) => {
    const colorMap = {
      orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      green: 'bg-green-100 text-green-800 hover:bg-green-200',
      indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap min-h-[40px] lg:min-w-[200px]">
      {filterTags.map((tag) => (
        <div 
          key={tag.id}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getTagClasses(tag.color)}`}
        >
          {tag.label}
          <button 
            onClick={tag.onClear}
            className="ml-1 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${tag.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          onClick={onClearAll}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          title="Clear All Filters"
          aria-label="Clear all filters"
        >
          <XCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ActiveFilters;