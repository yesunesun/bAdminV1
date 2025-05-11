// src/modules/owner/components/property/wizard/PropertyForm/components/FormHeader.tsx
// Version: 1.2.0
// Last Modified: 13-05-2025 14:45 IST
// Purpose: Header component for property form with status, debug functionality moved from bottom

import React from 'react';
import { cn } from '@/lib/utils';
import { Wand2, Bug } from 'lucide-react';
import StatusIndicator from './StatusIndicator';

interface FormHeaderProps {
  status: 'draft' | 'published';
  handleAutoFill: () => void;
  onDebugClick?: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ 
  status, 
  handleAutoFill,
  onDebugClick
}) => {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {process.env.NODE_ENV === 'development' && (
            <>
              <button
                type="button"
                onClick={handleAutoFill}
                className={cn(
                  "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg",
                  "bg-success text-success-foreground",
                  "hover:bg-success/90 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                )}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Auto Fill
              </button>
              {onDebugClick && (
                <button
                  type="button"
                  onClick={onDebugClick}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg",
                    "bg-muted text-muted-foreground",
                    "hover:bg-muted/90 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                  )}
                >
                  <Bug className="h-3.5 w-3.5 mr-1.5" />
                  Debug
                </button>
              )}
            </>
          )}
        </div>
        <StatusIndicator status={status} />
      </div>
    </div>
  );
};

export default FormHeader;