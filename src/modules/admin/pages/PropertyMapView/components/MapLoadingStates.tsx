// src/modules/admin/pages/PropertyMapView/components/MapLoadingStates.tsx
// Version: 1.0.0
// Last Modified: 01-03-2025 11:55 IST
// Purpose: Components for different map loading states

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-[calc(100vh-172px)]">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto" />
      <p className="mt-4 text-gray-500">Loading property map...</p>
    </div>
  </div>
);

export const MapLoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-[calc(100vh-172px)]">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto" />
      <p className="mt-4 text-gray-500">Loading Google Maps...</p>
    </div>
  </div>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex items-center justify-center h-[calc(100vh-172px)]">
    <Card className="max-w-lg w-full">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-2 rounded-full inline-flex items-center justify-center mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Properties</h3>
          <p className="text-gray-500 mb-4">{message}</p>
          {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const GoogleMapsErrorState: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-[calc(100vh-172px)]">
    <Card className="max-w-lg w-full">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-2 rounded-full inline-flex items-center justify-center mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Google Maps Error</h3>
          <p className="text-gray-500 mb-4">
            There was an error loading Google Maps. Please check your API key and billing settings.
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-left text-xs text-gray-600">
            <pre>{error.toString()}</pre>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ApiKeyMissingState: React.FC = () => (
  <div className="flex items-center justify-center h-[calc(100vh-172px)]">
    <Card className="max-w-lg w-full">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-2 rounded-full inline-flex items-center justify-center mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Google Maps API Key Missing</h3>
          <p className="text-gray-500 mb-4">
            Please ensure the VITE_GOOGLE_MAPS_KEY environment variable is set.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);