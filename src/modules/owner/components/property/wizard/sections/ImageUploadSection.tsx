// src/components/property/wizard/sections/ImageUploadSection.tsx
// Version: 1.5.0
// Last Modified: 2025-02-06T17:00:00+05:30 (IST)

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { 
  X, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Star,
  Loader2
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
    existingImages,
    error,
    uploading,
    uploadProgress,
    primaryImageIndex,
    isLoading,
    handleFileSelect,
    removeImage,
    handleSetPrimaryImage,
  } = useImageUpload(propertyId, onUploadComplete);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground">Loading images...</span>
      </div>
    );
  }

  return (
    <FormSection
      title="Property Images"
      description="Add high-quality photos of your property"
    >
      <div className="space-y-4">
        {/* Upload Area */}
        <UploadArea
          images={existingImages}
          onFileSelect={handleFileSelect}
          disabled={uploading}
        />

        {/* Image Grid */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((image, index) => (
              <div 
                key={image.id}
                className={cn(
                  "relative group",
                  "aspect-[4/3]",
                  "rounded-lg overflow-hidden",
                  "border-2",
                  primaryImageIndex === index 
                    ? "border-primary" 
                    : "border-border"
                )}
              >
                <img 
                  src={image.url} 
                  alt={`Property ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleSetPrimaryImage(index)}
                      className={cn(
                        "p-1.5 rounded-full",
                        "transition-colors duration-200",
                        primaryImageIndex === index 
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/90 text-foreground hover:bg-background"
                      )}
                      title={primaryImageIndex === index ? "Primary image" : "Set as primary"}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className={cn(
                        "p-1.5 rounded-full",
                        "bg-background/90 text-destructive",
                        "hover:bg-background transition-colors duration-200"
                      )}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-background text-xs">
                    {index + 1} / {existingImages.length}
                  </div>
                  {/* Upload Progress */}
                  {uploading && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-md px-2 py-1">
                      <div className="h-1 bg-background/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-background transition-all duration-300"
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
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Photo Requirements
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Upload up to 10 photos</li>
            <li>First image will be the primary photo</li>
            <li>Maximum size: 5MB per image</li>
            <li>Supported formats: JPG, PNG</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-start pt-4 border-t border-border">
          <button
            type="button"
            onClick={onPrevious}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-lg",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            Previous
          </button>
        </div>
      </div>
    </FormSection>
  );
}