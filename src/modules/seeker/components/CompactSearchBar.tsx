// src/modules/seeker/components/CompactSearchBar.tsx
// Version: 3.1.0
// Last Modified: 02-05-2025 17:00 IST
// Purpose: Ultra-compact search interface without popover components

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown, ChevronUp, Home, Building, Briefcase, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [furnishing, setFurnishing] = useState<string>(filters.furnishing || '');
  const [propertyAge, setPropertyAge] = useState<string>(filters.propertyAge || '');
  
  // State for expanded filter sections
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  
  // Count active filters
  const activeFilterCount = [
    minPrice > 0,
    maxPrice < 10000000,
    !!bedrooms,
    !!bathrooms,
    selectedPropertyType !== 'all',
    !!furnishing,
    !!propertyAge
  ].filter(Boolean).length;
  
  // Apply filters immediately when selections change
  const applyFilters = () => {
    setFilters({
      ...filters,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType: localPropertyType === 'all' ? undefined : localPropertyType,
      furnishing: furnishing || undefined,
      propertyAge: propertyAge || undefined
    });
    // Close any open filter
    setOpenFilter(null);
  };
  
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

  // Filter options
  const propertyTypeFilters = [
    { id: 'all', label: 'Any', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'house', label: 'House', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Briefcase }
  ];
  
  const roomOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
  
  const bedroomLabel = bedrooms 
    ? `${bedrooms}+ Bed` 
    : "Beds";
  
  const bathroomLabel = bathrooms 
    ? `${bathrooms}+ Bath` 
    : "Baths";
  
  const propertyTypeLabel = propertyTypeFilters.find(t => t.id === localPropertyType)?.label || "Type";
  
  const priceLabel = (minPrice > 0 || maxPrice < 10000000)
    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
    : "Price";
    
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilter) {
        setOpenFilter(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  // Toggle filter dropdown
  const toggleFilter = (filter: string) => {
    if (openFilter === filter) {
      setOpenFilter(null);
    } else {
      setOpenFilter(filter);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 py-4 border-b">
      <div className="container px-4 mx-auto">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <div className="relative flex shadow-sm rounded-md overflow-hidden">
              <div className="relative flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  ref={ref}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property name or keyword"
                  className="pl-9 pr-4 h-10 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
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
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button 
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none rounded-r-md"
                onClick={applyFilters}
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Property Type Filter */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('type');
                }}
              >
                <Home className="h-3.5 w-3.5 mr-1.5" />
                {propertyTypeLabel}
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
              </Button>
              
              {openFilter === 'type' && (
                <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                  {propertyTypeFilters.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={cn(
                          "flex items-center px-3 py-2 cursor-pointer",
                          localPropertyType === type.id 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                        )}
                        onClick={() => {
                          setLocalPropertyType(type.id);
                          handlePropertyTypeChange(type.id);
                          setOpenFilter(null);
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 mr-2" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Bedrooms Filter */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('bedrooms');
                }}
              >
                {bedroomLabel}
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
              </Button>
              
              {openFilter === 'bedrooms' && (
                <div className="absolute z-10 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {roomOptions.map((num, index) => (
                      <div
                        key={`bed-${num}`}
                        className={cn(
                          "flex justify-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                          (index === 0 && bedrooms === undefined) || (index > 0 && bedrooms === index)
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                        )}
                        onClick={() => {
                          const newValue = index === 0 ? undefined : index;
                          setBedrooms(newValue);
                          setFilters({...filters, bedrooms: newValue});
                          setOpenFilter(null);
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Bathrooms Filter */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('bathrooms');
                }}
              >
                {bathroomLabel}
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
              </Button>
              
              {openFilter === 'bathrooms' && (
                <div className="absolute z-10 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {roomOptions.map((num, index) => (
                      <div
                        key={`bath-${num}`}
                        className={cn(
                          "flex justify-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                          (index === 0 && bathrooms === undefined) || (index > 0 && bathrooms === index)
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                        )}
                        onClick={() => {
                          const newValue = index === 0 ? undefined : index;
                          setBathrooms(newValue);
                          setFilters({...filters, bathrooms: newValue});
                          setOpenFilter(null);
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Price Range Filter */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('price');
                }}
              >
                {priceLabel}
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
              </Button>
              
              {openFilter === 'price' && (
                <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 px-1">
                      <span>{formatPrice(minPrice)}</span>
                      <span>{formatPrice(maxPrice)}</span>
                    </div>
                    <Slider
                      value={[minPrice, maxPrice]}
                      min={0}
                      max={10000000}
                      step={100000}
                      onValueChange={(values) => {
                        setMinPrice(values[0]);
                        setMaxPrice(values[1]);
                      }}
                    />
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setMinPrice(0);
                          setMaxPrice(10000000);
                          setFilters({...filters, minPrice: 0, maxPrice: 10000000});
                          setOpenFilter(null);
                        }}
                      >
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setFilters({...filters, minPrice, maxPrice});
                          setOpenFilter(null);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* More Filters Button */}
            <Button
              variant={activeFilterCount > 0 ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-10 px-3 text-xs",
                activeFilterCount > 0 ? "bg-blue-600 text-white" : ""
              )}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              More
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 bg-white text-blue-600 flex items-center justify-center text-xs rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
              {showAdvancedFilters ? 
                <ChevronUp className="h-3 w-3 ml-1.5 opacity-70" /> : 
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
              }
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters (toggleable) */}
        {showAdvancedFilters && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Furnishing Options */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Furnishing</span>
              <div className="flex flex-wrap gap-1">
                {["Any", "Furnished", "Semi-Furnished", "Unfurnished"].map((option, i) => {
                  const value = i === 0 ? "" : option.toLowerCase();
                  return (
                    <Button
                      key={value}
                      variant={furnishing === value ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-7 text-xs px-2",
                        furnishing === value 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : ""
                      )}
                      onClick={() => {
                        setFurnishing(value);
                        setFilters({...filters, furnishing: value || undefined});
                      }}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Property Age */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Property Age</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "", label: "Any" },
                  { id: "new", label: "New" },
                  { id: "less-than-5", label: "< 5 years" },
                  { id: "5-10", label: "5-10 years" }
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant={propertyAge === option.id ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs px-2",
                      propertyAge === option.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : ""
                    )}
                    onClick={() => {
                      setPropertyAge(option.id);
                      setFilters({...filters, propertyAge: option.id || undefined});
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Clear All Button */}
            <div className="col-span-2 flex justify-end items-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-800"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CompactSearchBar.displayName = 'CompactSearchBar';

export default CompactSearchBar;