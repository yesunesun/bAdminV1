// src/components/property/PropertyList.tsx
// Version: 1.2.0
// Last Modified: 06-02-2025 17:00 IST
// Updates: Changed "Add Property" to "List your Property" and updated route path

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { Property } from './types';

interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: 'draft' | 'published') => void;
  isUpdating: string | null;
}

const checkPropertyCompletion = (property: Property) => {
  const requiredFields = [
    'propertyType',
    'bhkType',
    'zone',
    'locality',
    'address',
    'rentAmount',
    'maintenance',
    'availableFrom',
    'furnishing',
    'parking'
  ];

  const details = property.property_details;
  if (!details) return { isComplete: false, missingFields: ['all details'], hasImages: false };

  const missingFields = requiredFields.filter(field => !details[field as keyof typeof details]);
  const hasImages = property.images && property.images.length > 0;
  const hasAllRequiredFields = missingFields.length === 0;

  return {
    isComplete: hasAllRequiredFields && hasImages,
    missingFields,
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

  const filteredProperties = properties.filter(property => {
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesSearch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const price = parseFloat(property.property_details.rentAmount);
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && price < 20000) ||
      (priceRange === 'medium' && price >= 20000 && price < 40000) ||
      (priceRange === 'high' && price >= 40000);

    return matchesStatus && matchesSearch && matchesPrice;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
        <Link
          to="/properties/list"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          List your Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all' || priceRange !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating a new property listing'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
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
          </ul>
        </div>
      )}
    </div>
  );
}