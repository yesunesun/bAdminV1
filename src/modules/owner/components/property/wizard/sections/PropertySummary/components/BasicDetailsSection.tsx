// src/modules/owner/components/property/wizard/sections/PropertySummary/components/BasicDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:30 IST
// Purpose: Basic details specific component

import React from 'react';
import { Home } from 'lucide-react';
import { SummarySection } from './SummarySection';
import { SummaryItem } from '../types';

interface BasicDetailsSectionProps {
  items: SummaryItem[];
}

export const BasicDetailsSection: React.FC<BasicDetailsSectionProps> = ({ items }) => {
  return (
    <SummarySection
      title="Basic Details"
      icon={<Home className="h-4 w-4" />}
      items={items}
    />
  );
};