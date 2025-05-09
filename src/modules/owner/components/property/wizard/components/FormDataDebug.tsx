// src/modules/owner/components/property/wizard/components/FormDataDebug.tsx
// Version: 1.0.0
// Last Modified: 11-05-2025 21:00 IST
// Purpose: Debugging component to help identify form data structure issues

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface FormDataDebugProps {
  form: UseFormReturn<FormData>;
  collapsed?: boolean;
}

const FormDataDebug: React.FC<FormDataDebugProps> = ({ form, collapsed = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const formValues = form.getValues();
  
  return (
    <div className="bg-gray-100 p-4 rounded mt-8 text-xs border border-gray-300">
      <div className="flex justify-between items-center">
        <h3 className="font-bold mb-2">Debug: Form Data</h3>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2">
          <div className="mb-2">
            <h4 className="font-semibold">Form Structure:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>meta:</strong> {formValues.meta ? 'Exists' : 'Missing'} 
                {formValues.meta?.id ? ` (ID: ${formValues.meta.id})` : ''}
              </li>
              <li>
                <strong>flow:</strong> {formValues.flow ? 'Exists' : 'Missing'}
                {formValues.flow ? ` (${formValues.flow.category}_${formValues.flow.listingType})` : ''}
              </li>
              <li>
                <strong>steps:</strong> {formValues.steps ? 'Exists' : 'Missing'}
                {formValues.steps ? ` (${Object.keys(formValues.steps).length} sections)` : ''}
              </li>
              <li>
                <strong>media:</strong> {formValues.media ? 'Exists' : 'Missing'}
                {formValues.media?.photos?.images ? ` (${formValues.media.photos.images.length} images)` : ''}
              </li>
            </ul>
          </div>
          
          <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-gray-50 p-3 rounded border border-gray-200">
            {JSON.stringify(formValues, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FormDataDebug;