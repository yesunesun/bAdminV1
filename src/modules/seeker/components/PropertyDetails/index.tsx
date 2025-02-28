// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 3.0.0
// Last Modified: 01-03-2025 14:15 IST
// Purpose: Modernized property details layout with enhanced visualization

import React, { useState } from 'react';
import PropertyGallery from './PropertyGallery';
import PropertyInfo from './PropertyInfo';
import PropertyActions from './PropertyActions';
import OwnerContact from './OwnerContact';
import PropertyLocationMap from './PropertyLocationMap';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGridIcon, 
  InfoIcon, 
  MapPinIcon, 
  HeartIcon 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <InfoIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          This property may have been removed or is no longer available.
        </p>
      </div>
    );
  }

  // Extract location details for the map
  const mapProps = {
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zipCode: property.zip_code || '',
    // Use coordinates from property_details if available
    coordinates: property.property_details?.coordinates || undefined
  };

  // Main content for larger screens
  const mainContent = (
    <>
      {/* Gallery */}
      <div className="relative">
        <PropertyGallery 
          images={property.property_images || []} 
        />
        
        {/* Floating actions card for desktop */}
        <div className="hidden lg:block absolute -bottom-6 right-8 z-10">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-4 flex gap-3">
              <PropertyActions 
                propertyId={property.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
                layout="horizontal"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Property Information */}
      <div className="mt-8 mb-6">
        <PropertyInfo property={property} />
      </div>
      
      {/* Mobile Actions - Only visible on small screens */}
      <div className="block lg:hidden mb-6">
        <Card>
          <CardContent className="p-4">
            <PropertyActions 
              propertyId={property.id}
              isLiked={isLiked}
              onToggleLike={onToggleLike}
              layout="vertical"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Property Location Map */}
      <PropertyLocationMap {...mapProps} />
    </>
  );

  // Mobile tabs view
  const mobileTabs = (
    <div className="lg:hidden mt-4">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <LayoutGridIcon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4" />
            <span>Contact</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            <PropertyGallery images={property.property_images || []} />
            <PropertyInfo property={property} />
          </div>
        </TabsContent>
        
        <TabsContent value="map" className="mt-0">
          <PropertyLocationMap {...mapProps} />
        </TabsContent>
        
        <TabsContent value="contact" className="mt-0">
          <OwnerContact 
            ownerData={property.profiles}
            propertyTitle={property.title}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main content - Properties and Map */}
        <div className="lg:col-span-2">
          {/* Show tabs on mobile, full content on desktop */}
          <div className="hidden lg:block">
            {mainContent}
          </div>
          
          {mobileTabs}
        </div>
        
        {/* Sidebar - Owner contact */}
        <div className="hidden lg:block">
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

// Loading skeleton component with enhanced visual design
const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery skeleton */}
          <div className="relative rounded-xl overflow-hidden bg-muted/30">
            <Skeleton className="w-full aspect-[16/9]" />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
          
          {/* Title and price skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-40" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Map skeleton */}
          <Skeleton className="w-full h-80 rounded-lg" />
        </div>
        
        {/* Sidebar skeleton */}
        <div className="hidden lg:block">
          <div className="rounded-xl border border-border p-6 space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <div className="pt-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3 mt-3">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;