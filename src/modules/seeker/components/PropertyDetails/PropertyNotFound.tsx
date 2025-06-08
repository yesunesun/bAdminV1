// src/modules/seeker/components/PropertyDetails/PropertyNotFound.tsx
// Version: 1.0.0
// Last Modified: 09-05-2025 14:30 IST
// Purpose: Extracted property not found component

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const PropertyNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Property Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        This property may have been removed or is no longer available.
      </p>
      <Button variant="default" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};

export default PropertyNotFound;