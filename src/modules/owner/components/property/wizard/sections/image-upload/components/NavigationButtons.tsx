// src/components/property/wizard/sections/image-upload/NavigationButtons.tsx
import { Upload } from 'lucide-react';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onUpload: () => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
  disabled: boolean;
}

export function NavigationButtons({
  onPrevious,
  onUpload,
  uploading,
  uploadProgress,
  disabled
}: NavigationButtonsProps) {
  return (
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
        onClick={onUpload}
        disabled={uploading || disabled}
        className={cn(
          "flex items-center px-6 py-2.5 text-sm font-medium text-white",
          "rounded-lg transition-colors focus:outline-none focus:ring-2",
          uploading || disabled
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
  );
}