// src/modules/seeker/components/CompactSearchBar.tsx
// Version: 1.2.0
// Last Modified: 04-04-2025 21:30 IST
// Purpose: Enhanced filters panel to match design shown in screenshot

import React, { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Sliders, MapPin, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { propertyTypeOptions } from '../services/seekerService';
import { PropertyFilters } from '../services/seekerService';
import { cn } from '@/lib/utils';

interface CompactSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchLocations: string[];
  selectedPropertyType: string;
  handlePropertyTypeChange: (type: string) => void;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  handleResetFilters: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const CompactSearchBar = forwardRef<HTMLInputElement, CompactSearchBarProps>(({
  searchQuery,
  setSearchQuery,
  searchLocations,
  selectedPropertyType,
  handlePropertyTypeChange,
  filters,
  setFilters,
  handleResetFilters,
  onFocus,
  onBlur
}, ref) => {
  const [minPrice, setMinPrice] = useState<number>(filters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState<number>(filters.maxPrice || 10000000);
  const [bedrooms, setBedrooms] = useState<number | undefined>(filters.bedrooms);
  const [bathrooms, setBathrooms] = useState<number | undefined>(filters.bathrooms);
  const [localPropertyType, setLocalPropertyType] = useState<string>(selectedPropertyType);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Sync local state with filters when they change externally
  useEffect(() => {
    setMinPrice(filters.minPrice || 0);
    setMaxPrice(filters.maxPrice || 10000000);
    setBedrooms(filters.bedrooms);
    setBathrooms(filters.bathrooms);
    setLocalPropertyType(selectedPropertyType);
  }, [filters, selectedPropertyType]);
  
  // Handle filter changes 
  const applyFilters = () => {
    // Apply property type from local state
    if (localPropertyType !== selectedPropertyType) {
      handlePropertyTypeChange(localPropertyType);
    }
    
    setFilters({
      ...filters,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType: localPropertyType === 'all' ? undefined : localPropertyType
    });
    
    setIsSheetOpen(false);
  };
  
  // Count active filters
  const activeFilterCount = [
    minPrice > 0,
    maxPrice < 10000000,
    !!bedrooms,
    !!bathrooms,
    selectedPropertyType !== 'all'
  ].filter(Boolean).length;
  
  // Format price to Indian format
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price}`;
    }
  };

  // Property type options for the filters panel
  const propertyTypeFilters = [
    { id: 'all', label: 'All Types' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'house', label: 'House' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'land', label: 'Land' }
  ];
  
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
      <div className="container flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={ref}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, property name or keyword"
              className="pl-9 pr-4 h-11"
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Property Type Filter */}
          <Select
            value={selectedPropertyType}
            onValueChange={handlePropertyTypeChange}
          >
            <SelectTrigger className="w-[140px] h-11">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Advanced Filters Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 relative">
                <Sliders className="h-4 w-4 mr-2" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl">Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with specific criteria
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-4 space-y-6">
                {/* Property Types */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Property Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypeFilters.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => setLocalPropertyType(option.id)}
                        className={cn(
                          "px-3 py-2.5 rounded-md border cursor-pointer flex items-center justify-between",
                          localPropertyType === option.id
                            ? "bg-primary/10 border-primary"
                            : "bg-background hover:bg-muted/50 border-input"
                        )}
                      >
                        <span>{option.label}</span>
                        {localPropertyType === option.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Price Range</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>₹0</span>
                    <span>₹1.0Cr</span>
                  </div>
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    value={[minPrice, maxPrice]}
                    min={0}
                    max={10000000}
                    step={100000}
                    onValueChange={(values) => {
                      setMinPrice(values[0]);
                      setMaxPrice(values[1]);
                    }}
                    className="mt-2"
                  />
                </div>
                
                {/* Bedrooms */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Bedrooms</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((num, index) => (
                      <Button
                        key={num}
                        variant={
                          (index === 0 && bedrooms === undefined) || 
                          (index > 0 && bedrooms === index) 
                            ? "default" 
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setBedrooms(index === 0 ? undefined : index)}
                        className="text-center"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Bathrooms */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Bathrooms</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((num, index) => (
                      <Button
                        key={num}
                        variant={
                          (index === 0 && bathrooms === undefined) || 
                          (index > 0 && bathrooms === index) 
                            ? "default" 
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setBathrooms(index === 0 ? undefined : index)}
                        className="text-center"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between pt-6 sticky bottom-0 bg-background pb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleResetFilters();
                      setLocalPropertyType('all');
                      setBedrooms(undefined);
                      setBathrooms(undefined);
                      setMinPrice(0);
                      setMaxPrice(10000000);
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button 
                    onClick={applyFilters}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Active Filters / Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            
            {selectedPropertyType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {propertyTypeOptions.find(o => o.id === selectedPropertyType)?.label || selectedPropertyType}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handlePropertyTypeChange('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {minPrice > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Min: {formatPrice(minPrice)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setMinPrice(0);
                    setFilters({...filters, minPrice: 0});
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {maxPrice < 10000000 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Max: {formatPrice(maxPrice)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setMaxPrice(10000000);
                    setFilters({...filters, maxPrice: 10000000});
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {bedrooms !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {bedrooms}+ Bed
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setBedrooms(undefined);
                    setFilters({...filters, bedrooms: undefined});
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {bathrooms !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {bathrooms}+ Bath
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setBathrooms(undefined);
                    setFilters({...filters, bathrooms: undefined});
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleResetFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

CompactSearchBar.displayName = 'CompactSearchBar';

export default CompactSearchBar;