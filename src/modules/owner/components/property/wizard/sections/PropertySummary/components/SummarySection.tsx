// src/modules/owner/components/property/wizard/sections/PropertySummary/components/SummarySection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:30 IST
// Purpose: Reusable summary card component

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummarySectionProps } from '../types';

export const SummarySection: React.FC<SummarySectionProps> = ({ title, icon, items }) => (
  <Card className="overflow-hidden border-border hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-secondary/20 py-3 px-4">
      <CardTitle className="text-base font-medium flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <dl className="grid gap-2">
        {items.filter(item => item.value !== undefined && item.value !== null && item.value !== '').map(({ label, value }) => (
          <div key={label} className="grid grid-cols-2 gap-2 py-1 border-b border-border/30 last:border-0">
            <dt className="text-sm font-medium text-muted-foreground">{label}:</dt>
            <dd className="text-sm text-foreground font-medium">
              {typeof value === 'boolean' ? (
                value ? 'Yes' : 'No'
              ) : Array.isArray(value) ? (
                value.length > 0 ? value.join(', ') : '-'
              ) : typeof value === 'string' || typeof value === 'number' ? (
                String(value) || '-'
              ) : '-'}
            </dd>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);