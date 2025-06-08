// src/components/ui/ErrorState.tsx
// Version: 1.0.0
// Last Modified: 04-02-2025 10:30 IST

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
}

const ErrorState = ({ 
  title = 'Error', 
  message, 
  action 
}: ErrorStateProps) => {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;