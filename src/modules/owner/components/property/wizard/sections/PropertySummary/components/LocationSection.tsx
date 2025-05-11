// src/modules/owner/components/property/wizard/sections/PropertySummary/components/LocationSection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:35 IST
// Purpose: Location details specific component

import React from 'react';
import { MapPin } from 'lucide-react';
import { SummarySection } from './SummarySection';
import { SummaryItem } from '../types';

interface LocationSectionProps {
  items: SummaryItem[];
}

export const LocationSection: React.FC<LocationSectionProps> = ({ items }) => {
  return (
    <SummarySection
      title="Location Details"
      icon={<MapPin className="h-4 w-4" />}
      items={items}
    />
  );
};