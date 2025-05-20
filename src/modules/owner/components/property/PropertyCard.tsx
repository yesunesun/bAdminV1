// src/modules/owner/components/property/PropertyCard.tsx
// Version: 3.8.0
// Last Modified: 20-05-2025 17:00 IST
// Purpose: Added explicit image debugging and fixed URL construction for new structure

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  IndianRupee, 
  MapPin, 
  Loader2, 
  Pencil, 
  Trash2, 
  Globe, 
  Archive,
  Eye
} from 'lucide-react';
import { PropertyType } from './PropertyFormTypes';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

// Temporary interface to bridge the gap until full refactoring
interface Property extends Partial<PropertyType> {
  property_details: any;
  images?: Array<{id: string, url: string, isPrimary?: boolean}>;
}

interface PropertyCardProps {
  property: Property;
  completionStatus: {
    isComplete: boolean;
    missingFields: string[];
    hasImages: boolean;
  };
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: 'draft' | 'published') => void;
  isUpdating: boolean;
}

// Helper function to check if we're in development mode
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development';
};

// Get property images directly from Supabase storage
const getPropertyImages = async (propertyId: string) => {
  try {
    console.log(`Fetching images for property: ${propertyId}`);
    const { data, error } = await supabase.storage
      .from('property-images-v2')
      .list(propertyId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`Error fetching images for property ${propertyId}:`, error);
      return [];
    }

    console.log(`Found ${data.length} images for property ${propertyId}:`, data);
    return data.map(file => ({
      name: file.name,
      url: `${supabase.storageUrl}/object/public/property-images-v2/${propertyId}/${file.name}`,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || '',
    }));
  } catch (error) {
    console.error(`Error in getPropertyImages for ${propertyId}:`, error);
    return [];
  }
};

// Function to extract images from property data
const extractPropertyImages = (property: Property) => {
  try {
    if (!property) return [];
    
    // Check for images array
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      console.log(`Found ${property.images.length} images in property.images`, property.images);
      return property.images;
    }
    
    // Check in property_details.media
    const mediaImages = property.property_details?.media?.photos?.images;
    if (mediaImages && Array.isArray(mediaImages) && mediaImages.length > 0) {
      console.log(`Found ${mediaImages.length} images in property_details.media.photos.images`, mediaImages);
      return mediaImages;
    }
    
    // Check for other possible image locations
    const legacyImages = property.property_details?.images;
    if (legacyImages && Array.isArray(legacyImages) && legacyImages.length > 0) {
      console.log(`Found ${legacyImages.length} images in property_details.images`, legacyImages);
      return legacyImages;
    }
    
    console.log(`No images found in property data`, property);
    return [];
  } catch (error) {
    console.error(`Error extracting images from property:`, error);
    return [];
  }
};

// Helper function to get the correct image URL
const buildImageUrl = (propertyId: string, imageUrl: string): string => {
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http')) {
    console.log('Using full image URL:', imageUrl);
    return imageUrl;
  }
  
  // If imageUrl has the property ID in it, handle that case
  if (imageUrl.includes(propertyId)) {
    const fullUrl = `${supabase.storageUrl}/object/public/property-images-v2/${imageUrl}`;
    console.log('Built URL with included property ID:', fullUrl);
    return fullUrl;
  }
  
  // Otherwise, construct URL with propertyId/filename pattern
  const fullUrl = `${supabase.storageUrl}/object/public/property-images-v2/${propertyId}/${imageUrl}`;
  console.log('Built URL with property ID folder:', fullUrl);
  return fullUrl;
};

// Helper function to safely get price from new property structure
const getPropertyPrice = (property: Property): number => {
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) return 0;
  
  const { category, listingType } = flow;
  
  // Get appropriate step ID based on flow type
  let stepId = '';
  let priceField = '';
  
  if (category === 'residential') {
    if (listingType === 'rent') {
      stepId = 'res_rent_rental';
      priceField = 'rentAmount';
    } else if (listingType === 'sale') {
      stepId = 'res_sale_sale_details';
      priceField = 'expectedPrice';
    } else if (listingType === 'pghostel') {
      stepId = 'res_pg_pg_details';
      priceField = 'rentAmount';
    } else if (listingType === 'flatmates') {
      stepId = 'res_flat_flatmate_details';
      priceField = 'rentAmount';
    }
  } else if (category === 'commercial') {
    if (listingType === 'rent') {
      stepId = 'com_rent_rental';
      priceField = 'rentAmount';
    } else if (listingType === 'sale') {
      stepId = 'com_sale_sale_details';
      priceField = 'expectedPrice';
    } else if (listingType === 'coworking') {
      stepId = 'com_cow_coworking_details';
      priceField = 'deskPrice';
    }
  } else if (category === 'land') {
    stepId = 'land_sale_basic_details';
    priceField = 'expectedPrice';
  }
  
  // Return price from the appropriate step
  const stepData = steps[stepId] || {};
  const price = stepData[priceField] || 0;
  return parseFloat(price) || 0;
};

// Helper function to get property title
const getPropertyTitle = (property: Property): string => {
  // Try to get title from property_details
  if (property.property_details?.meta?.title) {
    return property.property_details.meta.title;
  }
  
  // Try to get from basic details in appropriate step
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) return 'Untitled Property';
  
  const { category, listingType } = flow;
  let stepId = '';
  
  if (category === 'residential') {
    stepId = `res_${listingType}_basic_details`;
  } else if (category === 'commercial') {
    stepId = `com_${listingType}_basic_details`;
  } else if (category === 'land') {
    stepId = 'land_sale_basic_details';
  }
  
  const stepData = steps[stepId] || {};
  const title = stepData.title || stepData.propertyTitle || 'Untitled Property';
  return title || 'Untitled Property';
};

// Helper function to get property address
const getPropertyAddress = (property: Property): { address: string, city: string } => {
  // Try to get location from steps
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) return { address: 'Unknown Address', city: 'Unknown City' };
  
  const { category, listingType } = flow;
  let stepId = '';
  
  if (category === 'residential') {
    stepId = `res_${listingType}_location`;
  } else if (category === 'commercial') {
    stepId = `com_${listingType}_location`;
  } else if (category === 'land') {
    stepId = 'land_sale_location';
  }
  
  const stepData = steps[stepId] || {};
  const address = stepData.address || 'Unknown Address';
  const city = stepData.city || 'Unknown City';
  
  return { address, city };
};

export function PropertyCard({ 
  property, 
  completionStatus, 
  onDelete, 
  onTogglePublish,
  isUpdating
}: PropertyCardProps) {
  const { theme } = useTheme();
  const { isComplete } = completionStatus;
  const isDraft = property.status === 'draft';
  const [storedImages, setStoredImages] = React.useState<any[]>([]);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  
  useEffect(() => {
    const fetchImages = async () => {
      // Log the incoming property structure for debugging
      console.log('PropertyCard property structure:', {
        id: property.id,
        hasImages: !!property.images,
        imagesLength: property.images?.length || 0,
        hasPropertyDetails: !!property.property_details,
        hasMedia: !!property.property_details?.media,
        flowCategory: property.property_details?.flow?.category,
        flowListingType: property.property_details?.flow?.listingType,
      });
      
      // Get images from the property data
      const extractedImages = extractPropertyImages(property);
      
      if (extractedImages.length > 0) {
        // Find primary image or use the first one
        const mainImage = extractedImages.find(img => img.isPrimary || img.is_primary) || extractedImages[0];
        
        // Log the found image for debugging
        console.log('Found main image in extracted images:', mainImage);
        
        if (mainImage && mainImage.url) {
          // Normalize URL for the image
          const propertyId = property.id || '';
          const url = buildImageUrl(propertyId, mainImage.url);
          setImageUrl(url);
        }
      } else if (property.id) {
        // If no images found in property data, try to fetch directly from storage
        console.log('No images in property data, fetching from storage...');
        const images = await getPropertyImages(property.id);
        
        console.log('Images fetched from storage:', images);
        
        if (images.length > 0) {
          setStoredImages(images);
          setImageUrl(images[0].url);
        }
      }
    };
    
    fetchImages();
  }, [property]);
  
  // Get data from new property structure
  const price = getPropertyPrice(property);
  const title = getPropertyTitle(property);
  const { address, city } = getPropertyAddress(property);
  
  // Determine if the property is for rent or sale
  const flow = property.property_details?.flow;
  const listingType = flow?.listingType || 'rent';
  const isForRent = listingType === 'rent' || listingType === 'pghostel' || listingType === 'flatmates' || listingType === 'coworking';

  // Check if we're in development mode
  const isDevMode = isDevelopmentMode();

  console.log('PropertyCard final rendering state:', {
    propertyId: property.id,
    title,
    price,
    imageUrl
  });

  return (
    <div className="relative overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md border border-border/30">
      {/* Status Badge */}
      <div className={cn(
        "absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-medium",
        isDraft 
          ? "bg-accent text-accent-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        {property.status}
      </div>
      
      {/* Listing Type Badge (For Rent/Sale) */}
      <div className={cn(
        "absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-medium",
        isForRent
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      )}>
        {isForRent ? 'For Rent' : 'For Sale'}
      </div>
      
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            onError={(e) => {
              console.error('Failed to load image:', imageUrl);
              // Set fallback image on error
              (e.target as HTMLImageElement).src = '/noimage.png';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-card-foreground hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-4 w-4 text-primary/70" />
          <span className="line-clamp-1">
            {address}, {city}
          </span>
        </div>
        
        <div className="mb-4 flex items-center font-semibold text-lg text-primary">
          <IndianRupee className="mr-1 h-5 w-5" />
          <span>
            {price.toLocaleString('en-IN')}
          </span>
          {isForRent && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
          )}
        </div>
        
        {/* Actions - Icon buttons in new order: View, Publish/Unpublish, Edit, Delete */}
        <div className="flex justify-between">
          {/* View Button - Always visible, now points to seeker/property */}
          <Link 
            to={`/seeker/property/${property.id}`}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            title="View Property"
          >
            <Eye className="h-5 w-5" />
          </Link>
          
          {/* Publish/Unpublish Button - Always visible and enabled */}
          <button
            onClick={() => onTogglePublish(property.id || '', property.status as 'draft' | 'published')}
            disabled={isUpdating} 
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-full transition-colors",
              isDraft
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
              isUpdating && "cursor-wait opacity-75"
            )}
            title={isDraft ? "Publish Property" : "Unpublish Property"}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isDraft ? (
              <Globe className="h-5 w-5" />
            ) : (
              <Archive className="h-5 w-5" />
            )}
          </button>
          
          {/* Edit Button - Only visible in development mode */}
          {isDevMode && (
            <Link 
              to={`/properties/${property.id}/edit`}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border hover:bg-muted/50 text-card-foreground transition-colors"
              title="Edit Property"
            >
              <Pencil className="h-4.5 w-4.5" />
            </Link>
          )}
          
          {/* Delete Button - Only visible in development mode */}
          {isDevMode && (
            <button
              onClick={() => onDelete(property.id || '')}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border hover:bg-destructive/10 hover:border-destructive/30 text-destructive transition-colors"
              title="Delete Property"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}