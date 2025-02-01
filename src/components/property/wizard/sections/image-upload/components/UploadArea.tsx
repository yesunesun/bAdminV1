// src/components/property/wizard/sections/image-upload/components/UploadArea.tsx
// Version: 1.0.0
// Last Modified: 2025-01-31T16:45:00+05:30 (IST)

import React from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  images: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function UploadArea({ images, onFileSelect, disabled }: UploadAreaProps) {
  const MAX_IMAGES = 10;
  
  return (
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
        onChange={onFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={images.length >= MAX_IMAGES || disabled}
      />
    </div>
  );
}