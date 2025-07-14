// src/modules/seeker/components/VisitedPropertiesSection.tsx
// Version: 2.0.0
// Purpose: Compact horizontal carousel for recently visited properties

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useVisitedProperties } from '@/contexts/VisitedPropertiesContext';
import { Button } from '@/components/ui/button';
import { formatPrice } from '../services/seekerService';
import { fastImageService } from './PropertyItem/services/fastImageService';

interface VisitedPropertiesSectionProps {
  maxItems?: number;
  showClearAll?: boolean;
}

const VisitedPropertiesSection: React.FC<VisitedPropertiesSectionProps> = ({ 
  maxItems = 8, 
  showClearAll = true 
}) => {
  const { getRecentVisited, clearVisitedHistory, visitedCount } = useVisitedProperties();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [asyncImages, setAsyncImages] = useState<Record<string, string>>({});
  
  const recentVisited = getRecentVisited(maxItems);
  
  // Try to load real images for properties that don't have them
  useEffect(() => {
    const loadAsyncImages = async () => {
      console.log('🔍 [VisitedProperties] Starting async image loading for properties:', recentVisited.map(p => p.id));
      
      for (const property of recentVisited) {
        console.log('🔄 [VisitedProperties] Processing property:', property.id, {
          current_primary_image: property.primary_image,
          shouldTryAsync: !property.primary_image || 
                         property.primary_image === '/noimage.png' || 
                         property.primary_image.startsWith('https://images.unsplash.com/')
        });
        
        // Try async loading for ALL properties to see what we can find
        try {
          console.log('🔄 [VisitedProperties] Calling fastImageService.findFirstImageUrl for:', property.id);
          const foundImage = await fastImageService.findFirstImageUrl(property.id);
          console.log('📸 [VisitedProperties] fastImageService returned:', property.id, foundImage);
          
          if (foundImage !== '/noimage.png') {
            console.log('✅ [VisitedProperties] Found async image:', property.id, foundImage);
            setAsyncImages(prev => ({
              ...prev,
              [property.id]: foundImage
            }));
          } else {
            console.log('❌ [VisitedProperties] No image found in storage for:', property.id);
          }
        } catch (error) {
          console.error('❌ [VisitedProperties] Async image loading failed:', property.id, error);
        }
      }
    };
    
    if (recentVisited.length > 0) {
      loadAsyncImages();
    }
  }, [recentVisited]);
  
  // Debug: Log the visited properties data
  console.log('🔍 [VisitedPropertiesSection] Current visited properties:', {
    visitedCount,
    recentVisited,
    localStorage: localStorage.getItem('bhoomitalli_visited_properties')
  });
  
  if (visitedCount === 0) {
    return null; // Don't show section if no visited properties
  }

  const itemsPerView = 4;
  const totalSlides = Math.ceil(recentVisited.length / itemsPerView);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };
  
  const getCurrentItems = () => {
    const start = currentIndex * itemsPerView;
    const end = start + itemsPerView;
    return recentVisited.slice(start, end);
  };

  // Helper function to get proper image URL
  const getPropertyImageUrl = (property: any) => {
    console.log('🔍 [VisitedProperties] Getting image URL for property:', property.id, {
      primary_image: property.primary_image,
      asyncImage: asyncImages[property.id],
      propertyData: property
    });
    
    try {
      // First priority: Check if we have an async loaded image
      if (asyncImages[property.id]) {
        console.log('✅ [VisitedProperties] Using async loaded image:', asyncImages[property.id]);
        return asyncImages[property.id];
      }
      
      // Second priority: If we have a direct primary_image URL that's not a placeholder
      if (property.primary_image && 
          property.primary_image.trim() && 
          property.primary_image !== '/noimage.png' &&
          !property.primary_image.startsWith('https://images.unsplash.com/')) {
        
        console.log('✅ [VisitedProperties] Found primary_image:', property.primary_image);
        
        // If it's already a full URL, use it
        if (property.primary_image.startsWith('http') || property.primary_image.startsWith('/')) {
          console.log('✅ [VisitedProperties] Using direct URL:', property.primary_image);
          return property.primary_image;
        }
        // If it's not an optimization file, construct the URL
        if (!property.primary_image.startsWith('optimization_')) {
          const constructedUrl = fastImageService.getPublicImageUrl(property.id, property.primary_image);
          console.log('✅ [VisitedProperties] Constructed URL:', constructedUrl);
          if (constructedUrl !== '/noimage.png') {
            return constructedUrl;
          }
        }
      }
      
      console.log('❌ [VisitedProperties] No valid image found, using placeholder with property ID for variety');
      
      // Use a variety of placeholder images based on property ID for visual distinction
      const placeholderImages = [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop', // Modern house
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop', // White house
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300&h=200&fit=crop', // Apartment building
        'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=300&h=200&fit=crop', // House with garden
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop', // Modern exterior
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop', // Traditional house
      ];
      
      // Use property ID to consistently pick the same placeholder for each property
      const index = property.id ? parseInt(property.id.slice(-1), 10) % placeholderImages.length : 0;
      const selectedPlaceholder = placeholderImages[index] || placeholderImages[0];
      
      console.log('🎨 [VisitedProperties] Using placeholder image:', selectedPlaceholder);
      return selectedPlaceholder;
      
    } catch (error) {
      console.error('❌ [VisitedProperties] Error generating image URL:', error);
      return 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop';
    }
  };
  
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const visited = new Date(dateString);
    const diffInMs = now.getTime() - visited.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return visited.toLocaleDateString();
  };

  // Compact collapsed view - enhanced design with better images
  if (!isExpanded) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          {/* Left side - Enhanced header */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {visitedCount}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recently Visited</h3>
              <p className="text-xs text-gray-500">{visitedCount} properties viewed</p>
            </div>
          </div>
          
          {/* Right side - Property previews with better visibility */}
          <div className="flex items-center gap-3">
            {/* Show first 3 property thumbnails with better spacing */}
            <div className="flex gap-2">
              {recentVisited.slice(0, 3).map((property, index) => (
                <Link
                  key={property.id}
                  to={`/seeker/property/${property.id}`}
                  className="group/item relative"
                  title={property.title || 'Property'}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 hover:border-purple-300 hover:scale-105 transition-all duration-200 hover:z-10 relative shadow-sm">
                    <img
                      src={getPropertyImageUrl(property)}
                      alt={property.title || 'Property'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/noimage.png';
                      }}
                    />
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover/item:opacity-20 transition-opacity duration-200" />
                  </div>
                  {/* Enhanced hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-medium">{property.title || 'Property'}</div>
                      {property.price && property.price > 0 && (
                        <div className="text-green-400 text-xs">{formatPrice(property.price)}</div>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* More indicator if there are additional properties */}
              {visitedCount > 3 && (
                <div 
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200 flex flex-col items-center justify-center cursor-pointer hover:from-purple-200 hover:to-blue-200 transition-all duration-200"
                  onClick={() => setIsExpanded(true)}
                >
                  <span className="text-xs font-bold text-purple-700">+{visitedCount - 3}</span>
                  <span className="text-[10px] text-purple-600">more</span>
                </div>
              )}
            </div>
            
            {/* Debug button to manually test image loading */}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const property = recentVisited[0];
                if (property) {
                  console.log('🧪 [DEBUG] Manual image test for:', property.id);
                  try {
                    // Try the storage API directly
                    const { supabase } = await import('@/lib/supabase');
                    const { data: files, error } = await supabase.storage
                      .from('property-images')
                      .list(`${property.id}/`, { limit: 10 });
                    
                    console.log('🧪 [DEBUG] Storage API response:', { files, error });
                    
                    if (files && files.length > 0) {
                      const imageFile = files.find(f => f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i));
                      console.log('🧪 [DEBUG] Found image file:', imageFile);
                      
                      if (imageFile) {
                        const { data: urlData } = supabase.storage
                          .from('property-images')
                          .getPublicUrl(`${property.id}/${imageFile.name}`);
                        console.log('🧪 [DEBUG] Generated URL:', urlData.publicUrl);
                      }
                    }
                  } catch (err) {
                    console.error('🧪 [DEBUG] Manual test failed:', err);
                  }
                }
              }}
              className="text-xs text-gray-500 px-2"
            >
              🧪
            </Button>
            
            {/* View All button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 h-9"
            >
              <span className="text-xs font-medium">View All</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view - carousel with navigation
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 relative">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recently Visited Properties</h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded-full">
            {visitedCount}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {showClearAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearVisitedHistory}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Carousel container */}
      <div className="relative">
        {/* Navigation buttons */}
        {totalSlides > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md border hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md border hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Properties grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
          {getCurrentItems().map((property) => (
            <Link
              key={property.id}
              to={`/seeker/property/${property.id}`}
              className="group block"
            >
              <div className="bg-gray-50 rounded-lg p-3 hover:bg-purple-50 hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-200">
                {/* Property Image */}
                <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-gray-100">
                  <img
                    src={getPropertyImageUrl(property)}
                    alt={property.title || 'Property'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/noimage.png';
                    }}
                  />
                </div>
                
                {/* Property Info */}
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {property.title || 'Property Listing'}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {property.location || 'Location not specified'}
                  </p>
                  {property.price && property.price > 0 && (
                    <p className="text-sm font-semibold text-green-600">
                      {formatPrice(property.price)}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(property.visitedAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Pagination dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitedPropertiesSection;