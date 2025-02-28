// src/modules/owner/pages/PropertyDetails.tsx
// Version: 3.0.0
// Last Modified: 01-03-2025 14:45 IST
// Purpose: Enhanced property details page with Google Maps and complete property information

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  IndianRupee,
  Ruler,
  Bath,
  BedDouble,
  MapPin,
  Pencil,
  Trash2,
  Calendar,
  Compass,
  Clock,
  Check,
  Building
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { Property } from '../components/property/PropertyFormTypes';
import ImageGallery from '../components/property/ImageGallery';

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
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
        console.log('Fetched property data:', data);
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
      await propertyService.deleteProperty(property.id, user.id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    }
  };

  // Generate Google Maps URL for the address
  const getGoogleMapsUrl = () => {
    if (!property) return '';

    const address = [
      property.address,
      property.city,
      property.state,
      property.zip_code
    ].filter(Boolean).join(', ');

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    if (!property) return '';

    const destination = [
      property.address,
      property.city,
      property.state,
      property.zip_code
    ].filter(Boolean).join(', ');

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
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

  // Prepare images for the gallery
  const galleryImages = property.images || [];

  // Get property details
  const propertyDetails = property.property_details || {};
  const amenities = propertyDetails.amenities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative">
          {galleryImages.length > 0 ? (
            <ImageGallery images={galleryImages} title={property.title} />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
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
                {propertyDetails.rentNegotiable && (
                  <span className="ml-2 text-sm bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    Negotiable
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
                  className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                  aria-label="Edit property"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700"
                  aria-label="Delete property"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center text-gray-600">
            <MapPin className="h-5 w-5" />
            <span className="ml-2">
              {property.address}, {property.city}, {property.state} {property.zip_code}
            </span>
          </div>

          {/* Key Property Features */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-indigo-500" />
              <div className="ml-2">
                <div className="text-sm text-gray-500">Property Type</div>
                <div className="font-medium">{propertyDetails.propertyType || "-"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <BedDouble className="h-6 w-6 text-indigo-500" />
              <div className="ml-2">
                <div className="text-sm text-gray-500">Bedrooms</div>
                <div className="font-medium">{propertyDetails.bhkType || "-"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Bath className="h-6 w-6 text-indigo-500" />
              <div className="ml-2">
                <div className="text-sm text-gray-500">Bathrooms</div>
                <div className="font-medium">{propertyDetails.bathrooms || "-"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Ruler className="h-6 w-6 text-indigo-500" />
              <div className="ml-2">
                <div className="text-sm text-gray-500">Area</div>
                <div className="font-medium">{propertyDetails.builtUpArea || property.square_feet || "-"} sq ft</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-4 text-gray-600 whitespace-pre-line">{propertyDetails.description || property.description || "No description provided."}</p>
          </div>

          {/* Property Specifications */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Property Specifications</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {propertyDetails.propertyAge && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Property Age</div>
                    <div className="font-medium">{propertyDetails.propertyAge}</div>
                  </div>
                </div>
              )}

              {propertyDetails.floor !== undefined && (
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Floor</div>
                    <div className="font-medium">{propertyDetails.floor}</div>
                  </div>
                </div>
              )}

              {propertyDetails.totalFloors && (
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Total Floors</div>
                    <div className="font-medium">{propertyDetails.totalFloors}</div>
                  </div>
                </div>
              )}

              {propertyDetails.facing && (
                <div className="flex items-start">
                  <Compass className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Facing</div>
                    <div className="font-medium">{propertyDetails.facing}</div>
                  </div>
                </div>
              )}

              {propertyDetails.furnishing && (
                <div className="flex items-start">
                  <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Furnishing</div>
                    <div className="font-medium">{propertyDetails.furnishing}</div>
                  </div>
                </div>
              )}

              {propertyDetails.availableFrom && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-500">Available From</div>
                    <div className="font-medium">{propertyDetails.availableFrom}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="ml-2">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                title="Property Location"
                width="100%"
                height="300"
                frameBorder="0"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(
                  [property.address, property.city, property.state, property.zip_code].filter(Boolean).join(', ')
                )}`}
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Google Maps
              </a>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
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