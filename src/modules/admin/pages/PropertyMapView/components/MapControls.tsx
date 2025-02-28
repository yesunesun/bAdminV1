// src/modules/admin/pages/PropertyMapView/components/MapControls.tsx
// Version: 1.0.0
// Last Modified: 01-03-2025 11:50 IST
// Purpose: Component for map control buttons

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

interface MapControlsProps {
  onRefresh: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold text-gray-900">Property Map View</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};