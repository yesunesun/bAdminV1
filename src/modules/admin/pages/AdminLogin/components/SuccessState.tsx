// src/modules/admin/pages/AdminLogin/components/SuccessState.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';

export const SuccessState = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-indigo-100">
    <div className="max-w-md w-full p-8 bg-white/80 backdrop-blur rounded-xl shadow-lg mx-4">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-green-100 mb-4">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful</h2>
        <p className="text-gray-600 mb-4">{message}</p>
      </div>
    </div>
  </div>
);