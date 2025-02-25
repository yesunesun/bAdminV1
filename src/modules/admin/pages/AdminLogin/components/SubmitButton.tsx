// src/modules/admin/pages/AdminLogin/components/SubmitButton.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';

export const SubmitButton = ({ isLoading, text, loadingText }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {loadingText}
      </span>
    ) : (
      text
    )}
  </button>
);