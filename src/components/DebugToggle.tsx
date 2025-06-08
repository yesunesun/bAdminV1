// src/components/DebugToggle.tsx
// Version: 1.0.0
// Last Modified: 05-04-2025 21:15 IST
// Purpose: A toggle button to enable/disable debug theme colors

import React from 'react';
import { useDebugTheme } from '@/contexts/DebugThemeContext';

const DebugToggle: React.FC = () => {
  const { isDebugMode, toggleDebugMode } = useDebugTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleDebugMode}
        className={`px-4 py-2 rounded-md shadow-md font-medium ${
          isDebugMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {isDebugMode ? 'Debug Mode: ON' : 'Debug Mode: OFF'}
      </button>
    </div>
  );
};

export default DebugToggle;