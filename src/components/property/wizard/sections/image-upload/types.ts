// src/components/property/wizard/sections/image-upload/types.ts
// Version: 1.0.0
// Last Modified: 2025-01-31T16:45:00+05:30 (IST)

export interface ImageUploadProps {
  propertyId: string;
  onUploadComplete: () => void;
  onPrevious: () => void;
}

export interface NavigationButtonsProps {
  onPrevious: () => void;
  onUpload: () => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
  disabled: boolean;
}

export interface ImageGridProps {
  previews: string[];
  primaryImageIndex: number;
  onSetPrimary: (index: number) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}

export interface UploadAreaProps {
  images: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}