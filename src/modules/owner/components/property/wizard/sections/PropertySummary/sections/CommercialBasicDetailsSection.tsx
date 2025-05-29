// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CommercialBasicDetailsSection.tsx
// Version: 1.2.0
// Last Modified: 29-05-2025 14:55 IST
// Purpose: Removed furnishing status display - now handled in Features section only

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const CommercialBasicDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType,
  steps
}) => {
  if (!data && !steps) return null;
  
  // Try to get data from the step structure first, then fall back to flat structure
  const stepData = steps?.com_rent_basic_details || {};
  
  // Combine data from both sources with preference to step data
  const combinedData = {
    ...data,
    ...stepData,
    // Explicitly map fields that might have different names
    commercialPropertyType: stepData.propertyType || data.commercialPropertyType || data.propertyType,
    subType: stepData.buildingType || data.subType || data.buildingType,
    builtUpArea: stepData.builtUpArea || data.builtUpArea,
    builtUpAreaUnit: stepData.builtUpAreaUnit || data.builtUpAreaUnit,
    floor: stepData.floor || data.floor,
    totalFloors: stepData.totalFloors || data.totalFloors,
    constructionAge: stepData.ageOfProperty || data.constructionAge || data.ageOfProperty,
    parking: data.parking || (stepData.carParking ? `${stepData.carParking} car space(s)` : null),
    washrooms: data.washrooms || stepData.totalFloors, // Using totalFloors as a fallback if washrooms not specified
    hasPantry: stepData.receptionArea === 'Yes' || data.hasPantry,
    hasCafeteria: data.hasCafeteria
  };
  
  return (
    <div className="space-y-2">
      {/* Commercial Property Type */}
      <FieldText 
        label="Commercial Type" 
        value={combinedData.commercialPropertyType || combinedData.propertyType} 
      />
      
      {/* Sub Type */}
      <FieldText 
        label="Sub Type" 
        value={combinedData.subType || combinedData.buildingType} 
      />
      
      {/* Built-up Area */}
      {combinedData.builtUpArea && (
        <FieldArea
          label="Built-up Area"
          value={combinedData.builtUpArea}
          unit={combinedData.builtUpAreaUnit || 'sqft'}
        />
      )}
      
      {/* Floor */}
      {(combinedData.floor !== undefined && combinedData.totalFloors !== undefined) && (
        <FieldText
          label="Floor"
          value={`${combinedData.floor} out of ${combinedData.totalFloors}`}
        />
      )}
      
      {/* Age of Construction */}
      <FieldText 
        label="Construction Age" 
        value={combinedData.constructionAge || combinedData.ageOfProperty} 
      />
      
      {/* Parking */}
      <FieldText 
        label="Parking" 
        value={combinedData.parking || (combinedData.carParking ? `${combinedData.carParking} car space(s)` : null)} 
      />
      
      {/* Washrooms */}
      <FieldText 
        label="Washrooms" 
        value={combinedData.washrooms} 
      />
      
      {/* Reception Area */}
      <FieldBoolean 
        label="Reception Area" 
        value={combinedData.receptionArea === 'Yes'} 
      />
      
      {/* Pantry/Cafeteria */}
      <FieldBoolean 
        label="Pantry/Cafeteria" 
        value={combinedData.hasPantry || combinedData.hasCafeteria} 
      />
    </div>
  );
};