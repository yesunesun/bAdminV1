// src/modules/admin/pages/AdminLogin/components/LoadingState.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';

export const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-indigo-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-700">Processing your login...</p>
    </div>
  </div>
);