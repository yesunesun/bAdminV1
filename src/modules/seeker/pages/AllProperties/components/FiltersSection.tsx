// src/modules/seeker/pages/AllProperties/components/FiltersSection.tsx
// Version: 1.0.0
// Last Modified: 05-04-2025 22:50 IST
// Purpose: Filters component for AllProperties page

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filters } from '../hooks/usePropertyFilters';

interface FiltersSectionProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  uniqueOwners: { id: string; email: string }[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onResetFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  setFilters,
  uniqueOwners,
  pageSize,
  onPageSizeChange,
  onResetFilters,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coordinates Filter */}
          <div>
            <Label htmlFor="coordinatesFilter" className="block mb-2 font-medium">Coordinates</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="coordinates-all"
                  name="coordinates"
                  checked={filters.coordinatesFilter === 'all'}
                  onChange={() => setFilters(prev => ({ ...prev, coordinatesFilter: 'all' }))}
                  className="mr-2"
                />
                <label htmlFor="coordinates-all">All Properties</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="coordinates-available"
                  name="coordinates"
                  checked={filters.coordinatesFilter === 'available'}
                  onChange={() => setFilters(prev => ({ ...prev, coordinatesFilter: 'available' }))}
                  className="mr-2"
                />
                <label htmlFor="coordinates-available">Coordinates Available</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="coordinates-none"
                  name="coordinates"
                  checked={filters.coordinatesFilter === 'notAvailable'}
                  onChange={() => setFilters(prev => ({ ...prev, coordinatesFilter: 'notAvailable' }))}
                  className="mr-2"
                />
                <label htmlFor="coordinates-none">No Coordinates</label>
              </div>
            </div>
          </div>

          {/* Owner Filter */}
          <div>
            <Label htmlFor="ownerFilter" className="block mb-2 font-medium">Property Owner</Label>
            <select
              id="ownerFilter"
              value={filters.ownerFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, ownerFilter: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">All Owners</option>
              {uniqueOwners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.email}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Selector */}
          <div>
            <Label htmlFor="pageSizeFilter" className="block mb-2 font-medium">Properties per page</Label>
            <div className="space-y-2">
              {[10, 20, 50, 100].map(size => (
                <div key={size} className="flex items-center">
                  <input
                    type="radio"
                    id={`size-${size}`}
                    name="pageSize"
                    checked={pageSize === size}
                    onChange={() => onPageSizeChange(size)}
                    className="mr-2"
                  />
                  <label htmlFor={`size-${size}`}>{size}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersSection;