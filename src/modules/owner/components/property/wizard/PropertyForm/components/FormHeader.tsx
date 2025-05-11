// src/modules/owner/components/property/wizard/PropertyForm/components/FormHeader.tsx
// Version: 1.1.0
// Last Modified: 11-05-2025 16:30 IST
// Purpose: Header component for property form with status, removed debug tools

import React from 'react';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';
import StatusIndicator from './StatusIndicator';

interface FormHeaderProps {
  status: 'draft' | 'published';
  handleAutoFill: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ 
  status, 
  handleAutoFill
}) => {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {process.env.NODE_ENV === 'development' && (
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
          )}
        </div>
        <StatusIndicator status={status} />
      </div>
    </div>
  );
};

export default FormHeader;