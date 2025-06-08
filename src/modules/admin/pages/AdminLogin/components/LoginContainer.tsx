// src/modules/admin/pages/AdminLogin/components/LoginContainer.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';

export const LoginContainer = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-indigo-100">
    <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur rounded-xl shadow-lg mx-4">
      {children}
    </div>
  </div>
);