// src/modules/seeker/pages/AllProperties/components/FiltersSection.tsx
// Version: 1.4.0
// Last Modified: 14-04-2025 15:10 IST
// Purpose: Added property flow filter

import React from 'react';
import { usePropertyFilters } from '../hooks/usePropertyFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getFlowLabel } from '../utils/propertyUtils';

interface FiltersSectionProps {
  filters: ReturnType<typeof usePropertyFilters>['filters'];
  setFilters: (filters: any) => void;
  uniqueOwners: Array<{id: string, email: string}>;
  propertyFlows: string[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onResetFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  setFilters,
  uniqueOwners,
  propertyFlows,
  pageSize,
  onPageSizeChange,
  onResetFilters
}) => {
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Property Type Filter */}
        <div>
          <Label htmlFor="propertyTypeFilter">Property Type</Label>
          <select
            id="propertyTypeFilter"
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={filters.propertyType || ''}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Office">Office</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <Label htmlFor="priceRangeFilter">Price Range</Label>
          <select
            id="priceRangeFilter"
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={filters.priceRange || ''}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="0-5000">₹0 - ₹5,000</option>
            <option value="5000-15000">₹5,000 - ₹15,000</option>
            <option value="15000-30000">₹15,000 - ₹30,000</option>
            <option value="30000-50000">₹30,000 - ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹1,00,000</option>
            <option value="100000+">Above ₹1,00,000</option>
          </select>
        </div>

        {/* Owner Filter */}
        <div>
          <Label htmlFor="ownerFilter">Property Owner</Label>
          <select
            id="ownerFilter"
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={filters.ownerId || ''}
            onChange={(e) => handleFilterChange('ownerId', e.target.value)}
          >
            <option value="">All Owners</option>
            {uniqueOwners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.email}
              </option>
            ))}
          </select>
        </div>

        {/* Property Flow Filter */}
        <div>
          <Label htmlFor="flowFilter">Property Flow</Label>
          <select
            id="flowFilter"
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={filters.propertyFlow || ''}
            onChange={(e) => handleFilterChange('propertyFlow', e.target.value)}
          >
            <option value="">All Flows</option>
            {propertyFlows.map(flow => (
              <option key={flow} value={flow}>
                {getFlowLabel(flow)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Page Size Selector */}
        <div>
          <Label htmlFor="pageSizeSelector">Items Per Page</Label>
          <select
            id="pageSizeSelector"
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        </div>
        
        {/* Reset Filters Button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FiltersSection;