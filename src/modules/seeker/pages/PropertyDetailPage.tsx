// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 3.5.0
// Last Modified: 30-04-2025 19:15 IST
// Purpose: Renamed button, keeps it enabled, and improved refresh handling

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

  // Debug the component render and property data
  useEffect(() => {
    console.log('[PropertyDetailPage] Rendering with ID:', id);
    console.log('[PropertyDetailPage] Refresh key:', refreshKey);
    console.log('[PropertyDetailPage] Loading state:', loading);
    console.log('[PropertyDetailPage] Image count:', property?.property_images?.length || 0);
    
    if (property?.property_images?.length) {
      console.log('[PropertyDetailPage] First few images:', 
        property.property_images.slice(0, 3).map(img => ({ id: img.id, url: img.url }))
      );
    }
  }, [id, property, loading, refreshKey]);

  // Reset refresh flag when loading completes
  useEffect(() => {
    if (!loading && isRefreshing) {
      setIsRefreshing(false);
      
      // Show success toast after refresh completes
      toast({
        title: "Images Updated",
        description: "Property images have been refreshed",
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
        title: "Refreshing Images",
        description: "Please wait while we update the property images...",
        variant: "default",
        duration: 1500
    });
  }, [toast]);
  
  // Manual refresh button handler
  const handleManualRefresh = () => {
    console.log('[PropertyDetailPage] Manual refresh triggered');
    handleDataRefresh();
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
                  {property.title || "Property Details"}
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
            <div>Refresh Key: {refreshKey}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Image Count: {property?.property_images?.length || 0}</div>
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