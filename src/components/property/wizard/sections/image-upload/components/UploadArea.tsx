// src/components/property/wizard/sections/image-upload/components/UploadArea.tsx
// Version: 1.1.0
// Last Modified: 2025-02-01T10:30:00+05:30 (IST)

import React, { useCallback } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  images: File[];
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadArea({ images, onFileSelect, disabled }: UploadAreaProps) {
  const MAX_IMAGES = 10;

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith('image/'));
    
    onFileSelect(droppedFiles);
  }, [disabled, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-4",
        "transition-colors duration-200",
        images.length === 0 ? "border-slate-200 hover:border-slate-300" : "border-slate-300",
        "min-h-[120px] flex items-center justify-center relative",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-center">
        <ImagePlus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">
          {images.length === 0 
            ? "Click or drag images here" 
            : `Add more images (${MAX_IMAGES - images.length} remaining)`}
        </p>
        {disabled && (
          <p className="text-xs text-slate-500 mt-1">Upload in progress...</p>
        )}
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={images.length >= MAX_IMAGES || disabled}
      />
    </div>
  );
}