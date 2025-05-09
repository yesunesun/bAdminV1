// src/modules/owner/components/property/wizard/components/FlowServiceDebug.tsx
// Version: 1.0.0
// Last Modified: 12-05-2025 17:55 IST
// Purpose: Debug component to visualize flow service detection and data formatting

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../types';
import { FlowServiceFactory } from '../services/flows/FlowServiceFactory';

interface FlowServiceDebugProps {
  form: UseFormReturn<FormData>;
  collapsed?: boolean;
}

const FlowServiceDebug: React.FC<FlowServiceDebugProps> = ({ form, collapsed = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const formValues = form.getValues();
  
  // Create flow context from URL
  const flowContext = {
    urlPath: window.location.pathname,
    isSaleMode: window.location.pathname.toLowerCase().includes('sale'),
    isPGHostelMode: window.location.pathname.toLowerCase().includes('pghostel')
  };
  
  // Detect the flow service
  const flowService = FlowServiceFactory.getFlowService(formValues, flowContext);
  const flowType = flowService.getFlowType();
  
  // Get the formatted data
  const formattedData = flowService.formatData(formValues);
  
  return (
    <div className="bg-blue-50 p-4 rounded mt-8 text-xs border border-blue-300">
      <div className="flex justify-between items-center">
        <h3 className="font-bold mb-2">Flow Service Debug</h3>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 transition-colors"
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      
      <div className="mb-2">
        <strong>Detected Flow:</strong> {flowType}
      </div>
      
      {!isCollapsed && (
        <div className="mt-2">
          <h4 className="font-semibold mb-1">Flow Structure:</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <strong className="font-semibold text-blue-600">Form Data:</strong>
              <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-white p-3 rounded border border-gray-200 text-[10px]">
                {JSON.stringify(formValues, null, 2)}
              </pre>
            </div>
            <div>
              <strong className="font-semibold text-green-600">Formatted Data:</strong>
              <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-white p-3 rounded border border-gray-200 text-[10px]">
                {JSON.stringify(formattedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowServiceDebug;