// src/modules/owner/components/property/wizard/sections/PropertySummary/components/PropertyTitleEditor.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:30 IST
// Purpose: Editable property title component

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';

interface PropertyTitleEditorProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onChange: (value: string) => void;
  fullAddress: string;
}

export const PropertyTitleEditor: React.FC<PropertyTitleEditorProps> = ({
  title,
  isEditing,
  onEdit,
  onComplete,
  onKeyDown,
  onChange,
  fullAddress
}) => {
  return (
    <div className="mb-6">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            className="text-lg font-semibold h-10"
            placeholder="Enter property title"
          />
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onComplete}
            className="p-2 h-10 w-10"
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            {title || "Unnamed Property"}
          </h2>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onEdit}
            className="p-1 h-8 w-8 ml-1"
            title="Edit property title"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
      <p className="text-muted-foreground text-sm mt-1">{fullAddress}</p>
    </div>
  );
};