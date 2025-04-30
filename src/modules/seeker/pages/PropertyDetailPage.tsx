// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 3.2.0
// Last Modified: 30-04-2025 10:30 IST
// Purpose: Added data refresh mechanism for image uploads

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyDetails from '../components/PropertyDetails';
import { Button } from '@/components/ui/button';
import { HomeIcon, ChevronLeftIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { property, loading, error, isLiked, toggleLike, refreshData } = usePropertyDetails(refreshTrigger);
  const { toast } = useToast();

  // Debug the component render and property data
  useEffect(() => {
    console.log('[PropertyDetailPage] Rendering with ID:', id);
    console.log('[PropertyDetailPage] Property data:', property);
    console.log('[PropertyDetailPage] Loading state:', loading);
    console.log('[PropertyDetailPage] Error state:', error);
    console.log('[PropertyDetailPage] Refresh trigger:', refreshTrigger);
  }, [id, property, loading, error, refreshTrigger]);

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

  // Function to trigger a data refresh (called after image upload)
  const handleDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
          
          <div className="flex items-center">
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
      
      {/* Main content */}
      <div className="container mx-auto px-4 pt-6">
        <PropertyDetails
          property={property}
          isLiked={isLiked}
          onToggleLike={handleToggleLike}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default PropertyDetailPage;