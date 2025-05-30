// src/pages/SearchPage.tsx
// Version: 3.0.0
// Last Modified: 01-06-2025 15:30 IST
// Purpose: Modern search page following clean PropFind-style design with our data

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X, XCircle } from 'lucide-react';

// Property types and their subtypes
const PROPERTY_TYPES = {
  residential: {
    label: 'Residential',
    subtypes: {
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'House',
      studio: 'Studio',
      duplex: 'Duplex',
      penthouse: 'Penthouse',
      farmhouse: 'Farmhouse'
    }
  },
  commercial: {
    label: 'Commercial',
    subtypes: {
      office_space: 'Office Space',
      coworking: 'Co-Working',
      shop: 'Shop',
      showroom: 'Showroom',
      godown_warehouse: 'Godown/Warehouse',
      industrial_shed: 'Industrial Shed',
      industrial_building: 'Industrial Building',
      other_business: 'Other Business'
    }
  },
  land: {
    label: 'Land',
    subtypes: {
      residential_plot: 'Residential Plot',
      commercial_plot: 'Commercial Plot',
      agricultural_land: 'Agricultural Land',
      industrial_land: 'Industrial Land',
      mixed_use_land: 'Mixed-use Land'
    }
  },
  pghostel: {
    label: 'PG/Hostel',
    subtypes: {
      single_sharing: 'Single Sharing',
      double_sharing: 'Double Sharing',
      triple_sharing: 'Triple Sharing',
      four_sharing: 'Four Sharing',
      dormitory: 'Dormitory'
    }
  },
  flatmates: {
    label: 'Flatmates',
    subtypes: {
      single_sharing: 'Single Sharing',
      double_sharing: 'Double Sharing',
      triple_sharing: 'Triple Sharing',
      four_sharing: 'Four Sharing'
    }
  }
};

// Coworking specific subtypes
const COWORKING_SUBTYPES = {
  private_office: 'Private Office',
  dedicated_desk: 'Dedicated Desk',
  hot_desk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  conference_room: 'Conference Room',
  event_space: 'Event Space',
  virtual_office: 'Virtual Office'
};

// Buy/Rent options
const TRANSACTION_TYPES = {
  buy: 'Buy',
  rent: 'Rent'
};

// BHK types for residential properties
const BHK_TYPES = {
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  '3bhk': '3 BHK',
  '4bhk': '4 BHK',
  '5bhk': '5+ BHK',
  'studio': 'Studio'
};

// Major cities and districts in Telangana
const TELANGANA_LOCATIONS = {
  hyderabad: 'Hyderabad',
  secunderabad: 'Secunderabad',
  warangal: 'Warangal',
  nizamabad: 'Nizamabad',
  karimnagar: 'Karimnagar',
  khammam: 'Khammam',
  mahbubnagar: 'Mahbubnagar',
  nalgonda: 'Nalgonda',
  adilabad: 'Adilabad',
  medak: 'Medak',
  rangareddy: 'Rangareddy',
  sangareddy: 'Sangareddy',
  siddipet: 'Siddipet',
  vikarabad: 'Vikarabad'
};

// Price ranges
const PRICE_RANGES = {
  'under-10l': 'Under ₹10L',
  '10l-25l': '₹10L - ₹25L', 
  '25l-50l': '₹25L - ₹50L',
  '50l-75l': '₹50L - ₹75L',
  '75l-1cr': '₹75L - ₹1Cr',
  '1cr-2cr': '₹1Cr - ₹2Cr',
  '2cr-3cr': '₹2Cr - ₹3Cr',
  '3cr-5cr': '₹3Cr - ₹5Cr',
  '5cr-10cr': '₹5Cr - ₹10Cr',
  'above-10cr': 'Above ₹10Cr'
};

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('any');
  const [transactionType, setTransactionType] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('');
  const [selectedBHK, setSelectedBHK] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  const handleSearch = () => {
    console.log('Search initiated with:', {
      searchQuery,
      location: selectedLocation,
      transactionType,
      propertyType: selectedPropertyType,
      subType: selectedSubType,
      bhkType: selectedBHK,
      priceRange: selectedPriceRange
    });
  };

  const handlePropertyTypeChange = (value: string) => {
    setSelectedPropertyType(value);
    setSelectedSubType(''); // Reset subtype when property type changes
    setSelectedBHK(''); // Reset BHK when property type changes
    
    // If "Any Type" is selected, also reset subtype and BHK to "Any"
    if (value === 'any') {
      setSelectedSubType('any');
      setSelectedBHK('any');
    }
  };

  const getSubTypes = () => {
    if (!selectedPropertyType) {
      return {};
    }
    
    // Special case for coworking space
    if (selectedPropertyType === 'commercial' && selectedSubType === 'coworking') {
      return COWORKING_SUBTYPES;
    }
    
    // For PG/Hostel and Flatmates, return room types
    if (selectedPropertyType === 'pghostel' || selectedPropertyType === 'flatmates') {
      return PROPERTY_TYPES[selectedPropertyType].subtypes;
    }
    
    // Default case
    if (PROPERTY_TYPES[selectedPropertyType as keyof typeof PROPERTY_TYPES]) {
      return PROPERTY_TYPES[selectedPropertyType as keyof typeof PROPERTY_TYPES].subtypes;
    }
    
    return {};
  };

  const getSubtypeLabel = () => {
    if (selectedPropertyType === 'pghostel' || selectedPropertyType === 'flatmates') {
      return 'Room Type';
    }
    if (selectedPropertyType === 'commercial' && selectedSubType === 'coworking') {
      return 'Space Type';
    }
    return 'Subtype';
  };

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case 'transactionType':
        setTransactionType('');
        break;
      case 'propertyType':
        setSelectedPropertyType('');
        setSelectedSubType('');
        setSelectedBHK('');
        break;
      case 'subType':
        setSelectedSubType('');
        break;
      case 'bhkType':
        setSelectedBHK('');
        break;
      case 'priceRange':
        setSelectedPriceRange('');
        break;
    }
  };

  const clearAllFilters = () => {
    setTransactionType('');
    setSelectedPropertyType('');
    setSelectedSubType('');
    setSelectedBHK('');
    setSelectedPriceRange('');
    setSelectedLocation('any');
  };

  const hasActiveFilters = transactionType || selectedPropertyType || selectedSubType || selectedBHK || selectedPriceRange || (selectedLocation && selectedLocation !== 'any');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Search Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            {/* Location on mobile */}
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 w-fit">
              <MapPin className="h-4 w-4" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="border-0 bg-transparent text-white placeholder:text-white/80 focus:ring-0 h-auto p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  {Object.entries(TELANGANA_LOCATIONS).map(([key, city]) => (
                    <SelectItem key={key} value={key}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search bar and button on mobile */}
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Search by property name, location, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50"
              />
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg whitespace-nowrap"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Location */}
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 min-w-[140px]">
              <MapPin className="h-4 w-4" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="border-0 bg-transparent text-white placeholder:text-white/80 focus:ring-0 h-auto p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  {Object.entries(TELANGANA_LOCATIONS).map(([key, city]) => (
                    <SelectItem key={key} value={key}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Input
                type="text"
                placeholder="Search by property name, location, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-4 text-slate-900 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Buy/Rent Filter */}
              <Select value={transactionType} onValueChange={setTransactionType}>
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
              <Select value={selectedPropertyType} onValueChange={handlePropertyTypeChange}>
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
                value={selectedSubType} 
                onValueChange={setSelectedSubType}
                disabled={!selectedPropertyType || selectedPropertyType === 'any'}
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
              {selectedPropertyType === 'residential' && (
                <Select value={selectedBHK} onValueChange={setSelectedBHK}>
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
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
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

            {/* Active Filter Tags and Clear All */}
            <div className="flex items-center justify-end gap-2 flex-wrap min-h-[40px] lg:min-w-[200px]">
              {transactionType && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {TRANSACTION_TYPES[transactionType as keyof typeof TRANSACTION_TYPES]}
                  <button 
                    onClick={() => clearFilter('transactionType')}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedPropertyType && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {PROPERTY_TYPES[selectedPropertyType as keyof typeof PROPERTY_TYPES].label}
                  <button 
                    onClick={() => clearFilter('propertyType')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedSubType && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {getSubTypes()[selectedSubType]}
                  <button 
                    onClick={() => clearFilter('subType')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedBHK && (
                <div className="flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {BHK_TYPES[selectedBHK as keyof typeof BHK_TYPES]}
                  <button 
                    onClick={() => clearFilter('bhkType')}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedPriceRange && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {PRICE_RANGES[selectedPriceRange as keyof typeof PRICE_RANGES]}
                  <button 
                    onClick={() => clearFilter('priceRange')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Clear All */}
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  title="Clear All Filters"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Search Results
          </h2>
          <p className="text-slate-600 mb-6">
            Your search results will appear here. This is Phase 1 - UI only.
          </p>
          
          {/* Current Search Summary */}
          <div className="bg-slate-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-slate-800 mb-2">Current Search:</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><strong>Query:</strong> {searchQuery || 'None'}</p>
              <p><strong>Location:</strong> {selectedLocation ? (selectedLocation === 'any' ? 'Any Location' : TELANGANA_LOCATIONS[selectedLocation as keyof typeof TELANGANA_LOCATIONS]) : 'Any'}</p>
              <p><strong>Transaction Type:</strong> {transactionType ? (transactionType === 'any' ? 'Any' : TRANSACTION_TYPES[transactionType as keyof typeof TRANSACTION_TYPES]) : 'Any'}</p>
              <p><strong>Property Type:</strong> {selectedPropertyType ? (selectedPropertyType === 'any' ? 'Any Type' : PROPERTY_TYPES[selectedPropertyType as keyof typeof PROPERTY_TYPES].label) : 'Any'}</p>
              <p><strong>{getSubtypeLabel()}:</strong> {selectedSubType ? (selectedSubType === 'any' ? `Any ${getSubtypeLabel()}` : getSubTypes()[selectedSubType]) : 'Any'}</p>
              {selectedPropertyType === 'residential' && <p><strong>BHK Type:</strong> {selectedBHK ? (selectedBHK === 'any' ? 'Any BHK' : BHK_TYPES[selectedBHK as keyof typeof BHK_TYPES]) : 'Any'}</p>}
              <p><strong>Price Range:</strong> {selectedPriceRange ? (selectedPriceRange === 'any' ? 'Any Price' : PRICE_RANGES[selectedPriceRange as keyof typeof PRICE_RANGES]) : 'Any'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;