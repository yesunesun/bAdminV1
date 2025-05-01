// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 5.1.0
// Last Modified: 01-05-2025 21:30 IST
// Purpose: Enhanced debugging for property data loading

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyDetails from '../components/PropertyDetails';
import { Button } from '@/components/ui/button';
import { HomeIcon, ChevronLeftIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { property, loading, error, isLiked, toggleLike } = usePropertyDetails(refreshKey);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug the raw property data structure
  useEffect(() => {
    console.log('[PropertyDetailPage] Rendering with ID:', id);
    console.log('[PropertyDetailPage] Refresh key:', refreshKey);
    console.log('[PropertyDetailPage] Loading state:', loading);
    console.log('[PropertyDetailPage] Property version:', property?._version || 'v1');
    
    if (property) {
      // Force console log of raw property data
      console.log('[PropertyDetailPage] FORCE RAW PROPERTY DATA:', JSON.stringify(property, null, 2));
      
      // Check if property exists but basicDetails is missing
      if (property && !property.basicDetails) {
        console.error('[PropertyDetailPage] WARNING: Property exists but basicDetails is missing!');
        console.log('[PropertyDetailPage] Available property keys:', Object.keys(property));
      }
      
      // Detailed debugging for v2 properties
      if (property._version === 'v2') {
        console.log('====== DEBUGGING V2 PROPERTY DATA ======');
        console.log('Raw property data:', property);
        
        // Debug core fields
        console.log('Property ID:', property.id);
        console.log('Title:', property.title);
        
        // Flow data
        if (property.flow) {
          console.log('Flow data:', {
            category: property.flow.category,
            listingType: property.flow.listingType
          });
        } else {
          console.log('Flow data: not available');
        }
        
        // Rental data
        if (property.rental) {
          console.log('Rental data:', {
            rentAmount: property.rental.rentAmount,
            type: typeof property.rental.rentAmount,
            availableFrom: property.rental.availableFrom,
            furnishingStatus: property.rental.furnishingStatus
          });
        } else {
          console.log('Rental data: not available');
        }
        
        // Basic details
        if (property.basicDetails) {
          console.log('Basic details:', {
            bhkType: property.basicDetails.bhkType,
            type_bhkType: typeof property.basicDetails.bhkType,
            bathrooms: property.basicDetails.bathrooms,
            type_bathrooms: typeof property.basicDetails.bathrooms,
            builtUpArea: property.basicDetails.builtUpArea,
            type_builtUpArea: typeof property.basicDetails.builtUpArea
          });
        } else {
          console.log('Basic details: not available');
        }
        
        // Location data
        if (property.location) {
          console.log('Location data:', {
            address: property.location.address,
            city: property.location.city,
            coordinates: property.location.coordinates
          });
        } else {
          console.log('Location data: not available');
        }
        
        // Feature data
        if (property.features) {
          console.log('Features data:', {
            description: property.features.description,
            amenities: property.features.amenities
          });
        } else {
          console.log('Features data: not available');
        }
        
        console.log('====== END DEBUG ======');
      } else {
        console.log('[PropertyDetailPage] Standard v1 property data loaded');
        // Check for property_details which is typical in v1 format
        if (property.property_details) {
          console.log('[PropertyDetailPage] V1 property_details:', property.property_details);
        } else {
          console.error('[PropertyDetailPage] WARNING: V1 format missing property_details!');
        }
      }
      
      console.log('[PropertyDetailPage] Image count:', property?.property_images?.length || 0);
    } else if (!loading) {
      console.error('[PropertyDetailPage] Property data is null after loading completed!');
    }
  }, [id, property, loading, refreshKey]);

  // Reset refresh flag when loading completes
  useEffect(() => {
    if (!loading && isRefreshing) {
      setIsRefreshing(false);
      
      // Show success toast after refresh completes
      toast({
        title: "Data Refreshed",
        description: "Property data has been refreshed",
        variant: "default"
      });
    }
  }, [loading, isRefreshing, toast]);

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle like toggle with toast notification
  const handleToggleLike = async () => {
    if (!id) {
      console.error('[PropertyDetailPage] No property ID available for toggle like');
      return { success: false, message: 'Property ID not available' };
    }
    
    console.log('[PropertyDetailPage] Toggling like for property:', id);
    const result = await toggleLike();
    
    if (result.success) {
      toast({
        title: isLiked ? "Property removed from saved items" : "Property saved",
        description: result.message,
        variant: "default"
      });
    } else {
      toast({
        title: "Action failed",
        description: result.message,
        variant: "destructive"
      });
    }
    
    return result;
  };

  // Function to force refresh the property data
  const handleDataRefresh = useCallback(() => {
    console.log('[PropertyDetailPage] Forcing data refresh with new key');
    setIsRefreshing(true);
    
    // Use a timestamp to guarantee uniqueness
    const timestamp = Date.now();
    setRefreshKey(timestamp);
    
    // Show temporary refresh toast
    toast({
        title: "Refreshing Data",
        description: "Please wait while we update the property data...",
        variant: "default",
        duration: 1500
    });
  }, [toast]);
  
  // Manual refresh button handler
  const handleManualRefresh = () => {
    console.log('[PropertyDetailPage] Manual refresh triggered');
    handleDataRefresh();
  };
  
  // Get property type for breadcrumbs
  const getPropertyTypeForBreadcrumb = () => {
    if (!property) return "Property";
    
    if (property._version === 'v2' && property.flow) {
      return property.flow.category === 'residential' 
        ? 'Residential' 
        : property.flow.category === 'commercial'
          ? 'Commercial'
          : 'Property';
    } else if (property.property_details?.propertyType) {
      return property.property_details.propertyType;
    }
    
    return "Property";
  };
  
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Breadcrumb navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center text-sm overflow-x-auto scrollbar-hide">
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center min-w-fit">
              <HomeIcon className="h-4 w-4 mr-1" />
              <span>Home</span>
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/properties" className="text-muted-foreground hover:text-foreground min-w-fit">
              Properties
            </Link>
            {property && (
              <>
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {property._version === 'v2' 
                    ? (property.basicDetails?.title || property.title || "Property Details")
                    : (property.title || "Property Details")}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing || loading}
              className="text-xs flex items-center"
              title="Refresh property data"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-xs"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        </div>
      </div>
      
      {/* Debug info - only in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div className="container mx-auto px-4 pt-2">
          <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border">
            <div>Property ID: {id}</div>
            <div>Property Version: {property?._version || 'v1'}</div>
            <div>Refresh Key: {refreshKey}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Image Count: {property?.property_images?.length || 0}</div>
            <div>Has Basic Details: {property?.basicDetails ? 'Yes' : 'No'}</div>
            <div>Has Property Details: {property?.property_details ? 'Yes' : 'No'}</div>
            {property?._version === 'v2' && (
              <>
                <div>Category: {property?.flow?.category}</div>
                <div>Listing Type: {property?.flow?.listingType}</div>
                <div>Rent Amount: {property?.rental?.rentAmount}</div>
                <div>BHK Type: {property?.basicDetails?.bhkType}</div>
                <div>Built-up Area: {property?.basicDetails?.builtUpArea} {property?.basicDetails?.builtUpAreaUnit}</div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto px-4 pt-6">
        <PropertyDetails
          property={property}
          isLiked={isLiked}
          onToggleLike={handleToggleLike}
          isLoading={loading}
          onRefresh={handleDataRefresh}
        />
      </div>
    </div>
  );
};

export default PropertyDetailPage;