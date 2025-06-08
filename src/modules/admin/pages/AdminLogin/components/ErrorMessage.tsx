// src/modules/admin/pages/AdminLogin/components/ErrorMessage.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ error, showResendButton, onResend, isResending }) => (
  <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-red-800">Login Failed</p>
        <p className="text-sm text-red-700 mt-0.5">{error}</p>
      </div>
    </div>
    {showResendButton && (
      <button
        type="button"
        onClick={onResend}
        disabled={isResending}
        className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
      >
        {isResending ? 'Sending...' : 'Request new login token'}
      </button>
    )}
  </div>
);