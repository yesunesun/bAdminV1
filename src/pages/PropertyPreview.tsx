import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  status: 'draft' | 'published';
  property_details: {
    propertyType: string;
    bhkType: string;
    floor: string;
    totalFloors: string;
    propertyAge: string;
    facing: string;
    builtUpArea: string;
    zone: string;
    locality: string;
    landmark: string;
    address: string;
    pinCode: string;
    rentalType: string;
    rentAmount: string;
    securityDeposit: string;
    maintenance: string;
    availableFrom: string;
    preferredTenants: string[];
    furnishing: string;
    parking: string;
    description: string;
    amenities: string[];
  };
  images?: { id: string; url: string }[];
}

const PropertyPreview = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Fetch images for the property
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('id, url')
          .eq('property_id', id)
          .order('created_at');

        if (imagesError) throw imagesError;

        setProperty({
          ...propertyData,
          images: imagesData || []
        });
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!property) {
    return (
      <div className="p-4">
        <p className="text-center">Property not found</p>
      </div>
    );
  }

  const { property_details } = property;

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Images Gallery */}
        <Card>
          <CardContent className="p-4">
            {property.images && property.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.images.map((image) => (
                  <div key={image.id} className="aspect-square rounded overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">No images available</div>
            )}
          </CardContent>
        </Card>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="p-4 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <p className="text-gray-600">
                  {property_details.locality}, {property.city}, {property.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p>{property_details.propertyType} - {property_details.bhkType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floor</p>
                  <p>{property_details.floor} of {property_details.totalFloors}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Built-up Area</p>
                  <p>{property_details.builtUpArea}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Facing</p>
                  <p>{property_details.facing}</p>
                </div>
              </div>

              <div>
                <h2 className="font-bold mb-2">Description</h2>
                <p className="text-gray-700">{property_details.description}</p>
              </div>

              <div>
                <h2 className="font-bold mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property_details.amenities?.map((amenity, index) => (
                    <Badge key={index} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Rent</p>
                <p className="text-2xl font-bold">₹{property_details.rentAmount}</p>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Security Deposit:</span>{' '}
                    ₹{property_details.securityDeposit}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Maintenance:</span>{' '}
                    ₹{property_details.maintenance}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Available From</p>
                <p>{property_details.availableFrom}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Preferred Tenants</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {property_details.preferredTenants?.map((tenant, index) => (
                    <Badge key={index} variant="outline">{tenant}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="p-4">
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="md:col-span-2 h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  </div>
);

export default PropertyPreview;