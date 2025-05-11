// src/modules/owner/components/property/wizard/sections/PropertySummary/components/DescriptionSection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:30 IST
// Purpose: Description display component

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DescriptionSectionProps {
  description: string;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => {
  if (!description) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/20 py-3 px-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Description
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};