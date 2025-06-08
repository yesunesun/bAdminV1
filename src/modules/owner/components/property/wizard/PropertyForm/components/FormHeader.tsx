// src/modules/owner/components/property/wizard/PropertyForm/components/FormHeader.tsx
// Version: 1.3.0
// Last Modified: 18-05-2025 19:40 IST
// Purpose: Updated to use tabbed debug interface

import React from 'react';
import StatusIndicator from './StatusIndicator';
import { cn } from '@/lib/utils';

interface FormHeaderProps {
  status: 'draft' | 'published';
  handleAutoFill?: () => void;
  onDebugClick?: () => void;
  onFormDebugClick?: () => void;
  onFlowDebugClick?: () => void;
  showDebugButtons?: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ 
  status, 
  handleAutoFill, 
  onDebugClick,
  onFormDebugClick,
  onFlowDebugClick,
  // Force buttons to display during development with fallback check
  showDebugButtons = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
}) => {
  return (
    <div className="flex justify-between items-center p-6 border-b bg-card">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold text-primary">List Your Property</h1>
        <StatusIndicator status={status} />
      </div>
      
      <div className="flex items-center space-x-2">
        {handleAutoFill && (
          <button
            onClick={handleAutoFill}
            className={cn(
              "px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80",
              showDebugButtons ? "block" : "hidden"
            )}
          >
            Auto-Fill
          </button>
        )}
        
        {onDebugClick && (
          <button
            onClick={onDebugClick}
            className={cn(
              "px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80",
              showDebugButtons ? "block" : "hidden"
            )}
          >
            Debug
          </button>
        )}
        
        {onFormDebugClick && (
          <button
            onClick={onFormDebugClick}
            className={cn(
              "px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80",
              showDebugButtons ? "block" : "hidden"
            )}
          >
            Form Debug
          </button>
        )}
        
        {onFlowDebugClick && (
          <button
            onClick={onFlowDebugClick}
            className={cn(
              "px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80",
              showDebugButtons ? "block" : "hidden"
            )}
          >
            Flow Debug
          </button>
        )}
      </div>
    </div>
  );
};

export default FormHeader;