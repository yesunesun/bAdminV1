// src/modules/moderator/components/PropertyDetailModal/components/PropertyImageGallery.tsx
// Version: 1.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Display property images with deletion capability

import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { PropertyImage } from '../services/propertyImageService';
import { cn } from '@/lib/utils';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  deletingImageId: string | null;
  successfulImageId: string | null;
  onDeleteImage: (imageId: string) => void;
  isLoading: boolean;
}

export function PropertyImageGallery({
  images,
  deletingImageId,
  successfulImageId,
  onDeleteImage,
  isLoading
}: PropertyImageGalleryProps) {
  if (isLoading) {
    return (
      <div className="mb-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="mb-6 text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No images available for this property</p>
      </div>
    );
  }

  // Track deleted images for success message
  const hasDeletedImages = !!successfulImageId;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Property Images</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {images.map((image) => (
          <div key={image.id} className="relative group rounded-lg overflow-hidden shadow-md">
            <img 
              src={image.url} 
              alt="Property view" 
              className="w-full h-64 sm:h-72 object-cover"
            />
            <button
              className={cn(
                "absolute bottom-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 flex items-center justify-center",
                successfulImageId === image.id 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
              onClick={() => onDeleteImage(image.id)}
              disabled={!!deletingImageId}
              aria-label="Remove image"
            >
              {deletingImageId === image.id ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successfulImageId === image.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        ))}
      </div>
      
      {hasDeletedImages && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 flex items-center">
          <Check className="h-5 w-5 mr-2 text-green-600" />
          <span>Image successfully deleted</span>
        </div>
      )}
    </div>
  );
}