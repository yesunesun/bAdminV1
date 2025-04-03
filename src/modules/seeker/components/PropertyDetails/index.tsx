// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 3.0.0
// Last Modified: 03-04-2025 18:00 IST
// Purpose: Enhanced property details page with improved responsive layout and visual hierarchy

import React from 'react';
import PropertyGallery from './PropertyGallery';
import PropertyInfo from './PropertyInfo';
import PropertyActions from './PropertyActions';
import OwnerContact from './OwnerContact';
import PropertyLocationMap from './PropertyLocationMap';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

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
  const { theme } = useTheme();
  
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6",
          theme === 'ocean' ? "bg-primary/10" : "bg-primary/10"
        )}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3">Property Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Main Content - Takes 5/7 columns on large screens */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Gallery with shadow and rounded corners */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border/20">
            <PropertyGallery 
              images={property.property_images || []} 
            />
          </div>
          
          {/* Property Actions Card */}
          <Card className={cn(
            "rounded-xl shadow-md border-border/40 overflow-hidden",
            theme === 'ocean' ? "bg-card" : "bg-card"
          )}>
            <CardContent className="p-6">
              <PropertyActions 
                propertyId={property.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </CardContent>
          </Card>
          
          {/* Property Information */}
          <PropertyInfo property={property} />
          
          {/* Property Location Map */}
          <Card className={cn(
            "rounded-xl shadow-md border-border/40 overflow-hidden",
            theme === 'ocean' ? "bg-card" : "bg-card"
          )}>
            <CardContent className="p-0">
              <PropertyLocationMap {...mapProps} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Takes 2/7 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Owner Contact Card with enhanced styling */}
            <Card className={cn(
              "rounded-xl shadow-md border-border/40 overflow-hidden",
              theme === 'ocean' ? "bg-card" : "bg-card"
            )}>
              <CardContent className="p-6">
                <OwnerContact 
                  ownerData={property.profiles}
                  propertyTitle={property.title}
                />
              </CardContent>
            </Card>
            
            {/* Additional sidebar content can be added here */}
            {property.property_details?.highlights && (
              <Card className={cn(
                "rounded-xl shadow-md border-border/40 overflow-hidden",
                theme === 'ocean' ? "bg-card" : "bg-card"
              )}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Property Highlights
                  </h3>
                  <ul className="space-y-3">
                    {Array.isArray(property.property_details.highlights) && 
                      property.property_details.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary mt-0.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span className="text-sm">{highlight}</span>
                        </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component with enhanced spacing and animation
const PropertyDetailsSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className={cn(
            "w-full aspect-[16/9] rounded-2xl",
            theme === 'ocean' ? "bg-muted/60" : "bg-muted/60"
          )} />
          
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Price and Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="h-10 w-4/5 rounded-full" />
            <Skeleton className="h-6 w-2/3 rounded-full" />
            
            <div className="p-4 border border-border/40 rounded-xl">
              <Skeleton className="h-12 w-1/3 rounded-full" />
            </div>
          </div>
          
          {/* Property stats skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-56 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
          </div>
          
          {/* Map skeleton */}
          <Card>
            <CardContent className="p-0">
              <Skeleton className="w-full h-80 rounded-xl" />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-full" />
              <Skeleton className="h-5 w-1/2 rounded-full" />
              <Skeleton className="h-5 w-3/4 rounded-full" />
              
              <div className="space-y-3 mt-6">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;