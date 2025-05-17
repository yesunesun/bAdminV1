// src/modules/owner/components/property/wizard/components/DebugContainer.tsx
// Version: 1.0.0
// Last Modified: 18-05-2025 19:25 IST
// Purpose: Tabbed container for multiple debug panels

import React from 'react';
import { DebugTab } from '../hooks/usePropertyFormDebug';

interface DebugContainerProps {
  activeTab: DebugTab;
  onTabChange: (tab: DebugTab) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const DebugContainer: React.FC<DebugContainerProps> = ({
  activeTab,
  onTabChange,
  onClose,
  children
}) => {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1">
          <button
            onClick={() => onTabChange('form')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'form'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-transparent hover:bg-gray-200 text-gray-700'
            }`}
          >
            Form Debug
          </button>
          <button
            onClick={() => onTabChange('flow')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'flow'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-transparent hover:bg-gray-200 text-gray-700'
            }`}
          >
            Flow Debug
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        {children}
      </div>
    </div>
  );
};

export default DebugContainer;