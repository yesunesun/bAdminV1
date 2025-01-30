// src/components/property/ImageUploadSection.tsx
// Version: 1.2.0
// Last Modified: 2025-01-30T18:15:00+05:30 (IST)
// Author: Bhoomitalli Team

import React, { useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { 
  ImagePlus, 
  X, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  const MAX_IMAGES = 10;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        setError('Please select images under 5MB');
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setError(null);
      setImages(prev => [...prev, ...validFiles]);
      
      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated upload
      onUploadComplete();
    } catch (error) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormSection
      title="Property Images"
      description="Add high-quality photos of your property"
    >
      <div className="space-y-4">
        {/* Upload Area */}
        <div className={cn(
          "border-2 border-dashed rounded-xl p-4",
          "transition-colors duration-200",
          images.length === 0 ? "border-slate-200 hover:border-slate-300" : "border-slate-300",
          "min-h-[120px] flex items-center justify-center relative"
        )}>
          <div className="text-center">
            <ImagePlus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              {images.length === 0 
                ? "Click or drag images here" 
                : `Add more images (${MAX_IMAGES - images.length} remaining)`}
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={images.length >= MAX_IMAGES}
          />
        </div>

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
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                    {index + 1} / {previews.length}
                  </div>
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

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-lg hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-2 focus:ring-slate-200"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || images.length === 0}
            className={cn(
              "flex items-center px-6 py-2.5 text-sm font-medium text-white",
              "rounded-lg transition-colors focus:outline-none focus:ring-2",
              uploading || images.length === 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200"
            )}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </FormSection>
  );
}