import React from 'react';
import { FormSection } from '@/components/FormSection';
import ImageUpload from '@/components/ImageUpload';

interface ImageUploadSectionProps {
  propertyId: string;
  onUploadComplete: () => void;
  onPrevious: () => void;
}

export function ImageUploadSection({ propertyId, onUploadComplete, onPrevious }: ImageUploadSectionProps) {
  return (
    <FormSection
      title="Property Gallery"
      description="Upload high-quality images of your property. You can add multiple images."
    >
      <div className="space-y-8">
        <ImageUpload propertyId={propertyId} />
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-xl hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-4 focus:ring-slate-100"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onUploadComplete}
            className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 
              rounded-xl hover:bg-indigo-700 transition-colors focus:outline-none 
              focus:ring-4 focus:ring-indigo-100"
          >
            Next
          </button>
        </div>
      </div>
    </FormSection>
  );
}