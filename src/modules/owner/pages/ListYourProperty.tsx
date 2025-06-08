// src/modules/owner/pages/ListYourProperty.tsx
// Version: 3.2.0
// Last Modified: 25-05-2025 22:15 IST
// Purpose: Fixed width issue and navigation problems

import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFlow } from '@/contexts/FlowContext';
import PropertyForm from '@/modules/owner/components/property/wizard/PropertyForm/index';
import PropertyTypeSelection from '@/modules/owner/components/property/wizard/components/PropertyTypeSelection';

export default function ListYourProperty() {
  const { category, type, step } = useParams();
  const location = useLocation();
  const { isValidFlow, isLoading, flowType, category: contextCategory, listingType } = useFlow();

  // Enhanced debugging
  useEffect(() => {
    console.log('[ListYourProperty] Component mounted/updated with:', {
      'URL Params': { category, type, step },
      'Location': { pathname: location.pathname, search: location.search },
      'FlowContext': { isValidFlow, isLoading, flowType, contextCategory, listingType },
      'Timestamp': new Date().toISOString()
    });
  }, [category, type, step, location.pathname, isValidFlow, isLoading, flowType, contextCategory, listingType]);

  // Show loading spinner while flow context is initializing
  if (isLoading) {
    console.log('[ListYourProperty] Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm text-gray-600">Loading property wizard...</span>
      </div>
    );
  }

  // If we have a valid flow (URL contains category and type), show the PropertyForm wizard
  if (isValidFlow && flowType) {
    console.log('[ListYourProperty] ✅ Rendering PropertyForm for flow:', flowType);
    return (
      // FIXED: Removed container constraints to let PropertyForm handle its own width
      <div className="w-full">
        {/* Debug info at top in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 max-w-7xl mx-auto">
            <strong>Debug - Wizard Mode:</strong> Flow: {flowType}, Category: {contextCategory}, Type: {listingType}
          </div>
        )}
        <PropertyForm 
          currentStep={step}
          selectedCategory={contextCategory}
          selectedAdType={listingType}
        />
      </div>
    );
  }

  // Otherwise, show the PropertyTypeSelection
  console.log('[ListYourProperty] 📝 Rendering PropertyTypeSelection');
  return (
    <div className="w-full">
      {/* Debug info at top in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 max-w-7xl mx-auto">
          <strong>Debug - Selection Mode:</strong> Path: {location.pathname}, Valid Flow: {isValidFlow ? 'Yes' : 'No'}
        </div>
      )}
      <PropertyTypeSelection 
        onNext={(selectedCategory, selectedType, city) => {
          console.log('[ListYourProperty] PropertyTypeSelection onNext called:', { selectedCategory, selectedType, city });
        }} 
      />
    </div>
  );
}