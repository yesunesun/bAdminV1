// src/modules/seeker/components/PropertyDetails/DebugPropertyDetails.tsx
// Version: 1.0.0
// Last Modified: 01-05-2025 18:40 IST
// Purpose: Debugging wrapper for property details page

import React, { useEffect } from 'react';
import PropertyDetails from './index';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';

interface DebugWrapperProps {
  property: PropertyDetailsType | null;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  onRefresh?: () => void;
}

const DebugPropertyDetails: React.FC<DebugWrapperProps> = (props) => {
  useEffect(() => {
    console.log('[DebugPropertyDetails] Wrapped PropertyDetails component with debug info');
    console.log('[DebugPropertyDetails] Property object:', props.property);
    
    if (props.property) {
      console.log('[DebugPropertyDetails] Has _version:', props.property._version);
      console.log('[DebugPropertyDetails] Has basicDetails:', !!props.property.basicDetails);
      
      if (props.property.basicDetails) {
        console.log('[DebugPropertyDetails] Basic Details Content:', {
          propertyType: props.property.basicDetails.propertyType,
          bhkType: props.property.basicDetails.bhkType,
          bathrooms: props.property.basicDetails.bathrooms,
          builtUpArea: props.property.basicDetails.builtUpArea
        });
      }
    }
  }, [props.property]);

  // If we're in development, add debug UI
  if (process.env.NODE_ENV === 'development') {
    return (
      <div>
        <div className="bg-amber-50 border border-amber-300 p-4 mb-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Property Data Debug Panel</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>Is Loading:</strong> {props.isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Is Liked:</strong> {props.isLiked ? 'Yes' : 'No'}</div>
            <div><strong>Has Property Data:</strong> {props.property ? 'Yes' : 'No'}</div>
            {props.property && (
              <>
                <div><strong>Version:</strong> {props.property._version || 'v1'}</div>
                <div><strong>ID:</strong> {props.property.id}</div>
                <div><strong>Has basicDetails:</strong> {props.property.basicDetails ? 'Yes' : 'No'}</div>
                {props.property.basicDetails && (
                  <>
                    <div><strong>Property Type:</strong> {props.property.basicDetails.propertyType || '-'}</div>
                    <div><strong>BHK Type:</strong> {props.property.basicDetails.bhkType || '-'}</div>
                    <div><strong>Bathrooms:</strong> {props.property.basicDetails.bathrooms || '-'}</div>
                    <div><strong>Built-up Area:</strong> {props.property.basicDetails.builtUpArea || '-'}</div>
                  </>
                )}
              </>
            )}
          </div>
          <button 
            className="mt-3 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" 
            onClick={() => console.log('Full property data:', props.property)}
          >
            Log Full Data to Console
          </button>
        </div>
        <PropertyDetails {...props} />
      </div>
    );
  }

  // In production, just render the regular component
  return <PropertyDetails {...props} />;
};

export default DebugPropertyDetails;