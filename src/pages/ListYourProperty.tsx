// src/pages/ListYourProperty.tsx
// Version: 1.1.1
// Last Modified: 18-02-2025 18:30 IST

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyForm } from '@/components/property/wizard/PropertyForm';

export default function ListYourProperty() {
  const { category, type, step } = useParams();
  const navigate = useNavigate();

  console.log('ListYourProperty rendered with params:', { category, type, step });

  const handlePropertyTypeSelect = (selectedCategory: string, selectedType: string, selectedCity: string) => {
    console.log('handlePropertyTypeSelect called with:', { selectedCategory, selectedType, selectedCity });
    navigate(`/properties/list/${selectedCategory.toLowerCase()}/${selectedType.toLowerCase()}/details`);
  };

  if (!category || !type) {
    console.log('Rendering PropertyForm with selection mode');
    return <PropertyForm showTypeSelection onTypeSelect={handlePropertyTypeSelect} />;
  }

  console.log('Rendering PropertyForm with types:', { category, type, step });
  return (
    <PropertyForm 
      selectedCategory={category}
      selectedAdType={type}
      currentStep={step}
    />
  );
}