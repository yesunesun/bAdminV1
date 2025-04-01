// src/modules/properties/components/CompactSearchBar.tsx
// Version: 2.0.0
// Last Modified: 02-04-2025 18:00 IST
// Purpose: Enhanced compact search bar with filters in the top section

import React, { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Home, 
  Building2, 
  Warehouse, 
  LandPlot,
  X, 
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PropertyFilters } from '@/modules/seeker/services/seekerService';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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

// Property type options with icons
const propertyTypeOptions = [
  { id: 'all', label: 'All Types', icon: Home },
  { id: 'apartment', label: 'Apartment', icon: Building2 },
  { id: 'house', label: 'House', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Warehouse },
  { id: 'land', label: 'Land', icon: LandPlot },
];

const CompactSearchBar = forwardRef<HTMLInputElement, CompactSearchBarProps>(
  ({ 
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
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([
      filters.minPrice || 0,
      filters.maxPrice || 10000000
    ]);
    
    // Get the property type icon component
    const getTypeIcon = (typeId: string) => {
      const option = propertyTypeOptions.find(opt => opt.id === typeId);
      const Icon = option ? option.icon : Home;
      return <Icon className="h-4 w-4" />;
    };
    
    // Format price for slider labels
    const formatPriceLabel = (value: number) => {
      if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
      } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      } else {
        return `₹${value.toLocaleString('en-IN')}`;
      }
    };
    
    // Apply price filter on slider end
    const handlePriceChangeEnd = () => {
      setFilters({
        ...filters,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      });
    };
    
    // Count active filters
    const activeFilterCount = Object.keys(filters).filter(key => 
      key !== 'searchQuery' && key !== 'propertyType' && key !== 'sortBy' && 
      filters[key as keyof PropertyFilters] !== undefined
    ).length;
    
    return (
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-3">
          {/* Main Search Row */}
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {/* Main search input */}
            <div className="relative flex-grow">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={ref}
                  type="text"
                  placeholder="Search by city, locality or landmark..."
                  className="pl-9 pr-8 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 h-6 w-6 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Location dropdown */}
              {searchLocations.length > 0 && (
                <DropdownMenu
                  open={showLocationDropdown}
                  onOpenChange={setShowLocationDropdown}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowLocationDropdown(prev => !prev)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[260px]">
                    {searchLocations.map((location, index) => (
                      <DropdownMenuItem 
                        key={index}
                        className="flex items-center gap-2"
                        onClick={() => {
                          setSearchQuery(location);
                          setShowLocationDropdown(false);
                        }}
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{location}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Property Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 h-10"
                >
                  {getTypeIcon(selectedPropertyType)}
                  <span className="hidden xs:inline-block">
                    {propertyTypeOptions.find(opt => opt.id === selectedPropertyType)?.label || 'All Types'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {propertyTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.id}
                      className="flex items-center gap-2"
                      onClick={() => handlePropertyTypeChange(option.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                      {selectedPropertyType === option.id && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* More Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden xs:inline-block">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                
                <div className="grid gap-6 py-6">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price Range: {formatPriceLabel(priceRange[0])} - {formatPriceLabel(priceRange[1])}
                    </label>
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      min={0}
                      max={20000000}
                      step={100000}
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={(vals) => setPriceRange([vals[0], vals[1]])}
                      onValueCommit={handlePriceChangeEnd}
                      className="my-6"
                    />
                  </div>
                  
                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select 
                      value={filters.bedrooms?.toString() || ""}
                      onValueChange={(val) => setFilters({...filters, bedrooms: val ? parseInt(val) : undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Select 
                      value={filters.bathrooms?.toString() || ""}
                      onValueChange={(val) => setFilters({...filters, bathrooms: val ? parseInt(val) : undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select 
                      value={filters.sortBy || "newest"}
                      onValueChange={(val) => setFilters({...filters, sortBy: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Newest First" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="size_high">Size: Largest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <SheetFooter className="flex flex-row gap-2 sm:space-x-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleResetFilters}
                  >
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button type="submit" className="flex-1">Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Active filters display */}
          {(Object.keys(filters).length > 0 || searchQuery || selectedPropertyType !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  <Search className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[150px]">{searchQuery}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedPropertyType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  {getTypeIcon(selectedPropertyType)}
                  <span>{propertyTypeOptions.find(o => o.id === selectedPropertyType)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handlePropertyTypeChange('all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.bedrooms && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  <span>{filters.bedrooms}+ Beds</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setFilters({...filters, bedrooms: undefined})}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.bathrooms && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  <span>{filters.bathrooms}+ Baths</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setFilters({...filters, bathrooms: undefined})}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  <span>
                    {filters.minPrice && formatPriceLabel(filters.minPrice)}
                    {" - "}
                    {filters.maxPrice && formatPriceLabel(filters.maxPrice)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setFilters({...filters, minPrice: undefined, maxPrice: undefined})}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 text-xs px-2 ml-auto"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CompactSearchBar.displayName = 'CompactSearchBar';

export default CompactSearchBar;