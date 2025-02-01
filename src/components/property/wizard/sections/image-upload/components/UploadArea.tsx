// src/components/property/wizard/sections/image-upload/components/UploadArea.tsx
// Version: 1.2.0
// Last Modified: 2025-02-01T14:30:00+05:30 (IST)

import React, { useCallback, useState, useEffect } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  images: File[];
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadArea({ images, onFileSelect, disabled }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const MAX_IMAGES = 10;

  // Handle global drag and drop
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsGlobalDragging(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsGlobalDragging(false);
      }
    };

    const handleGlobalDrop = () => {
      setIsGlobalDragging(false);
    };

    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);
    
    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setIsGlobalDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith('image/'));
    
    onFileSelect(droppedFiles);
  }, [disabled, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  }, [onFileSelect]);

  // Apply overlay when dragging anywhere on the page
  if (isGlobalDragging) {
    return (
      <div 
        className="fixed inset-0 bg-indigo-50/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={cn(
          "border-2 border-dashed border-indigo-400 rounded-xl p-8",
          "bg-white shadow-lg transition-all duration-200",
          isDragging && "border-indigo-600 bg-indigo-50/50 scale-105",
          "max-w-2xl w-full mx-4"
        )}>
          <div className="text-center">
            <ImagePlus className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-indigo-900">
              Drop your images here
            </p>
            <p className="text-sm text-indigo-600 mt-1">
              Drop anywhere on the screen
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-4",
        "transition-all duration-200",
        isDragging
          ? "border-indigo-400 bg-indigo-50 scale-[1.02]"
          : images.length === 0 
            ? "border-slate-200 hover:border-slate-300" 
            : "border-slate-300",
        "min-h-[120px] flex items-center justify-center relative",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <ImagePlus className={cn(
          "h-8 w-8 mx-auto mb-2",
          isDragging ? "text-indigo-600" : "text-slate-400"
        )} />
        <p className={cn(
          "text-sm",
          isDragging ? "text-indigo-600" : "text-slate-600"
        )}>
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