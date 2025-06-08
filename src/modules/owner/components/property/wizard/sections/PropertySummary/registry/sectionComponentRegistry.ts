// src/modules/owner/components/property/wizard/sections/PropertySummary/registry/sectionComponentRegistry.ts
// Version: 4.0.0
// Last Modified: 14-05-2025 23:15 IST
// Purpose: Maps section IDs to components with land components added

import { ComponentType } from 'react';
import { STEP_METADATA } from '../../../constants/flows';

// Import section components
import { PropertyDetailsSection } from '../sections/PropertyDetailsSection';
import { LocationSection } from '../sections/LocationSection';
import { SaleDetailsSection } from '../sections/SaleDetailsSection';
import { RentalDetailsSection } from '../sections/RentalDetailsSection';
import { AmenitiesSection } from '../sections/AmenitiesSection';
import { RoomDetailsSection } from '../sections/RoomDetailsSection';
import { PGDetailsSection } from '../sections/PGDetailsSection';
import { FlatmateDetailsSection } from '../sections/FlatmateDetailsSection';
import { CommercialBasicDetailsSection } from '../sections/CommercialBasicDetailsSection';
import { CommercialSaleDetailsSection } from '../sections/CommercialSaleDetailsSection';
import { CommercialRentalDetailsSection } from '../sections/CommercialRentalDetailsSection';
import { CommercialFeaturesSection } from '../sections/CommercialFeaturesSection';
import { CoworkingBasicDetailsSection } from '../sections/CoworkingBasicDetailsSection';
import { CoworkingDetailsSection } from '../sections/CoworkingDetailsSection';
import { LandDetailsSection } from '../sections/LandDetailsSection';
import { LandFeaturesDetailsSection } from '../sections/LandFeaturesDetailsSection';
import { PlaceholderSection } from '../sections/PlaceholderSection';

// Map of section IDs to their corresponding components
export const SECTION_COMPONENT_REGISTRY: Record<string, ComponentType<any>> = {
  // Residential sections
  'res_sale_basic_details': PropertyDetailsSection,
  'res_sale_location': LocationSection,
  'res_sale_sale_details': SaleDetailsSection,
  'res_sale_features': AmenitiesSection,
  'res_rent_basic_details': PropertyDetailsSection,
  'res_rent_location': LocationSection,
  'res_rent_rental': RentalDetailsSection,
  'res_rent_features': AmenitiesSection,
  'res_flat_basic_details': RoomDetailsSection,
  'res_flat_location': LocationSection,
  'res_flat_flatmate_details': FlatmateDetailsSection,
  'res_flat_features': AmenitiesSection,
  'res_pg_basic_details': RoomDetailsSection,
  'res_pg_location': LocationSection,
  'res_pg_pg_details': PGDetailsSection,
  'res_pg_features': AmenitiesSection,
  
  // Commercial sections
  'com_sale_basic_details': CommercialBasicDetailsSection,
  'com_sale_location': LocationSection,
  'com_sale_sale_details': CommercialSaleDetailsSection,
  'com_sale_features': CommercialFeaturesSection,
  'com_rent_basic_details': CommercialBasicDetailsSection,
  'com_rent_location': LocationSection,
  'com_rent_rental': CommercialRentalDetailsSection,
  'com_rent_features': CommercialFeaturesSection,
  'com_cow_basic_details': CoworkingBasicDetailsSection,
  'com_cow_location': LocationSection,
  'com_cow_coworking_details': CoworkingDetailsSection,
  'com_cow_features': AmenitiesSection, // Can reuse AmenitiesSection for coworking
  
  // Land sections - updated with actual components
  'land_sale_basic_details': LandDetailsSection,
  'land_sale_location': LocationSection,
  'land_sale_land_features': LandFeaturesDetailsSection
};

// Function to get a section component with its metadata
export function getSectionWithMetadata(sectionId: string) {
  const Component = SECTION_COMPONENT_REGISTRY[sectionId];
  const metadata = STEP_METADATA[sectionId] || {
    name: sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: null
  };
  
  if (!Component) {
    console.warn(`No component found for section ID: ${sectionId}`);
    return {
      Component: PlaceholderSection,
      metadata
    };
  }
  
  return {
    Component,
    metadata
  };
}