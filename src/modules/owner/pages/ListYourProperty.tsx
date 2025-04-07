// src/modules/owner/pages/ListYourProperty.tsx
// Version: 1.0.0
// Last Modified: 07-04-2025 17:00 IST
// Purpose: Fix routing issue with property listing wizard

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyForm } from '@/modules/owner/components/property/wizard/PropertyForm/index';

export default function ListYourProperty() {
  const { category, type, step } = useParams();
  const navigate = useNavigate();

  // Add debugging for development
  useEffect(() => {
    console.log('ListYourProperty params:', { category, type, step });
    
    // Clear any stored form data on component mount
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.removeItem(`propertyWizard_${userId}_data`);
      localStorage.removeItem(`propertyWizard_${userId}_step`);
    }

    // Fix for navigation: If no step specified, redirect to details step
    if (category && type && !step) {
      console.log('No step specified, redirecting to details step');
      navigate(`/properties/list/${category.toLowerCase()}/${type.toLowerCase()}/details`, { replace: true });
    }
  }, [category, type, step, navigate]);

  const handlePropertyTypeSelect = (selectedCategory: string, selectedType: string, selectedCity: string) => {
    console.log('PropertyType selection:', { selectedCategory, selectedType, selectedCity });
    
    // Ensure proper URL path formation with 'details' as default step
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