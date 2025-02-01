// File: src/components/property/PropertyList.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { Property } from './types';

interface PropertyListProps {
  properties: Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const price = property.property_details?.rentAmount ? parseFloat(property.property_details.rentAmount) : 0;
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && price < 20000) ||
      (priceRange === 'medium' && price >= 20000 && price < 40000) ||
      (priceRange === 'high' && price >= 40000);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
        <Link
          to="/properties/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
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
      <PropertyCard properties={filteredProperties} />
    </div>
  );
}
