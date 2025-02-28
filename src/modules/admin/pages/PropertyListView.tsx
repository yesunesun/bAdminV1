// File 2: src/modules/admin/pages/PropertyListView.tsx
// Version: 1.0.0
// Last Modified: 28-02-2025 15:50 IST
// Purpose: Admin module page to display list of all properties

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Property } from '@/modules/owner/components/property/PropertyFormTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Map, Eye, MoreHorizontal } from 'lucide-react';

export default function PropertyListView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch all properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} properties`);
      
      // Format the properties data
      const formattedProperties = (data || []).map(property => {
        // Process images
        const images = property.property_images
          ? property.property_images.map((img: any) => ({
              id: img.id,
              url: img.url,
              type: img.is_primary ? 'primary' : 'additional',
            }))
          : [];
        
        return {
          ...property,
          images
        };
      });
      
      setProperties(formattedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('PropertyListView component mounted');
    fetchProperties();
  }, [fetchProperties]);

  // Switch to map view
  const handleSwitchToMap = () => {
    console.log('Navigating to property map view');
    navigate('/admin/property-map');
  };

  // Handle view details
  const handleViewDetails = (id: string) => {
    navigate(`/admin/properties/${id}`);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-172px)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-500">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-172px)]">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="bg-red-100 text-red-800 p-2 rounded-full inline-flex items-center justify-center mb-4">
                <span className="text-2xl">!</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Error Loading Properties</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={fetchProperties}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchProperties}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleSwitchToMap}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listed On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {property.images && property.images.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={property.images[0].url}
                                alt={property.title}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                <MoreHorizontal className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {property.property_details?.bhkType} • {property.property_details?.builtUpArea} sq.ft
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">₹ {property.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.city}</div>
                        <div className="text-xs text-gray-500">{property.property_details?.locality}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(property.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(property.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}