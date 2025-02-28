// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 2.0.0
// Last Modified: 29-02-2025 16:30 IST
// Purpose: Enhanced property details container with improved layout and features

import React from 'react';
import PropertyGallery from './PropertyGallery';
import PropertyInfo from './PropertyInfo';
import PropertyActions from './PropertyActions';
import OwnerContact from './OwnerContact';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyDetailsProps {
  property: PropertyType & { 
    profiles?: { id: string; email: string; phone: string; role: string } | null
  };
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ 
  property, 
  isLiked, 
  onToggleLike,
  isLoading
}) => {
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-muted-foreground mt-2">
          This property may have been removed or is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <PropertyGallery 
            images={property.property_images || []} 
          />
          
          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <PropertyActions 
                propertyId={property.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </CardContent>
          </Card>
          
          {/* Property Information */}
          <Card>
            <CardContent className="p-6">
              <PropertyInfo property={property} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <div className="sticky top-24">
            <OwnerContact 
              ownerData={property.profiles}
              propertyTitle={property.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component remains unchanged
const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="w-full aspect-[16/9] rounded-lg" />
          
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
              
              <div className="space-y-3 mt-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;