// src/components/property/wizard/sections/ImageUploadSection.tsx
// Version: 1.0.0
// Last Modified: 2025-01-31T18:30:00+05:30 (IST)

import React, { useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { ImagePlus, Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Please select images under 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setError(null);
      setImages(prev => [...prev, ...validFiles]);
      
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
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (const [index, file] of images.entries()) {
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const fileName = `${propertyId}/${uniqueId}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from('property_images')
          .insert([{
            property_id: propertyId,
            url: publicUrl,
            is_primary: index === 0
          }]);

        if (dbError) {
          throw new Error(`Database insert failed: ${dbError.message}`);
        }

        // Update progress
        const progress = ((index + 1) / images.length) * 100;
        setUploadProgress(progress);
      }

      onUploadComplete();
    } catch (error) {
      console.error('Upload process error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
            disabled={images.length >= MAX_IMAGES || uploading}
          />
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div 
                key={index}
                className="relative group aspect-[4/3] rounded-lg overflow-hidden border-2 border-slate-200"
              >
                <img 
                  src={preview} 
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 
                    text-red-500 hover:bg-white transition-colors duration-200 
                    opacity-0 group-hover:opacity-100"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
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

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
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
            <li>Maximum size: 5MB per image</li>
            <li>Supported formats: JPG, PNG</li>
            <li>First image will be the cover photo</li>
            <li>Use high-quality, well-lit photos</li>
          </ul>
        </div>

        {/* Navigation */}
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
            onClick={uploadImages}
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
                Uploading... {Math.round(uploadProgress)}%
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