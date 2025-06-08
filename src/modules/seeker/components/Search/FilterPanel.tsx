// src/modules/seeker/components/Search/FilterPanel.tsx
// Version: 2.7.0
// Last Modified: 04-04-2025 13:30 IST
// Purpose: Fixed filter layout to match UI design and added property types

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FilterIcon, XIcon } from 'lucide-react';
import { PropertyFilters } from '../../services/seekerService';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0, 
    filters.maxPrice || 10000000
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Selected filters state
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('');
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>(filters.propertyType || '');

  // Update local state when filters change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.minPrice || 0,
      filters.maxPrice || 10000000
    ]);
    
    // Set selected values based on incoming filters
    setSelectedBedrooms(filters.bedrooms ? String(filters.bedrooms) : '');
    setSelectedBathrooms(filters.bathrooms ? String(filters.bathrooms) : '');
    setSelectedPropertyType(filters.propertyType || '');
  }, [filters]);

  // Property type options
  const propertyTypes = [
    { value: '', label: 'Any' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
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

  // Bathroom options
  const bathroomOptions = [
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

  const handlePropertyTypeSelect = (value: string) => {
    setSelectedPropertyType(value);
    handleFilterChange('propertyType', value);
  };

  const handleBedroomSelect = (value: string) => {
    setSelectedBedrooms(value);
    handleFilterChange('bedrooms', value === '' ? '' : parseInt(value));
  };

  const handleBathroomSelect = (value: string) => {
    setSelectedBathrooms(value);
    handleFilterChange('bathrooms', value === '' ? '' : parseInt(value));
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
    setSelectedBedrooms('');
    setSelectedBathrooms('');
    setSelectedPropertyType('');
    onResetFilters();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatPrice = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${value}`;
    }
  };

  return (
    <Card className="h-fit sticky top-4 border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
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
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">Refine your search with specific criteria</p>

        <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
          {/* Property Type Filter */}
          <div className="mb-6">
            <h4 className="text-base font-medium mb-3">Property Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <div 
                  key={type.value}
                  onClick={() => handlePropertyTypeSelect(type.value)}
                  className={cn(
                    "px-3 py-2 rounded-md border cursor-pointer text-center text-sm",
                    selectedPropertyType === type.value
                      ? "bg-primary text-primary-foreground border-primary font-medium" 
                      : "bg-background hover:bg-muted/50 border-input text-foreground"
                  )}
                >
                  {type.label}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h4 className="text-base font-medium mb-3">Price Range</h4>
            <div className="flex justify-between text-sm mb-2">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            
            <div className="relative h-6 mb-4">
              <div className="absolute h-1 bg-muted rounded-full w-full top-1/2 transform -translate-y-1/2"></div>
              <div 
                className="absolute h-1 bg-primary rounded-full top-1/2 transform -translate-y-1/2"
                style={{ 
                  left: `${(priceRange[0] / 10000000) * 100}%`, 
                  right: `${100 - (priceRange[1] / 10000000) * 100}%` 
                }}
              ></div>
              
              {/* Left handle */}
              <div 
                className="absolute h-6 w-6 rounded-full bg-background border-2 border-primary top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer flex items-center justify-center"
                style={{ left: `${(priceRange[0] / 10000000) * 100}%` }}
              >
                <div className="h-2 w-2 bg-primary rounded-full"></div>
              </div>
              
              {/* Right handle */}
              <div 
                className="absolute h-6 w-6 rounded-full bg-background border-2 border-primary top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer flex items-center justify-center"
                style={{ left: `${(priceRange[1] / 10000000) * 100}%` }}
              >
                <div className="h-2 w-2 bg-primary rounded-full"></div>
              </div>
              
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 100000), priceRange[1]])}
                className="absolute w-full h-6 opacity-0 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 100000)])}
                className="absolute w-full h-6 opacity-0 cursor-pointer"
              />
            </div>
          </div>
          
          {/* Bedrooms Filter */}
          <div className="mb-6">
            <h4 className="text-base font-medium mb-3">Bedrooms</h4>
            <div className="grid grid-cols-6 gap-2">
              {bedroomOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => handleBedroomSelect(option.value)}
                  className={cn(
                    "px-1 py-2 rounded-md border cursor-pointer text-center text-sm",
                    selectedBedrooms === option.value
                      ? "bg-primary text-primary-foreground border-primary font-medium" 
                      : "bg-background hover:bg-muted/50 border-input text-foreground"
                  )}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bathrooms Filter */}
          <div className="mb-6">
            <h4 className="text-base font-medium mb-3">Bathrooms</h4>
            <div className="grid grid-cols-6 gap-2">
              {bathroomOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => handleBathroomSelect(option.value)}
                  className={cn(
                    "px-1 py-2 rounded-md border cursor-pointer text-center text-sm",
                    selectedBathrooms === option.value
                      ? "bg-primary text-primary-foreground border-primary font-medium" 
                      : "bg-background hover:bg-muted/50 border-input text-foreground"
                  )}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-[48%]"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="w-[48%] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;