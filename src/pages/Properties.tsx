import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PropertyList } from '@/components/property/PropertyList';
import { Property } from '@/components/property/types';
import { Plus } from 'lucide-react';

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProperties = async () => {
      try {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (propertiesError) throw propertiesError;

        const propertiesWithImages = await Promise.all(
          (propertiesData || []).map(async (property) => {
            const { data: imagesData } = await supabase
              .from('property_images')
              .select('id, url')
              .eq('property_id', property.id);

            return {
              ...property,
              images: imagesData || []
            };
          })
        );

        setProperties(propertiesWithImages);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      setProperties(properties.filter(property => property.id !== deleteId));
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublishStatus = async (propertyId: string, currentStatus: 'draft' | 'published') => {
    try {
      setUpdating(propertyId);
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const tags = newStatus === 'published' ? ['public'] : [];

      const { error } = await supabase
        .from('properties')
        .update({ 
          status: newStatus,
          tags
        })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: newStatus }
          : property
      ));
    } catch (error) {
      console.error('Error updating property status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Properties</h2>
        <Link
          to="/properties/list"
          className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          List your Property
        </Link>
      </div>

      <PropertyList
        properties={properties}
        loading={loading}
        onDelete={handleDelete}
        onTogglePublish={togglePublishStatus}
        isUpdating={updating}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}