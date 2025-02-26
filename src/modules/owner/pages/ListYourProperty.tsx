// src/pages/ListYourProperty.tsx
// Version: 1.3.0
// Last Modified: 26-02-2025 15:10 IST

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyForm } from '@/modules/owner/components/property/wizard/PropertyForm';
// ^--- The import path has been fixed to match the actual file location

export default function ListYourProperty() {
  const { category, type, step } = useParams();
  const navigate = useNavigate();

  // Add debugging for development
  useEffect(() => {
    console.log('ListYourProperty params:', { category, type, step });
  }, [category, type, step]);

  const handlePropertyTypeSelect = (selectedCategory: string, selectedType: string, selectedCity: string) => {
    console.log('PropertyType selection:', { selectedCategory, selectedType, selectedCity });
    
    // Ensure proper URL path formation
    const path = `/properties/list/${selectedCategory.toLowerCase()}/${selectedType.toLowerCase()}/details`;
    console.log('Navigating to:', path);
    
    // Use replace to avoid building up history stack
    navigate(path, { replace: true });
  };

  // Initial rendering logic
  if (!category || !type) {
    console.log('Rendering PropertyForm with selection mode (no category/type)');
    return <PropertyForm showTypeSelection onTypeSelect={handlePropertyTypeSelect} />;
  }

  console.log('Rendering PropertyForm with params:', { category, type, step });
  return (
    <PropertyForm 
      selectedCategory={category}
      selectedAdType={type}
      currentStep={step}
    />
  );
}