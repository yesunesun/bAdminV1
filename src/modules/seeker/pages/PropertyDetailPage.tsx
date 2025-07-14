// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 6.0.0
// Last Modified: 27-05-2025 15:00 IST
// Purpose: Optimized property detail page with improved image loading

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyDetails from '../components/PropertyDetails';
import { Button } from '@/components/ui/button';
import { HomeIcon, ChevronLeftIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { imageService } from '@/services/imageService';
import { useVisitedProperties } from '@/contexts/VisitedPropertiesContext';
import { fastImageService } from '@/modules/seeker/components/PropertyItem/services/fastImageService';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { property, loading, error, isLiked, toggleLike } = usePropertyDetails(refreshKey);
  const { addVisit } = useVisitedProperties();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [directUrls, setDirectUrls] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  const imagePreloadRef = useRef<boolean>(false);

  // Reset refresh flag when loading completes
  useEffect(() => {
    if (!loading && isRefreshing) {
      setIsRefreshing(false);
      
      toast({
        title: "Data Refreshed",
        description: "Property data has been refreshed",
        variant: "default"
      });
    }
  }, [loading, isRefreshing, toast]);

  // Track property visit when property loads
  useEffect(() => {
    if (property && id && !loading) {
      // Generate proper image URL using the same logic as PropertyItem
      const getImageUrl = () => {
        console.log('🔍 [PropertyDetailPage] Getting image for visit tracking:', {
          propertyId: property.id,
          primary_image: property.primary_image,
          property_images: property.property_images,
          property_details: property.property_details
        });
        
        try {
          // Method 1: Use primary_image field if available
          if (property.primary_image && property.primary_image.trim()) {
            console.log('✅ [PropertyDetailPage] Found primary_image:', property.primary_image);
            // If it's already a full URL, use it
            if (property.primary_image.startsWith('http') || property.primary_image.startsWith('/')) {
              console.log('✅ [PropertyDetailPage] Using direct URL:', property.primary_image);
              return property.primary_image;
            }
            // If it's not an optimization file, construct the URL
            if (!property.primary_image.startsWith('optimization_')) {
              const constructedUrl = fastImageService.getPublicImageUrl(property.id, property.primary_image);
              console.log('✅ [PropertyDetailPage] Constructed URL:', constructedUrl);
              return constructedUrl;
            }
          }
          
          // Method 2: Check for imageFiles in property_details
          const details = property.property_details || {};
          console.log('🔍 [PropertyDetailPage] Checking imageFiles:', details.imageFiles);
          
          if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
            const primaryImage = details.imageFiles.find((img: any) => img.isPrimary);
            const imageToUse = primaryImage || details.imageFiles[0];
            
            console.log('🔍 [PropertyDetailPage] Selected imageFile:', imageToUse);
            
            if (imageToUse.fileName && !imageToUse.fileName.startsWith('optimization_')) {
              const constructedUrl = fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
              console.log('✅ [PropertyDetailPage] Constructed URL from imageFiles:', constructedUrl);
              return constructedUrl;
            }
          }
          
          // Method 3: Check property_images array
          if (property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
            const primaryImage = property.property_images.find((img: any) => img.is_primary);
            const imageToUse = primaryImage || property.property_images[0];
            
            if (imageToUse.url && imageToUse.url.startsWith('http')) {
              return imageToUse.url;
            }
            
            if (imageToUse.fileName) {
              return fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
            }
          }
          
          // Method 4: Try to find any image in the storage bucket (async fallback)
          console.log('🔄 [PropertyDetailPage] Trying async image search as fallback');
          fastImageService.findFirstImageUrl(property.id).then(asyncUrl => {
            if (asyncUrl !== '/noimage.png') {
              console.log('✅ [PropertyDetailPage] Found async image:', asyncUrl);
              // Update the visited property with the found image
              const updatedProperty = {
                id: property.id,
                title: property.property_details?.flow?.title || property.title || 'Property Listing',
                price: property.price || 0,
                location: property.property_details?.location?.address || property.address || '',
                propertyType: property.property_type || 'residential',
                transactionType: property.property_details?.flow?.listingType || 'rent',
                primary_image: asyncUrl
              };
              addVisit(updatedProperty);
            }
          });
          
          return '/noimage.png';
        } catch (error) {
          console.error('Error generating image URL for visited property:', error);
          return '/noimage.png';
        }
      };

      // Extract relevant data for visited properties
      const visitedProperty = {
        id: property.id,
        title: property.property_details?.flow?.title || property.title || 'Property Listing',
        price: property.price || 0,
        location: property.property_details?.location?.address || property.address || '',
        propertyType: property.property_type || 'residential',
        transactionType: property.property_details?.flow?.listingType || 'rent',
        primary_image: getImageUrl()
      };
      
      console.log('📝 [PropertyDetailPage] Storing visited property:', visitedProperty);
      addVisit(visitedProperty);
    }
  }, [property, id, loading, addVisit]);

  // Optimized image preloading with caching
  useEffect(() => {
    const preloadPropertyImages = async () => {
      if (!id || !property || loading || imagePreloadRef.current) return;
      
      try {
        setIsLoadingImages(true);
        imagePreloadRef.current = true;

        // Extract image file names from property
        const imageFiles: string[] = [];
        
        if (property.property_details?.imageFiles) {
          property.property_details.imageFiles.forEach((img: any) => {
            if (img.fileName && !img.fileName.startsWith('legacy-')) {
              imageFiles.push(img.fileName);
            }
          });
        }

        if (imageFiles.length > 0) {
          // Use the image service to preload all images in parallel
          const urls = await imageService.preloadImages(id, imageFiles);
          setDirectUrls(urls.filter(url => url !== '/noimage.png'));
        }

      } catch (err) {
        console.error('Error preloading images:', err);
      } finally {
        setIsLoadingImages(false);
      }
    };

    preloadPropertyImages();
  }, [id, property, loading]);

  // Cleanup image service on unmount
  useEffect(() => {
    return () => {
      imageService.cleanup();
    };
  }, []);

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle like toggle with toast notification
  const handleToggleLike = async () => {
    if (!id) {
      return { success: false, message: 'Property ID not available' };
    }
    
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
    setIsRefreshing(true);
    imagePreloadRef.current = false; // Reset preload flag
    
    const timestamp = Date.now();
    setRefreshKey(timestamp);
    
    // Clear image service cache
    imageService.cleanup();
    setDirectUrls([]);
    
    toast({
        title: "Refreshing Data",
        description: "Please wait while we update the property data...",
        variant: "default",
        duration: 1500
    });
  }, [toast]);
  
  // Manual refresh button handler
  const handleManualRefresh = () => {
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
              disabled={isRefreshing || loading || isLoadingImages}
              className="text-xs flex items-center"
              title="Refresh property data"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing || isLoadingImages ? 'animate-spin' : ''}`} />
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
      
      {/* Main content */}
      <div className="container mx-auto px-4 pt-6">
        <PropertyDetails
          property={property}
          isLiked={isLiked}
          onToggleLike={handleToggleLike}
          isLoading={loading}
          onRefresh={handleDataRefresh}
          directUrls={directUrls}
        />
      </div>
    </div>
  );
};

export default PropertyDetailPage;