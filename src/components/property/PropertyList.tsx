// src/components/property/PropertyList.tsx
// Version: 1.2.2
// Last Modified: 2025-02-02T23:45:00+05:30 (IST)

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { PropertyListProps, Property, CompletionStatus } from './types';

export function PropertyList({ 
  properties = [], 
  loading = false,
  onDelete,
  onTogglePublish,
  isUpdating,
  showOwnerInfo = false 
}: PropertyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Log received properties for debugging
  useEffect(() => {
    console.log('PropertyList received properties:', {
      count: properties.length,
      firstItem: properties[0]
    });
  }, [properties]);

  // Ensure price is a number and handle undefined/null cases
  const normalizePrice = (price: any): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseFloat(price) || 0;
    return 0;
  };

  const filteredProperties = (properties || []).filter(property => {
    if (!property) return false;

    const matchesSearch = !searchQuery || 
      (property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       property.address?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const price = normalizePrice(property.price);
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && price < 20000) ||
      (priceRange === 'medium' && price >= 20000 && price < 40000) ||
      (priceRange === 'high' && price >= 40000);

    return matchesSearch && matchesPrice;
  });

  const getCompletionStatus = (property: Property): CompletionStatus => {
    if (!property) {
      return { isComplete: false, missingFields: [], hasImages: false };
    }

    const requiredFields = [
      'title',
      'address',
      'city',
      'state',
      'price',
      'property_details'
    ];

    const missingFields = requiredFields.filter(field => {
      if (field === 'property_details') {
        return !property.property_details || 
          Object.keys(property.property_details).length === 0;
      }
      return !property[field as keyof Property];
    });

    const hasImages = Array.isArray(property.images) && property.images.length > 0;
    const isComplete = missingFields.length === 0 && hasImages;

    return {
      isComplete,
      missingFields,
      hasImages
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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

      <ul className="space-y-4">
        {filteredProperties.map((property) => {
          // Add additional safety check
          if (!property || !property.id) {
            console.warn('Invalid property data:', property);
            return null;
          }

          return (
            <PropertyCard
              key={property.id}
              property={property}
              completionStatus={getCompletionStatus(property)}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              isUpdating={isUpdating === property.id}
              showOwnerInfo={showOwnerInfo}
            />
          );
        })}
      </ul>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found</p>
        </div>
      )}
    </div>
  );
}