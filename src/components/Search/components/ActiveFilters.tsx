// src/components/Search/components/ActiveFilters.tsx
// Version: 2.0.0
// Last Modified: 31-01-2025 16:55 IST
// Purpose: Updated to handle actionType instead of transactionType and new filter logic

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, XCircle } from 'lucide-react';
import { ActiveFiltersProps, FilterType } from '../types/search.types';
import { 
  ACTION_TYPES, // CHANGED: from TRANSACTION_TYPES to ACTION_TYPES
  getAvailablePropertyTypes, // ADDED: to get available property types based on action
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

  // Action Type Tag (Buy/Sell/Any)
  if (filters.actionType && filters.actionType !== 'any' && ACTION_TYPES[filters.actionType as keyof typeof ACTION_TYPES]) {
    filterTags.push({
      id: 'actionType',
      label: ACTION_TYPES[filters.actionType as keyof typeof ACTION_TYPES],
      color: 'orange',
      onClear: () => onClearFilter('actionType')
    });
  }

  // Property Type Tag
  if (filters.selectedPropertyType && filters.selectedPropertyType !== 'any') {
    const availablePropertyTypes = getAvailablePropertyTypes(filters.actionType);
    if (availablePropertyTypes[filters.selectedPropertyType as keyof typeof availablePropertyTypes]) {
      filterTags.push({
        id: 'propertyType',
        label: availablePropertyTypes[filters.selectedPropertyType as keyof typeof availablePropertyTypes].label,
        color: 'blue',
        onClear: () => onClearFilter('propertyType')
      });
    }
  }

  // Subtype Tag
  if (filters.selectedSubType && filters.selectedSubType !== 'any' && getSubTypes()[filters.selectedSubType]) {
    filterTags.push({
      id: 'subType',
      label: getSubTypes()[filters.selectedSubType],
      color: 'green',
      onClear: () => onClearFilter('subType')
    });
  }

  // BHK Tag - Only show if it's applicable (Residential and not PG/Flatmates)
  if (filters.selectedBHK && filters.selectedBHK !== 'any' && 
      filters.selectedPropertyType === 'residential' &&
      filters.selectedPropertyType !== 'pghostel' && 
      filters.selectedPropertyType !== 'flatmates' &&
      BHK_TYPES[filters.selectedBHK as keyof typeof BHK_TYPES]) {
    filterTags.push({
      id: 'bhkType',
      label: BHK_TYPES[filters.selectedBHK as keyof typeof BHK_TYPES],
      color: 'indigo',
      onClear: () => onClearFilter('bhkType')
    });
  }

  // Price Range Tag
  if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any' && 
      PRICE_RANGES[filters.selectedPriceRange as keyof typeof PRICE_RANGES]) {
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