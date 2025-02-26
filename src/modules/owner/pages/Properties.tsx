// src/modules/owner/pages/Properties.tsx
// Version: 3.0.0
// Last Modified: 27-02-2025 00:15 IST
// Purpose: Properties page using PropertyList component and owner hook

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePropertyOwner } from '../hooks/usePropertyOwner';
import { PropertyList } from '../components/property/PropertyList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function Properties() {
  const { 
    properties, 
    loading, 
    error, 
    updating,
    handleDeleteProperty,
    handleTogglePublishStatus,
    refreshProperties 
  } = usePropertyOwner();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner message="Loading properties..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={() => refreshProperties()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Link to="/properties/list">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            List New Property
          </Button>
        </Link>
      </div>

      <PropertyList 
        properties={properties}
        loading={false} // We're handling loading state outside the component
        onDelete={handleDeleteProperty}
        onTogglePublish={handleTogglePublishStatus}
        isUpdating={updating}
      />
    </div>
  );
}