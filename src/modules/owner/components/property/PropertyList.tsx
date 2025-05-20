// src/modules/owner/components/property/PropertyList.tsx
// Version: 3.0.0
// Last Modified: 20-05-2025 14:50 IST
// Purpose: Updated to support new flow-based property data structure

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { HowItWorks } from './HowItWorks';
import { PropertyType } from './PropertyFormTypes';

// Temporary interface to bridge the gap until full refactoring
interface Property extends Partial<PropertyType> {
  property_details: any;
  images?: Array<{id: string, url: string, isPrimary?: boolean}>;
}

interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: 'draft' | 'published') => void;
  isUpdating: string | null;
}

const checkPropertyCompletion = (property: Property) => {
  // Check if property has basic structure
  if (!property.property_details) {
    return { isComplete: false, missingFields: ['all details'], hasImages: false };
  }
  
  const { flow, steps } = property.property_details;
  
  // Check if property has flow and steps
  if (!flow || !steps) {
    return { isComplete: false, missingFields: ['flow information'], hasImages: false };
  }
  
  const { category, listingType } = flow;
  
  // Determine required steps based on flow type
  let requiredSteps: string[] = [];
  
  if (category === 'residential') {
    if (listingType === 'rent') {
      requiredSteps = ['res_rent_basic_details', 'res_rent_location', 'res_rent_rental', 'res_rent_features'];
    } else if (listingType === 'sale') {
      requiredSteps = ['res_sale_basic_details', 'res_sale_location', 'res_sale_sale_details', 'res_sale_features'];
    } else if (listingType === 'pghostel') {
      requiredSteps = ['res_pg_basic_details', 'res_pg_location', 'res_pg_pg_details', 'res_pg_features'];
    } else if (listingType === 'flatmates') {
      requiredSteps = ['res_flat_basic_details', 'res_flat_location', 'res_flat_flatmate_details', 'res_flat_features'];
    }
  } else if (category === 'commercial') {
    if (listingType === 'rent') {
      requiredSteps = ['com_rent_basic_details', 'com_rent_location', 'com_rent_rental', 'com_rent_features'];
    } else if (listingType === 'sale') {
      requiredSteps = ['com_sale_basic_details', 'com_sale_location', 'com_sale_sale_details', 'com_sale_features'];
    } else if (listingType === 'coworking') {
      requiredSteps = ['com_cow_basic_details', 'com_cow_location', 'com_cow_coworking_details', 'com_cow_features'];
    }
  } else if (category === 'land') {
    requiredSteps = ['land_sale_basic_details', 'land_sale_location', 'land_sale_land_features'];
  }
  
  // Check if each required step exists and is not empty
  const missingSteps = requiredSteps.filter(stepId => {
    return !steps[stepId] || Object.keys(steps[stepId]).length === 0;
  });
  
  const hasImages = property.images && property.images.length > 0;
  const hasAllRequiredSteps = missingSteps.length === 0;
  
  return {
    isComplete: hasAllRequiredSteps && hasImages,
    missingFields: missingSteps,
    hasImages
  };
};

export function PropertyList({ 
  properties, 
  loading, 
  onDelete, 
  onTogglePublish, 
  isUpdating 
}: PropertyListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const getPropertyPrice = (property: Property): number => {
    const flow = property.property_details?.flow;
    const steps = property.property_details?.steps;
    
    if (!flow || !steps) return 0;
    
    const { category, listingType } = flow;
    
    // Get appropriate step ID based on flow type
    let stepId = '';
    let priceField = '';
    
    if (category === 'residential') {
      if (listingType === 'rent') {
        stepId = 'res_rent_rental';
        priceField = 'rentAmount';
      } else if (listingType === 'sale') {
        stepId = 'res_sale_sale_details';
        priceField = 'expectedPrice';
      } else if (listingType === 'pghostel') {
        stepId = 'res_pg_pg_details';
        priceField = 'rentAmount';
      } else if (listingType === 'flatmates') {
        stepId = 'res_flat_flatmate_details';
        priceField = 'rentAmount';
      }
    } else if (category === 'commercial') {
      if (listingType === 'rent') {
        stepId = 'com_rent_rental';
        priceField = 'rentAmount';
      } else if (listingType === 'sale') {
        stepId = 'com_sale_sale_details';
        priceField = 'expectedPrice';
      } else if (listingType === 'coworking') {
        stepId = 'com_cow_coworking_details';
        priceField = 'deskPrice';
      }
    } else if (category === 'land') {
      stepId = 'land_sale_basic_details';
      priceField = 'expectedPrice';
    }
    
    // Return price from the appropriate step
    const price = steps[stepId]?.[priceField] || 0;
    return parseFloat(price) || 0;
  };

  const getPropertyTitle = (property: Property): string => {
    // Try to get title from property_details
    if (property.property_details?.meta?.title) {
      return property.property_details.meta.title;
    }
    
    // Try to get from basic details in appropriate step
    const flow = property.property_details?.flow;
    const steps = property.property_details?.steps;
    
    if (!flow || !steps) return 'Untitled Property';
    
    const { category, listingType } = flow;
    let stepId = '';
    
    if (category === 'residential') {
      stepId = `res_${listingType}_basic_details`;
    } else if (category === 'commercial') {
      stepId = `com_${listingType}_basic_details`;
    } else if (category === 'land') {
      stepId = 'land_sale_basic_details';
    }
    
    const title = steps[stepId]?.title || steps[stepId]?.propertyTitle || 'Untitled Property';
    return title || 'Untitled Property';
  };

  const getPropertyAddress = (property: Property): string => {
    // Try to get location from steps
    const flow = property.property_details?.flow;
    const steps = property.property_details?.steps;
    
    if (!flow || !steps) return '';
    
    const { category, listingType } = flow;
    let stepId = '';
    
    if (category === 'residential') {
      stepId = `res_${listingType}_location`;
    } else if (category === 'commercial') {
      stepId = `com_${listingType}_location`;
    } else if (category === 'land') {
      stepId = 'land_sale_location';
    }
    
    const address = steps[stepId]?.address || '';
    const locality = steps[stepId]?.locality || steps[stepId]?.zone || '';
    
    return `${address} ${locality}`.trim();
  };

  const filteredProperties = properties.filter(property => {
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    // Get data from new property structure
    const title = getPropertyTitle(property);
    const address = getPropertyAddress(property);
    const price = getPropertyPrice(property);
    
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && price < 20000) ||
      (priceRange === 'medium' && price >= 20000 && price < 40000) ||
      (priceRange === 'high' && price >= 40000);

    return matchesStatus && matchesSearch && matchesPrice;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* How It Works Section */}
      {properties.length === 0 && <HowItWorks />}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="low">Below ₹20,000</SelectItem>
            <SelectItem value="medium">₹20,000 - ₹40,000</SelectItem>
            <SelectItem value="high">Above ₹40,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">No properties found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || priceRange !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating a new property listing'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              completionStatus={checkPropertyCompletion(property)}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              isUpdating={isUpdating === property.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}