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


  // Show loading spinner while flow context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm text-gray-600">Loading property wizard...</span>
      </div>
    );
  }

  // If we have a valid flow (URL contains category and type), show the PropertyForm wizard
  if (isValidFlow && flowType) {
    return (
      // FIXED: Removed container constraints to let PropertyForm handle its own width
      <div className="w-full">
        <PropertyForm 
          currentStep={step}
          selectedCategory={contextCategory}
          selectedAdType={listingType}
        />
      </div>
    );
  }

  // Otherwise, show the PropertyTypeSelection
  return (
    <div className="w-full">
      <PropertyTypeSelection 
        onNext={(selectedCategory, selectedType, city) => {
          // Handle property type selection
        }} 
      />
    </div>
  );
}