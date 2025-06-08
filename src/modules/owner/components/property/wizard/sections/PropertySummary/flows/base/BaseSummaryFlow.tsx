// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/base/BaseSummaryFlow.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 16:40 IST
// Purpose: Base abstract class for all flow components

import React from 'react';
import { getSectionWithMetadata } from '../../registry/sectionComponentRegistry';
import { SummarySection } from '../../components/SummarySection';
import { FormData } from '../../../../types';

export interface BaseSummaryFlowProps {
  formData: FormData;
}

export abstract class BaseSummaryFlow extends React.Component<BaseSummaryFlowProps> {
  // Abstract method that must be implemented by all flow components
  abstract getSectionIds(): string[];
  
  render() {
    const { formData } = this.props;
    const sectionIds = this.getSectionIds();
    
    return (
      <div className="space-y-6">
        {sectionIds.map(sectionId => {
          // Get both the component and metadata in one call
          const { Component, metadata } = getSectionWithMetadata(sectionId);
          const sectionData = formData.steps?.[sectionId] || {};
          
          return (
            <SummarySection
              key={sectionId}
              title={metadata.name}
              icon={metadata.icon && <metadata.icon className="h-4 w-4" />}
            >
              <Component
                data={sectionData}
                flowType={formData.flow?.category}
                listingType={formData.flow?.listingType}
              />
            </SummarySection>
          );
        })}
      </div>
    );
  }
}