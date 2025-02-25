// src/modules/moderator/components/property-approval/PropertyFilters.tsx
// Version: 1.3.0
// Last Modified: 26-02-2025 22:30 IST
// Purpose: Filter controls for property approval list with proper owner email display in dropdown

import React from 'react';
import { Filter, Search, MapPin, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyOwner {
  id: string;
  email: string;
  name?: string;
}

interface PropertyFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'draft' | 'published';
  setStatusFilter: (status: 'all' | 'draft' | 'published') => void;
  propertyTypeFilter: string;
  setPropertyTypeFilter: (type: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  ownerFilter: string;
  setOwnerFilter: (owner: string) => void;
  hasImagesFilter: 'all' | 'with_images' | 'without_images';
  setHasImagesFilter: (imageFilter: 'all' | 'with_images' | 'without_images') => void;
  propertyTypes: string[];
  locations: string[];
  owners: PropertyOwner[];
}

export function PropertyFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  propertyTypeFilter,
  setPropertyTypeFilter,
  locationFilter,
  setLocationFilter,
  ownerFilter,
  setOwnerFilter,
  hasImagesFilter,
  setHasImagesFilter,
  propertyTypes,
  locations,
  owners
}: PropertyFiltersProps) {
  // Create a map of owner IDs to emails from properties data
  const ownerEmailMap: Record<string, string> = {};
  
  // The problem is likely that we need to update this component to use the
  // updated owner information from the PropertyApprovalList component
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-base font-medium mb-4 flex items-center">
        <Filter className="h-4 w-4 mr-2" />
        Filter Properties
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by title, address..."
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
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Pending Approval</SelectItem>
            <SelectItem value="published">Approved</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={propertyTypeFilter} 
          onValueChange={(value: any) => setPropertyTypeFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Property Types</SelectItem>
            {propertyTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={locationFilter} 
          onValueChange={(value: any) => setLocationFilter(value)}
        >
          <SelectTrigger className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={ownerFilter} 
          onValueChange={(value: any) => setOwnerFilter(value)}
        >
          <SelectTrigger className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {owners.map(owner => {
              // Show email if available, otherwise ID
              const displayText = owner.email && owner.email !== owner.id ? 
                owner.email : owner.id;
              
              return (
                <SelectItem key={owner.id} value={owner.id}>
                  {displayText}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <Select 
          value={hasImagesFilter} 
          onValueChange={(value: any) => setHasImagesFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by images" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="with_images">With Images</SelectItem>
            <SelectItem value="without_images">Without Images</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}