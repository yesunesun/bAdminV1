// src/modules/owner/components/property/wizard/PropertyForm/components/StatusIndicator.tsx
// Version: 1.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Status indicator component for property form

import React from 'react';
import { cn } from '@/lib/utils';
import { PencilLine, CheckCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'draft' | 'published';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const isDraft = status === 'draft';
  
  return (
    <div className={cn(
      "flex items-center px-3 py-1.5 rounded-lg",
      isDraft 
        ? "bg-warning/10 text-warning border border-warning/20" 
        : "bg-success/10 text-success border border-success/20"
    )}>
      {isDraft ? (
        <PencilLine className="h-4 w-4 mr-1.5" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-1.5" />
      )}
      <span className="text-sm font-medium capitalize">
        {status}
      </span>
    </div>
  );
};

export default StatusIndicator;