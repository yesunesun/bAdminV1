// src/modules/seeker/components/Search/FilterPanel.tsx
// Version: 2.1.0
// Last Modified: 27-02-2025 12:45 IST
// Purpose: Improved filter panel with better mobile responsiveness

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FilterIcon, XIcon } from 'lucide-react';
import { PropertyFilters } from '../../services/seekerService';

interface FilterPanelProps {
  filters: PropertyFilters;
  onApplyFilters: (filters: PropertyFilters) => void;
  onResetFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onApplyFilters, 
  onResetFilters 
}) => {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0, 
    filters.maxPrice || 10000000
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Property type options
  const propertyTypes = [
    { value: 'All Types', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' }
  ];

  // Bedroom options
  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' }
  ];

  const handleFilterChange = (name: keyof PropertyFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const updatedFilters = {
      ...localFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    onApplyFilters(updatedFilters);
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    setPriceRange([0, 10000000]);
    onResetFilters();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="h-fit sticky top-4 border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleExpanded}
              className="md:hidden"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="text-destructive hover:text-destructive h-8"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-1.5">Location</label>
            <Input 
              placeholder="City, state, or address" 
              value={localFilters.location || ''} 
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Property Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-1.5">Property Type</label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <div 
                  key={type.value}
                  onClick={() => handleFilterChange('propertyType', type.value)}
                  className={`
                    px-4 py-2 rounded-md border cursor-pointer transition-colors text-center text-sm
                    ${localFilters.propertyType === type.value 
                      ? 'bg-primary text-primary-foreground border-primary font-medium' 
                      : 'bg-background hover:bg-muted/50 border-input'}
                  `}
                >
                  {type.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-1.5">Bedrooms</label>
            <div className="grid grid-cols-3 gap-2">
              {bedroomOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => handleFilterChange('bedrooms', option.value)}
                  className={`
                    px-3 py-2 rounded-md border cursor-pointer transition-colors text-center text-sm
                    ${String(localFilters.bedrooms) === option.value 
                      ? 'bg-primary text-primary-foreground border-primary font-medium' 
                      : 'bg-background hover:bg-muted/50 border-input'}
                  `}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Price Range (₹)</label>
              <span className="text-sm text-muted-foreground">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </span>
            </div>
            
            <div className="px-2">
              <div className="h-4 relative">
                <div className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 bg-muted rounded-full"></div>
              </div>
              {/* This is a placeholder for a real slider component */}
              {/* You would need to implement or install a proper range slider */}
            </div>
            
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([
                    e.target.value ? parseInt(e.target.value) : 0, 
                    priceRange[1]
                  ])}
                  className="w-full"
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] || ''}
                  onChange={(e) => setPriceRange([
                    priceRange[0], 
                    e.target.value ? parseInt(e.target.value) : 10000000
                  ])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleApplyFilters}
            className="w-full mt-6"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;