// src/modules/owner/pages/PropertyPreview.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 16:30 IST
// Purpose: Page for previewing property listings

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, IndianRupee, MapPin, Ruler, Users } from 'lucide-react';
import ImageGallery from '../components/property/ImageGallery';
import { propertyService } from '../services/propertyService';
import { Property } from '../components/property/PropertyFormTypes';

const PropertyPreview = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) return;
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
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

  const KeyDetail = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center space-x-2">
      <Icon className="w-5 h-5 text-gray-500" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Title and Price */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <p>{property_details.locality}, {property.city}, {property.state}</p>
            </div>
          </div>
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
            <IndianRupee className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-2xl font-bold text-blue-600">₹{property_details.rentAmount}</p>
              <p className="text-sm text-blue-600">per month</p>
            </div>
          </div>
        </div>

        {/* Image Carousel */}
        <Card>
          <CardContent className="p-6">
            <ImageGallery images={property.images || []} title={property.title} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <KeyDetail 
                  icon={Building}
                  label="Property Type"
                  value={`${property_details.propertyType} - ${property_details.bhkType}`}
                />
                <KeyDetail 
                  icon={Ruler}
                  label="Built-up Area"
                  value={property_details.builtUpArea}
                />
                <KeyDetail 
                  icon={Calendar}
                  label="Available From"
                  value={property_details.availableFrom}
                />
              </div>

              {/* Description */}
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3">About this property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property_details.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rental Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Security Deposit', value: `₹${property_details.securityDeposit}` },
                  { label: 'Maintenance', value: `₹${property_details.maintenance}` },
                  { label: 'Furnishing', value: property_details.furnishing },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Preferred Tenants</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {property_details.preferredTenants?.map((tenant) => (
                    <Badge key={tenant} variant="outline">{tenant}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Features */}
        <Card>
          <CardHeader>
            <CardTitle>Property Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Floor', value: `${property_details.floor} of ${property_details.totalFloors}` },
                { label: 'Facing', value: property_details.facing },
                { label: 'Property Age', value: property_details.propertyAge },
                { label: 'Parking', value: property_details.parking },
              ].map((feature) => (
                <div key={feature.label}>
                  <p className="text-sm font-medium text-gray-500">{feature.label}</p>
                  <p className="mt-1">{feature.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {property_details.amenities?.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="px-3 py-1">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="p-4">
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-96 rounded-lg" /> {/* Carousel skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  </div>
);

export default PropertyPreview;