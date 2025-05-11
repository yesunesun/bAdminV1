// src/modules/owner/components/property/wizard/sections/PropertySummary/components/LandFeaturesSection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:35 IST
// Purpose: Land features specific component

import React from 'react';
import { Map } from 'lucide-react';
import { SummarySection } from './SummarySection';
import { SummaryItem } from '../types';

interface LandFeaturesSectionProps {
  items: SummaryItem[];
}

export const LandFeaturesSection: React.FC<LandFeaturesSectionProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <SummarySection
      title="Land Features"
      icon={<Map className="h-4 w-4" />}
      items={items}
    />
  );
};