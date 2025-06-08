// src/modules/owner/components/property/wizard/components/FormDataDebug.tsx
// Version: 1.5.0
// Last Modified: 25-05-2025 23:50 IST
// Purpose: Enhanced debug component with step and flow information

import React, { useEffect, useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface FormDataDebugProps {
  form: UseFormReturn<FormData>;
  title?: string;
  position?: 'right' | 'left' | 'bottom';
  width?: string;
  currentStepId?: string;
  currentStepNumber?: number;
  flowType?: string;
}

const FormDataDebug: React.FC<FormDataDebugProps> = ({
  form,
  title = 'Form Data Debug',
  position = 'right',
  width = '350px',
  currentStepId,
  currentStepNumber,
  flowType
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [expanded, setExpanded] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Function to update the form data display whenever it changes
  const updateFormData = useCallback(() => {
    const currentFormData = form.getValues();
    setFormData(currentFormData);
  }, [form]);

  // Watch for form changes
  useEffect(() => {
    // Initial form data
    updateFormData();

    // Subscribe to form changes
    const subscription = form.watch(() => {
      updateFormData();
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(() => {
    try {
      const jsonString = JSON.stringify(formData, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    } catch (error) {
      console.error('Failed to copy data to clipboard', error);
    }
  }, [formData]);

  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Generate position styles based on the position prop
  const positionStyles = {
    right: {
      position: 'fixed',
      top: '80px',
      right: '20px',
      maxHeight: 'calc(100vh - 100px)',
      width
    },
    left: {
      position: 'fixed',
      top: '80px',
      left: '20px',
      maxHeight: 'calc(100vh - 100px)',
      width
    },
    bottom: {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      maxHeight: '300px',
      width: 'calc(100vw - 40px)'
    }
  } as const;

  const selectedPosition = positionStyles[position];
  
  // Get flow information from form data
  const formFlow = formData.flow;
  const detectedFlowType = flowType || formFlow?.flowType || 'unknown';
  const category = formFlow?.category || 'unknown';
  const listingType = formFlow?.listingType || 'unknown';
  
  // Enhanced title with flow and step information
  const getEnhancedTitle = () => {
    const parts = ['Debug'];
    
    // Add flow info
    if (detectedFlowType !== 'unknown') {
      parts.push(`Flow: ${detectedFlowType}`);
    } else if (category !== 'unknown' || listingType !== 'unknown') {
      parts.push(`Category: ${category}, Type: ${listingType}`);
    }
    
    // Add step info
    if (currentStepId) {
      if (currentStepNumber) {
        parts.push(`Step: ${currentStepNumber} (${currentStepId})`);
      } else {
        parts.push(`Step: ${currentStepId}`);
      }
    } else if (currentStepNumber) {
      parts.push(`Step: ${currentStepNumber}`);
    }
    
    return parts.join(' | ');
  };

  const displayTitle = getEnhancedTitle();

  // Enhanced debug information in the header
  const getDebugInfo = () => {
    const info = [];
    
    if (detectedFlowType && detectedFlowType !== 'unknown') {
      info.push(`Flow: ${detectedFlowType}`);
    }
    
    if (category && category !== 'unknown') {
      info.push(`Category: ${category}`);
    }
    
    if (listingType && listingType !== 'unknown') {
      info.push(`Type: ${listingType}`);
    }
    
    if (currentStepId) {
      info.push(`Step ID: ${currentStepId}`);
    }
    
    if (currentStepNumber) {
      info.push(`Step #: ${currentStepNumber}`);
    }
    
    return info.join(' | ');
  };

  const debugInfo = getDebugInfo();

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-white overflow-hidden z-50 transition-all duration-300"
      style={{
        ...selectedPosition as React.CSSProperties,
        transform: expanded ? 'translateX(0)' : position === 'right' ? 'translateX(calc(100% - 30px))' : position === 'left' ? 'translateX(calc(-100% + 30px))' : 'translateY(calc(100% - 30px))'
      }}
    >
      <div 
        className="p-3 bg-gray-900 flex flex-col cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{displayTitle}</h3>
          <div className="flex space-x-2">
            {/* Copy button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                copySuccess 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              title="Copy JSON to clipboard"
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>

            {/* Refresh button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                updateFormData();
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              title="Refresh data"
            >
              Refresh
            </button>

            {/* Toggle expand/collapse button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '◀' : '▶'}
            </button>
          </div>
        </div>
        
        {/* Debug info line */}
        {debugInfo && (
          <div className="text-xs text-gray-400 mt-1 font-mono">
            {debugInfo}
          </div>
        )}
        
        {/* Data structure status */}
        {expanded && formData.steps && (
          <div className="text-xs text-blue-400 mt-1">
            Steps: {Object.keys(formData.steps).join(', ')}
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="overflow-auto p-3" style={{ maxHeight: 'calc(100% - 66px)' }}>
          {/* Step-specific data section */}
          {currentStepId && formData.steps?.[currentStepId] && (
            <div className="mb-4 p-2 bg-gray-700 rounded">
              <h4 className="text-xs font-semibold text-yellow-400 mb-2">
                Current Step Data ({currentStepId}):
              </h4>
              <pre className="text-xs whitespace-pre-wrap text-yellow-100">
                {JSON.stringify(formData.steps[currentStepId], null, 2)}
              </pre>
            </div>
          )}
          
          {/* Full form data */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Full Form Data:</h4>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDataDebug;