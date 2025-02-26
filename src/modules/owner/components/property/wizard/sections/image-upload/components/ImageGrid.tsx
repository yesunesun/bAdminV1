// src/components/property/wizard/sections/image-upload/ImageGrid.tsx
import { Star, X } from 'lucide-react';

interface ImageGridProps {
  previews: string[];
  primaryImageIndex: number;
  onSetPrimary: (index: number) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}

export function ImageGrid({
  previews,
  primaryImageIndex,
  onSetPrimary,
  onRemoveImage,
  disabled
}: ImageGridProps) {
  if (previews.length === 0) return null;

  return (
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
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => onSetPrimary(index)}
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
                onClick={() => onRemoveImage(index)}
                className="p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors duration-200"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
              {index + 1} / {previews.length}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}