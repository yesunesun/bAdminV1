// src/modules/owner/pages/ListYourProperty.tsx
// Version: 2.0.0
// Last Modified: 14-04-2025 08:45 IST
// Purpose: Fully reset wizard state when accessed with reset parameter

import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { PropertyForm } from '@/modules/owner/components/property/wizard/PropertyForm/index';

export default function ListYourProperty() {
  const { category, type, step } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Process reset parameter and localStorage flag on mount
  useEffect(() => {
    // Check if reset parameter exists
    const hasResetParam = searchParams.has('reset');
    const resetFlag = localStorage.getItem('resetPropertyWizard');

    console.log('ListYourProperty mounted with params:', { 
      category, 
      type, 
      step,
      hasResetParam,
      resetFlag,
      pathname: location.pathname
    });

    // Clear any reset flags and parameters
    if (hasResetParam) {
      // Remove the reset parameter from URL
      searchParams.delete('reset');
      setSearchParams(searchParams);
    }
    
    if (resetFlag === 'true') {
      // Clear the localStorage flag
      localStorage.removeItem('resetPropertyWizard');
      
      // If we're in a deep path and not already at the root listing path, redirect to it
      if ((category || type || step) && location.pathname !== '/properties/list') {
        console.log('Redirecting to /properties/list due to reset flag');
        navigate('/properties/list', { replace: true });
        return;
      }
    }

    // If we have category and type but no step, add details step
    if (category && type && !step) {
      console.log('No step specified, redirecting to details step');
      navigate(`/properties/list/${category.toLowerCase()}/${type.toLowerCase()}/details`, { replace: true });
    }
  }, [category, type, step, navigate, searchParams, setSearchParams, location.pathname]);

  // Function to handle property type selection
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