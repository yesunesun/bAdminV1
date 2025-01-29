import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  propertyId: string;
  onUploadComplete?: (imageUrl: string) => void;
}

export default function ImageUpload({ propertyId, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchExistingImages = async () => {
      if (!propertyId) return;

      try {
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('id, url')
          .eq('property_id', propertyId);

        if (imagesError) throw imagesError;
        setUploadedImages(imagesData || []);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load existing images');
      }
    };

    fetchExistingImages();
  }, [propertyId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (!propertyId) {
      setError('Property ID is required for uploading images');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('Please select only image files.');
      return;
    }

    for (const file of imageFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!propertyId) return;

    try {
      setError('');
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const { error: dbError, data: imageRecord } = await supabase
        .from('property_images')
        .insert([
          {
            property_id: propertyId,
            url: publicUrl
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedImages(prev => [...prev, { id: imageRecord.id, url: publicUrl }]);
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all",
          "hover:border-slate-300 hover:bg-slate-50",
          dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200",
        )}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">
              {uploading ? 'Uploading...' : 'Drag and drop your images here'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Or click to browse. Supports PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-600 bg-red-50 rounded-lg p-4">
          <X className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200"
            >
              <img
                src={image.url}
                alt="Property"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-red-600
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length === 0 && !uploading && (
        <div className="text-center py-12 border rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No images</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload images to showcase your property
          </p>
        </div>
      )}
    </div>
  );
}