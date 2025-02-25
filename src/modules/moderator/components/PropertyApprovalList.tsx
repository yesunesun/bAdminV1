// src/modules/moderator/components/PropertyApprovalList.tsx
// Version: 2.0.0
// Last Modified: 25-02-2025 20:30 IST
// Purpose: Display and manage property approval listings with filters and actions

import React, { useState, useEffect } from 'react';
import { PropertyDetailModal } from './PropertyDetailModal';
import { PropertyFilters } from './property-approval/PropertyFilters';
import { PropertyTable } from './property-approval/PropertyTable';
import { RejectReasonModal } from './property-approval/RejectReasonModal';
import { usePropertyOwners } from '../hooks/usePropertyOwners';
import { Property } from '@/components/property/types';
import { supabase } from '@/lib/supabase';

interface PropertyApprovalListProps {
  properties: Property[];
  loading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isProcessing: string | null;
}

export function PropertyApprovalList({ 
  properties, 
  loading, 
  onApprove, 
  onReject, 
  isProcessing 
}: PropertyApprovalListProps) {
  // State for filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('draft');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [hasImagesFilter, setHasImagesFilter] = useState<'all' | 'with_images' | 'without_images'>('with_images');
  
  // Modal states
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Get unique locations from properties
  const [locations, setLocations] = useState<string[]>([]);
  
  // Use the custom hook to fetch and manage owners
  const { owners, ownersMap, loadingOwners } = usePropertyOwners(properties);

  // Extract unique locations from properties
  useEffect(() => {
    const getUniqueLocations = () => {
      const citySet = new Set<string>();
      
      properties.forEach(property => {
        if (property.city) {
          citySet.add(property.city);
        }
      });
      
      return Array.from(citySet).sort();
    };
    
    setLocations(getUniqueLocations());
  }, [properties]);

  // Apply all filters to properties
  const filteredProperties = properties.filter(property => {
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    const matchesSearch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPropertyType = propertyTypeFilter === 'all' || 
      property.property_details?.propertyType === propertyTypeFilter;
      
    const matchesLocation = locationFilter === 'all' || 
      property.city === locationFilter;
      
    const matchesOwner = ownerFilter === 'all' || 
      property.owner_id === ownerFilter;
      
    const matchesImages = hasImagesFilter === 'all' || 
      (hasImagesFilter === 'with_images' && property.images && property.images.length > 0) ||
      (hasImagesFilter === 'without_images' && (!property.images || property.images.length === 0));

    return matchesStatus && matchesSearch && matchesPropertyType && 
           matchesLocation && matchesOwner && matchesImages;
  });

  // Handler functions
  const handleReject = (id: string) => {
    setCurrentPropertyId(id);
    setRejectReasonModalOpen(true);
  };

  const confirmReject = async () => {
    if (currentPropertyId && rejectReason.trim()) {
      await onReject(currentPropertyId, rejectReason);
      setRejectReasonModalOpen(false);
      setRejectReason('');
      setCurrentPropertyId(null);
    }
  };
  
  // Handle property updates (such as image removal)
  const handlePropertyUpdated = () => {
    // This would typically trigger a re-fetch of the affected property
    // But since our component receives properties from a parent, we'll pass this up
    // A real implementation would likely have a callback to the parent or use context
    console.log('Property was updated (image removed)');
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  // Get all unique property types for filter options
  const getAllPropertyTypes = () => {
    const types = properties
      .map(p => p.property_details?.propertyType)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return types;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Component */}
      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        propertyTypeFilter={propertyTypeFilter}
        setPropertyTypeFilter={setPropertyTypeFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        ownerFilter={ownerFilter}
        setOwnerFilter={setOwnerFilter}
        hasImagesFilter={hasImagesFilter}
        setHasImagesFilter={setHasImagesFilter}
        propertyTypes={getAllPropertyTypes()}
        locations={locations}
        owners={owners}
      />

      {/* Property Table Component */}
      <PropertyTable 
        filteredProperties={filteredProperties}
        ownersMap={ownersMap}
        isProcessing={isProcessing}
        onApprove={onApprove}
        handleReject={handleReject}
        handleViewProperty={handleViewProperty}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        propertyTypeFilter={propertyTypeFilter}
        locationFilter={locationFilter}
        ownerFilter={ownerFilter}
        hasImagesFilter={hasImagesFilter}
      />

      {/* Reject Reason Modal Component */}
      <RejectReasonModal 
        isOpen={rejectReasonModalOpen}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onCancel={() => {
          setRejectReasonModalOpen(false);
          setRejectReason('');
          setCurrentPropertyId(null);
        }}
        onConfirm={confirmReject}
      />

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
}