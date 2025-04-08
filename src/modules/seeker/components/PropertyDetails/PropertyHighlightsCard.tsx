// src/modules/seeker/components/PropertyDetails/PropertyHighlightsCard.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 15:50 IST
// Purpose: Property highlights sidebar card

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyHighlightsCardProps {
  highlights: string[];
}

const PropertyHighlightsCard: React.FC<PropertyHighlightsCardProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;
  
  return (
    <Card className="border-border/40 shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Property Highlights</h3>
        <ul className="space-y-2">
          {highlights.map((highlight: string, index: number) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></div>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PropertyHighlightsCard;