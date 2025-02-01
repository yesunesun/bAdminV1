// src/components/property/ImageUploadSection.tsx
// Version: 1.4.0
// Last Modified: 2025-02-01T11:30:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { 
  X, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from './image-upload/hooks/useImageUpload';
import { UploadArea } from './image-upload/components/UploadArea';

interface ImageUploadSectionProps {
  propertyId: string;
  onUploadComplete: () => void;
  onPrevious: () => void;
}

export function ImageUploadSection({ 
  propertyId, 
  onUploadComplete, 
  onPrevious 
}: ImageUploadSectionProps) {
  const {
    images,
    previews,
    error,
    uploading,
    uploadProgress,
    primaryImageIndex,
    handleFileSelect,
    removeImage,
    setPrimaryImageIndex
  } = useImageUpload(propertyId, onUploadComplete);

  const MAX_IMAGES = 10;

  return (
    <FormSection
      title="Property Images"
      description="Add high-quality photos of your property"
    >
      <div className="space-y-4">
        {/* Upload Area */}
        <UploadArea
          images={images}
          onFileSelect={handleFileSelect}
          disabled={uploading}
        />

        {/* Image Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div 
                key={index}
                className={cn(
                  "relative group",
                  "aspect-[4/3]",
                  "rounded-lg overflow-hidden",
                  "border-2",
                  primaryImageIndex === index ? "border-indigo-500" : "border-slate-200"
                )}
              >
                <img 
                  src={preview} 
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setPrimaryImageIndex(index)}
                      className={cn(
                        "p-1.5 rounded-full",
                        "transition-colors duration-200",
                        primaryImageIndex === index 
                          ? "bg-indigo-500 text-white"
                          : "bg-white/90 text-slate-600 hover:bg-white"
                      )}
                      title={primaryImageIndex === index ? "Primary image" : "Set as primary"}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors duration-200"
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Upload Progress */}
                  {uploading && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-md px-2 py-1">
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Photo Requirements
          </h4>
          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
            <li>Upload up to {MAX_IMAGES} photos</li>
            <li>First image will be the primary photo</li>
            <li>Maximum size: 5MB per image</li>
            <li>Supported formats: JPG, PNG</li>
          </ul>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-start pt-4 border-t">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-lg hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-2 focus:ring-slate-200"
          >
            Previous
          </button>
        </div>
      </div>
    </FormSection>
  );
}