// src/pages/AdminSetup/components/LoadingState.tsx
// Version: 1.0.2
// Last Modified: 25-02-2025 18:30 IST
// Purpose: Display loading state

import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading setup page...</p>
      </div>
    </div>
  );
};

export default LoadingState;