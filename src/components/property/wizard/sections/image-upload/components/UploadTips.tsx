// src/components/property/wizard/sections/image-upload/UploadTips.tsx
import { Image as ImageIcon } from 'lucide-react';

export function UploadTips() {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        Photo Requirements
      </h4>
      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
        <li>Upload up to 10 photos</li>
        <li>First image will be the primary photo</li>
        <li>Maximum size: 5MB per image</li>
        <li>Supported formats: JPG, PNG</li>
      </ul>
    </div>
  );
}