// src/modules/owner/components/property/wizard/sections/PropertySummary/components/SaleDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:35 IST
// Purpose: Sale details specific component

import React from 'react';
import { IndianRupee } from 'lucide-react';
import { SummarySection } from './SummarySection';
import { SummaryItem } from '../types';

interface SaleDetailsSectionProps {
  items: SummaryItem[];
}

export const SaleDetailsSection: React.FC<SaleDetailsSectionProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <SummarySection
      title="Sale Details"
      icon={<IndianRupee className="h-4 w-4" />}
      items={items}
    />
  );
};