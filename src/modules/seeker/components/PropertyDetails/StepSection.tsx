// src/modules/seeker/components/PropertyDetails/StepSection.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 16:45 IST
// Purpose: Reusable component for rendering property step sections

import React from 'react';
import { Card } from '@/components/ui/card';
import { renderFieldValue, formatStepId } from './utils/dataFormatters';

interface StepSectionProps {
  stepId: string;
  stepData: any;
  title?: string;
}

/**
 * StepSection Component
 * Renders a single step section based on step data
 */
const StepSection: React.FC<StepSectionProps> = ({ stepId, stepData, title }) => {
  if (!stepData || Object.keys(stepData).length === 0) {
    return null;
  }

  const sectionTitle = title || formatStepId(stepId);

  // Special handling for description field to display it as a paragraph
  const descriptionField = Object.entries(stepData).find(
    ([key]) => key.toLowerCase() === 'description'
  );

  // Get all other fields except description
  const otherFields = Object.entries(stepData)
    .filter(([key]) => key.toLowerCase() !== 'description');

  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>

      {/* Render description as a paragraph if it exists */}
      {descriptionField && (
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{descriptionField[1]}</p>
        </div>
      )}

      {/* Render other fields in a grid */}
      {otherFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {otherFields.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-900">
                {renderFieldValue(value, key)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default StepSection;