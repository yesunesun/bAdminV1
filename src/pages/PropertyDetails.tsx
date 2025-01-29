import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, IndianRupee, Ruler, Bath, BedDouble, MapPin, Pencil, Trash2 } from 'lucide-react';

interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  address: string;
  city: string;
  state: string;
  images: { id: string; url: string }[];
}

// Format price in Indian numbering system (lakhs and crores)
const formatIndianPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  });
  return formatter.format(price);
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) throw new Error('Property ID is required');

        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (propertyError) throw propertyError;
        if (!propertyData) throw new Error('Property not found');

        // Fetch property images
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('id, url')
          .eq('property_id', id);

        if (imagesError) throw imagesError;

        setProperty({
          ...propertyData,
          images: imagesData || [],
        });
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!property || !user) return;

      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)
        .eq('owner_id', user.id);

      if (deleteError) throw deleteError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
        <p className="mt-2 text-gray-600">
          {error || "The property you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  const isOwner = user?.id === property.owner_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 h-full">
              {property.images.map((image, index) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Home className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="mt-2 flex items-center bg-green-100 px-4 py-2 rounded-full">
                <IndianRupee className="h-5 w-5 text-green-800" />
                <span className="ml-1 text-xl font-bold text-green-800">
                  {formatIndianPrice(property.price)}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
                  className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center text-gray-600">
            <MapPin className="h-5 w-5" />
            <span className="ml-2">
              {property.address}, {property.city}, {property.state}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="flex items-center">
              <BedDouble className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-lg text-gray-900">
                {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
              </span>
            </div>
            <div className="flex items-center">
              <Bath className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-lg text-gray-900">
                {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              </span>
            </div>
            <div className="flex items-center">
              <Ruler className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-lg text-gray-900">
                {property.square_feet.toLocaleString()} sq ft
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-4 text-gray-600 whitespace-pre-line">{property.description}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
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