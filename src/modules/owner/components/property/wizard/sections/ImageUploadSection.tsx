// src/modules/owner/components/property/wizard/sections/ImageUploadSection.tsx
// Version: 2.0.0 - Direct Upload (No Optimization)
// Last Modified: 17-07-2025 22:35 IST
// Purpose: Direct upload to Supabase storage, bypassing optimization

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { 
  X, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Star,
  Loader2,
  CheckCircle
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

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-900">
                Uploading images directly to storage...
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-blue-700">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

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
                  onError={(e) => {
                    console.error('Image failed to load:', image.url);
                    (e.target as HTMLImageElement).src = '/noimage.png';
                  }}
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
                  {/* Direct Upload Indicator */}
                  <div className="absolute bottom-2 right-2">
                    <div className="px-2 py-1 rounded-md bg-green-500/80 text-white text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Direct
                    </div>
                  </div>
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

        {/* Upload Tips - Updated for Direct Upload */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Direct Photo Upload
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Upload up to 10 photos</li>
            <li>Direct upload to storage - no optimization or processing</li>
            <li>Images stored immediately and displayed instantly</li>
            <li>Maximum size: 50MB per image</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>Click the star to set primary photo</li>
            <li>Images are stored in Supabase storage permanently</li>
          </ul>
        </div>

        {/* Upload Success Info */}
        {existingImages.length > 0 && !uploading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="text-sm font-medium text-green-900">Direct Upload Complete</h4>
            </div>
            <div className="text-sm text-green-700">
              <p>✅ {existingImages.length} image{existingImages.length > 1 ? 's' : ''} uploaded successfully</p>
              <p>✅ Images stored directly in Supabase storage</p>
              <p>✅ No optimization processing required</p>
              <p>✅ Images will load instantly for visitors</p>
            </div>
          </div>
        )}

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

// End of file