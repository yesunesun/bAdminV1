// src/modules/owner/components/property/wizard/components/DebugPanel.tsx
// Version: 1.0.0
// Last Modified: 17-05-2025 12:15 IST
// Purpose: Dedicated debug panel component for property wizard with copy functionality

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface DebugPanelProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  flowSteps: any[];
  effectiveCategory: string;
  effectiveAdType: string;
  mode: 'create' | 'edit';
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  isCommercialRentMode: boolean;
  isCommercialSaleMode: boolean;
  isCoworkingMode: boolean;
  isLandSaleMode: boolean;
  isFlatmatesMode: boolean;
  effectivePropertyId?: string;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  form,
  formStep,
  flowSteps,
  effectiveCategory,
  effectiveAdType,
  mode,
  isSaleMode,
  isPGHostelMode,
  isCommercialRentMode,
  isCommercialSaleMode,
  isCoworkingMode,
  isLandSaleMode,
  isFlatmatesMode,
  effectivePropertyId,
  onClose
}) => {
  // State for copy notification
  const [copyNotification, setCopyNotification] = useState('');
  
  // Function to copy data to clipboard
  const copyToClipboard = (data: any, section: string) => {
    const textToCopy = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopyNotification(`${section} copied!`);
        setTimeout(() => setCopyNotification(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopyNotification('Copy failed');
        setTimeout(() => setCopyNotification(''), 2000);
      });
  };
  
  // Create objects for easy copying
  const basicInfoData = {
    currentStep: flowSteps?.[formStep - 1]?.id || 'Unknown',
    flowType: `${effectiveCategory}_${effectiveAdType}`,
    stepProgress: `${formStep}/${flowSteps?.length || 0}`,
    propertyCategory: effectiveCategory,
    listingType: effectiveAdType,
    mode: mode,
    saleMode: isSaleMode ? 'Yes' : 'No',
    propertyId: effectivePropertyId || 'Not saved yet'
  };

  const propertyTypeFlags = {
    isPGHostelMode: isPGHostelMode ? 'Yes' : 'No',
    isCommercialRentMode: isCommercialRentMode ? 'Yes' : 'No',
    isCommercialSaleMode: isCommercialSaleMode ? 'Yes' : 'No', 
    isCoworkingMode: isCoworkingMode ? 'Yes' : 'No',
    isLandSaleMode: isLandSaleMode ? 'Yes' : 'No',
    isFlatmatesMode: isFlatmatesMode ? 'Yes' : 'No'
  };
  
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md p-3 overflow-auto border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">Debug Panel</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      
      {/* Copy notification toast */}
      {copyNotification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded shadow-md z-50 animate-fade-in-out">
          {copyNotification}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="relative">
            <div className="flex justify-between items-center">
              <h4 className="font-medium mb-1 text-sm">Form Information</h4>
              <button 
                onClick={() => copyToClipboard(basicInfoData, 'Form Information')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>Current Step:</strong> {flowSteps?.[formStep - 1]?.id || 'Unknown'}</div>
              <div><strong>Flow Type:</strong> {`${effectiveCategory}_${effectiveAdType}`}</div>
              <div><strong>Step Progress:</strong> {formStep}/{flowSteps?.length || 0}</div>
              <div><strong>Property Category:</strong> {effectiveCategory}</div>
              <div><strong>Listing Type:</strong> {effectiveAdType}</div>
              <div><strong>Mode:</strong> {mode}</div>
              <div><strong>Sale Mode:</strong> {isSaleMode ? 'Yes' : 'No'}</div>
              <div><strong>Property ID:</strong> {effectivePropertyId || 'Not saved yet'}</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex justify-between items-center">
              <h4 className="font-medium mb-1 text-sm">Property Type Flags</h4>
              <button 
                onClick={() => copyToClipboard(propertyTypeFlags, 'Property Type Flags')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>isPGHostelMode:</strong> {isPGHostelMode ? 'Yes' : 'No'}</div>
              <div><strong>isCommercialRentMode:</strong> {isCommercialRentMode ? 'Yes' : 'No'}</div>
              <div><strong>isCommercialSaleMode:</strong> {isCommercialSaleMode ? 'Yes' : 'No'}</div>
              <div><strong>isCoworkingMode:</strong> {isCoworkingMode ? 'Yes' : 'No'}</div>
              <div><strong>isLandSaleMode:</strong> {isLandSaleMode ? 'Yes' : 'No'}</div>
              <div><strong>isFlatmatesMode:</strong> {isFlatmatesMode ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-center">
            <h4 className="font-medium mb-1 text-sm">Steps Data</h4>
            <button 
              onClick={() => copyToClipboard(form.getValues('steps'), 'Steps Data')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
          <pre className="text-xs overflow-auto max-h-36 bg-gray-50 p-2 rounded">
            {JSON.stringify(form.getValues('steps'), null, 2)}
          </pre>
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-center">
            <h4 className="font-medium mb-1 text-sm">Form Data Structure</h4>
            <button 
              onClick={() => copyToClipboard(form.getValues(), 'Form Data Structure')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div><strong>Form Structure:</strong></div>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                <strong>meta:</strong> {form.getValues().meta ? 'Exists' : 'Missing'} 
                {form.getValues().meta?.id ? ` (ID: ${form.getValues().meta.id})` : ''}
              </li>
              <li>
                <strong>flow:</strong> {form.getValues().flow ? 'Exists' : 'Missing'}
                {form.getValues().flow ? ` (${form.getValues().flow.category}_${form.getValues().flow.listingType})` : ''}
              </li>
              <li>
                <strong>steps:</strong> {form.getValues().steps ? 'Exists' : 'Missing'}
                {form.getValues().steps ? ` (${Object.keys(form.getValues().steps).length} sections)` : ''}
              </li>
              <li>
                <strong>media:</strong> {form.getValues().media ? 'Exists' : 'Missing'}
                {form.getValues().media?.photos?.images ? ` (${form.getValues().media.photos.images.length} images)` : ''}
              </li>
            </ul>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-center">
            <h4 className="font-medium mb-1 text-sm">All Form Values</h4>
            <button 
              onClick={() => copyToClipboard(form.getValues(), 'All Form Values')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
          <pre className="text-xs overflow-auto max-h-60 bg-gray-50 p-2 rounded">
            {JSON.stringify(form.getValues(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;