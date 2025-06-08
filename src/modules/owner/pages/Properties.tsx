// src/modules/owner/pages/Properties.tsx
// Version: 3.1.0
// Last Modified: 08-04-2025 11:30 IST
// Purpose: Added confirmation dialog for property deletion

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePropertyOwner } from '../hooks/usePropertyOwner';
import { PropertyList } from '../components/property/PropertyList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  
  // State for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Handle delete button click
  const onDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (propertyToDelete) {
      handleDeleteProperty(propertyToDelete);
      setDeleteConfirmOpen(false);
      setPropertyToDelete(null);
    }
  };

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
        onDelete={onDeleteClick} // Changed to use our delete dialog handler
        onTogglePublish={handleTogglePublishStatus}
        isUpdating={updating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={updating === propertyToDelete}
            >
              {updating === propertyToDelete ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}