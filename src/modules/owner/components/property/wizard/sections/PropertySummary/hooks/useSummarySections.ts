// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/useSummarySections.ts
// Version: 1.1.0
// Last Modified: 14-05-2025 10:35 IST
// Purpose: Enhanced summary sections data preparation hook with support for all flow types

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { StepIds, SummaryItem } from '../types';
import { getFieldValue } from '../services/dataExtractor';
import { formatArea, formatCurrency, formatBoolean, formatDistance, formatDimensions } from '../services/dataFormatter';
import { FLOW_TYPES } from '../../../constants/flows';

export const useSummarySections = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string,
  coordinates: string
) => {
  // Basic details items - common across all flows with flow-specific adjustments
  const basicDetailItems = useMemo<SummaryItem[]>(() => {
    const items: SummaryItem[] = [];
    const stepId = stepIds.basicDetails || '';
    
    // Common fields across most property types
    const propertyType = getFieldValue(formData, stepId, 'propertyType');
    const propertySubType = getFieldValue(formData, stepId, 'propertySubType');
    
    // Add property type and subtype if available
    if (propertyType) {
      items.push({ label: 'Property Type', value: propertyType });
    }
    
    if (propertySubType) {
      items.push({ label: 'Property Subtype', value: propertySubType });
    }
    
    // Flow-specific fields
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const landType = getFieldValue(formData, stepId, 'landType');
      const length = getFieldValue(formData, stepId, 'plotLength');
      const width = getFieldValue(formData, stepId, 'plotWidth');
      const area = getFieldValue(formData, stepId, 'builtUpArea');
      const areaUnit = getFieldValue(formData, stepId, 'builtUpAreaUnit') || 'sq.ft.';
      const facing = getFieldValue(formData, stepId, 'plotFacing');
      
      items.push(
        { label: 'Land Type', value: landType },
        { label: 'Total Area', value: formatArea(area, areaUnit) },
        { label: 'Plot Facing', value: facing }
      );
      
      if (length && width) {
        items.push({ label: 'Plot Dimensions', value: formatDimensions(length, width) });
      }
    } else if (flowType === FLOW_TYPES.RESIDENTIAL_SALE || flowType === FLOW_TYPES.RESIDENTIAL_RENT) {
      // Residential properties (sale or rent)
      const bhk = getFieldValue(formData, stepId, 'bhk');
      const bathrooms = getFieldValue(formData, stepId, 'bathrooms');
      const builtUpArea = getFieldValue(formData, stepId, 'builtUpArea');
      const areaUnit = getFieldValue(formData, stepId, 'builtUpAreaUnit') || 'sq.ft.';
      const floor = getFieldValue(formData, stepId, 'floor');
      const totalFloors = getFieldValue(formData, stepId, 'totalFloors');
      const ageOfProperty = getFieldValue(formData, stepId, 'ageOfProperty');
      const facing = getFieldValue(formData, stepId, 'facing');
      
      // Add residential-specific details
      if (bhk) items.push({ label: 'BHK', value: `${bhk} BHK` });
      if (bathrooms) items.push({ label: 'Bathrooms', value: bathrooms });
      if (builtUpArea) items.push({ label: 'Built-up Area', value: formatArea(builtUpArea, areaUnit) });
      
      if (floor && totalFloors) {
        items.push({ label: 'Floor', value: `${floor} out of ${totalFloors}` });
      } else if (floor) {
        items.push({ label: 'Floor', value: floor });
      }
      
      if (ageOfProperty) items.push({ label: 'Age of Property', value: ageOfProperty });
      if (facing) items.push({ label: 'Facing', value: facing });
    } else if (flowType === FLOW_TYPES.COMMERCIAL_SALE || flowType === FLOW_TYPES.COMMERCIAL_RENT) {
      // Commercial properties
      const commercialType = getFieldValue(formData, stepId, 'commercialType');
      const builtUpArea = getFieldValue(formData, stepId, 'builtUpArea');
      const areaUnit = getFieldValue(formData, stepId, 'builtUpAreaUnit') || 'sq.ft.';
      const floor = getFieldValue(formData, stepId, 'floor');
      const totalFloors = getFieldValue(formData, stepId, 'totalFloors');
      const cabins = getFieldValue(formData, stepId, 'cabins');
      const meetingRooms = getFieldValue(formData, stepId, 'meetingRooms');
      
      if (commercialType) items.push({ label: 'Commercial Type', value: commercialType });
      if (builtUpArea) items.push({ label: 'Built-up Area', value: formatArea(builtUpArea, areaUnit) });
      
      if (floor && totalFloors) {
        items.push({ label: 'Floor', value: `${floor} out of ${totalFloors}` });
      } else if (floor) {
        items.push({ label: 'Floor', value: floor });
      }
      
      if (cabins) items.push({ label: 'Cabins', value: cabins });
      if (meetingRooms) items.push({ label: 'Meeting Rooms', value: meetingRooms });
    } else if (flowType === FLOW_TYPES.PG_HOSTEL) {
      // PG/Hostel specific fields
      const pgType = getFieldValue(formData, stepIds.pgDetails || '', 'pgType');
      const occupancyType = getFieldValue(formData, stepIds.pgDetails || '', 'occupancyType');
      const totalBeds = getFieldValue(formData, stepIds.pgDetails || '', 'totalBeds');
      const mealsIncluded = getFieldValue(formData, stepIds.pgDetails || '', 'mealsIncluded');
      
      if (pgType) items.push({ label: 'PG Type', value: pgType });
      if (occupancyType) items.push({ label: 'Occupancy Type', value: occupancyType });
      if (totalBeds) items.push({ label: 'Total Beds', value: totalBeds });
      if (mealsIncluded) items.push({ label: 'Meals Included', value: formatBoolean(mealsIncluded) ? 'Yes' : 'No' });
    } else if (flowType === FLOW_TYPES.FLATMATES) {
      // Flatmate specific fields
      const preferredGender = getFieldValue(formData, stepIds.flatmateDetails || '', 'preferredGender');
      const tenantType = getFieldValue(formData, stepIds.flatmateDetails || '', 'tenantType');
      const availableFrom = getFieldValue(formData, stepIds.flatmateDetails || '', 'availableFrom');
      
      if (preferredGender) items.push({ label: 'Preferred Gender', value: preferredGender });
      if (tenantType) items.push({ label: 'Tenant Type', value: tenantType });
      if (availableFrom) items.push({ label: 'Available From', value: availableFrom });
    } else if (flowType === FLOW_TYPES.COWORKING) {
      // Co-working specific fields
      const workspaceType = getFieldValue(formData, stepIds.coworkingDetails || '', 'workspaceType');
      const seatingCapacity = getFieldValue(formData, stepIds.coworkingDetails || '', 'seatingCapacity');
      const amenities = getFieldValue(formData, stepIds.coworkingDetails || '', 'amenities');
      
      if (workspaceType) items.push({ label: 'Workspace Type', value: workspaceType });
      if (seatingCapacity) items.push({ label: 'Seating Capacity', value: seatingCapacity });
      if (amenities && Array.isArray(amenities)) items.push({ label: 'Amenities', value: amenities.join(', ') });
    }
    
    return items;
  }, [formData, stepIds, flowType]);

  // Location items - common across all flows
  const locationItems = useMemo<SummaryItem[]>(() => {
    const stepId = stepIds.location || '';
    return [
      { label: 'Plot No.', value: getFieldValue(formData, stepId, 'flatPlotNo') },
      { label: 'Address', value: getFieldValue(formData, stepId, 'address') },
      { label: 'Landmark', value: getFieldValue(formData, stepId, 'landmark') },
      { label: 'Locality', value: getFieldValue(formData, stepId, 'locality') },
      { label: 'Area', value: getFieldValue(formData, stepId, 'area') },
      { label: 'City', value: getFieldValue(formData, stepId, 'city') },
      { label: 'PIN Code', value: getFieldValue(formData, stepId, 'pinCode') },
      { label: 'Coordinates', value: coordinates }
    ];
  }, [formData, stepIds, coordinates]);

  // Sale details - for sale flows only
  const saleItems = useMemo<SummaryItem[]>(() => {
    // Check if this is a sale flow
    if (flowType.includes('SALE')) {
      const stepId = flowType === FLOW_TYPES.LAND_SALE 
        ? stepIds.basicDetails || '' // Price is in basic details for land
        : stepIds.saleDetails || '';
        
      const items: SummaryItem[] = [];
      
      // Common sale fields
      const expectedPrice = getFieldValue(formData, stepId, 'expectedPrice');
      if (expectedPrice) {
        items.push({ label: 'Expected Price', value: formatCurrency(expectedPrice) });
      }
      
      // Flow-specific fields
      if (flowType === FLOW_TYPES.LAND_SALE) {
        items.push(
          { 
            label: 'Development Status', 
            value: getFieldValue(formData, stepId, 'developmentStatus')
          },
          { 
            label: 'Approval Status', 
            value: getFieldValue(formData, stepId, 'approvalStatus')
          }
        );
      } else if (flowType === FLOW_TYPES.RESIDENTIAL_SALE) {
        const pricePerSqFt = getFieldValue(formData, stepId, 'pricePerSqFt');
        const bookingAmount = getFieldValue(formData, stepId, 'bookingAmount');
        
        if (pricePerSqFt) {
          items.push({ label: 'Price per Sq.Ft.', value: formatCurrency(pricePerSqFt) });
        }
        
        if (bookingAmount) {
          items.push({ label: 'Booking Amount', value: formatCurrency(bookingAmount) });
        }
      } else if (flowType === FLOW_TYPES.COMMERCIAL_SALE) {
        const pricePerSqFt = getFieldValue(formData, stepId, 'pricePerSqFt');
        const maintenanceCharges = getFieldValue(formData, stepId, 'maintenanceCharges');
        
        if (pricePerSqFt) {
          items.push({ label: 'Price per Sq.Ft.', value: formatCurrency(pricePerSqFt) });
        }
        
        if (maintenanceCharges) {
          items.push({ label: 'Maintenance Charges', value: formatCurrency(maintenanceCharges) });
        }
      }
      
      return items;
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // Rental details - for rent flows only
  const rentalItems = useMemo<SummaryItem[]>(() => {
    // Check if this is a rental flow
    if (flowType.includes('RENT') || flowType === FLOW_TYPES.PG_HOSTEL || flowType === FLOW_TYPES.FLATMATES || flowType === FLOW_TYPES.COWORKING) {
      const stepId = stepIds.rental || '';
      
      const items: SummaryItem[] = [];
      
      // Common rental fields
      const monthlyRent = getFieldValue(formData, stepId, 'monthlyRent');
      const securityDeposit = getFieldValue(formData, stepId, 'securityDeposit');
      
      if (monthlyRent) {
        items.push({ label: 'Monthly Rent', value: formatCurrency(monthlyRent) });
      }
      
      if (securityDeposit) {
        items.push({ label: 'Security Deposit', value: formatCurrency(securityDeposit) });
      }
      
      // Flow-specific fields
      if (flowType === FLOW_TYPES.RESIDENTIAL_RENT) {
        const maintenanceCharges = getFieldValue(formData, stepId, 'maintenanceCharges');
        const leaseType = getFieldValue(formData, stepId, 'leaseType');
        
        if (maintenanceCharges) {
          items.push({ label: 'Maintenance Charges', value: formatCurrency(maintenanceCharges) });
        }
        
        if (leaseType) {
          items.push({ label: 'Lease Type', value: leaseType });
        }
      } else if (flowType === FLOW_TYPES.COMMERCIAL_RENT) {
        const maintenanceCharges = getFieldValue(formData, stepId, 'maintenanceCharges');
        const leaseType = getFieldValue(formData, stepId, 'leaseType');
        
        if (maintenanceCharges) {
          items.push({ label: 'Maintenance Charges', value: formatCurrency(maintenanceCharges) });
        }
        
        if (leaseType) {
          items.push({ label: 'Lease Type', value: leaseType });
        }
      } else if (flowType === FLOW_TYPES.PG_HOSTEL) {
        const pgStepId = stepIds.pgDetails || '';
        const foodInclusion = getFieldValue(formData, pgStepId, 'foodInclusion');
        
        if (foodInclusion) {
          items.push({ label: 'Food Inclusion', value: foodInclusion });
        }
      } else if (flowType === FLOW_TYPES.COWORKING) {
        const coworkingStepId = stepIds.coworkingDetails || '';
        const rentalBasis = getFieldValue(formData, coworkingStepId, 'rentalBasis');
        
        if (rentalBasis) {
          items.push({ label: 'Rental Basis', value: rentalBasis });
        }
      }
      
      return items;
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // Features - for properties that have feature sections
  const featuresItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.RESIDENTIAL_SALE || flowType === FLOW_TYPES.RESIDENTIAL_RENT) {
      const stepId = stepIds.features || '';
      
      const items: SummaryItem[] = [];
      
      // Common residential features
      const furnishing = getFieldValue(formData, stepId, 'furnishing');
      const parking = getFieldValue(formData, stepId, 'parking');
      const balconies = getFieldValue(formData, stepId, 'balconies');
      
      if (furnishing) items.push({ label: 'Furnishing', value: furnishing });
      if (parking) items.push({ label: 'Parking', value: parking });
      if (balconies) items.push({ label: 'Balconies', value: balconies });
      
      // Amenities as a list
      const amenities = [];
      const amenityFields = [
        'lift', 'gym', 'swimmingPool', 'clubhouse', 'powerBackup', 'gatedSecurity',
        'waterSupply', 'gasConnection', 'park', 'rainwaterHarvesting'
      ];
      
      amenityFields.forEach(field => {
        if (formatBoolean(getFieldValue(formData, stepId, field))) {
          amenities.push(field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        }
      });
      
      if (amenities.length > 0) {
        items.push({ label: 'Amenities', value: amenities });
      }
      
      return items;
    } else if (flowType === FLOW_TYPES.COMMERCIAL_SALE || flowType === FLOW_TYPES.COMMERCIAL_RENT) {
      const stepId = stepIds.features || '';
      
      const items: SummaryItem[] = [];
      
      // Commercial features
      const furnishing = getFieldValue(formData, stepId, 'furnishing');
      const parking = getFieldValue(formData, stepId, 'parking');
      
      if (furnishing) items.push({ label: 'Furnishing', value: furnishing });
      if (parking) items.push({ label: 'Parking', value: parking });
      
      // Commercial amenities
      const amenities = [];
      const amenityFields = [
        'lift', 'powerBackup', 'security', 'airConditioning', 'cafeteria', 
        'conferenceRoom', 'fireSystem', 'internetConnectivity'
      ];
      
      amenityFields.forEach(field => {
        if (formatBoolean(getFieldValue(formData, stepId, field))) {
          amenities.push(field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        }
      });
      
      if (amenities.length > 0) {
        items.push({ label: 'Amenities', value: amenities });
      }
      
      return items;
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // PG/Hostel specific items
  const pgItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.PG_HOSTEL) {
      const stepId = stepIds.pgDetails || '';
      
      return [
        { label: 'Room Type', value: getFieldValue(formData, stepId, 'roomType') },
        { label: 'Occupancy', value: getFieldValue(formData, stepId, 'occupancy') },
        { label: 'Meals Included', value: formatBoolean(getFieldValue(formData, stepId, 'mealsIncluded')) ? 'Yes' : 'No' },
        { label: 'AC Rooms', value: formatBoolean(getFieldValue(formData, stepId, 'acRooms')) ? 'Yes' : 'No' },
        { label: 'WiFi', value: formatBoolean(getFieldValue(formData, stepId, 'wifi')) ? 'Yes' : 'No' },
        { label: 'TV', value: formatBoolean(getFieldValue(formData, stepId, 'tv')) ? 'Yes' : 'No' },
        { label: 'Washing Machine', value: formatBoolean(getFieldValue(formData, stepId, 'washingMachine')) ? 'Yes' : 'No' },
        { label: 'Housekeeping', value: formatBoolean(getFieldValue(formData, stepId, 'housekeeping')) ? 'Yes' : 'No' }
      ];
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // Flatmate specific items
  const flatmateItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.FLATMATES) {
      const stepId = stepIds.flatmateDetails || '';
      
      return [
        { label: 'Preferred Gender', value: getFieldValue(formData, stepId, 'preferredGender') },
        { label: 'Tenant Type', value: getFieldValue(formData, stepId, 'tenantType') },
        { label: 'Available From', value: getFieldValue(formData, stepId, 'availableFrom') },
        { label: 'Vegetarian Only', value: formatBoolean(getFieldValue(formData, stepId, 'vegetarianOnly')) ? 'Yes' : 'No' },
        { label: 'Smoking Allowed', value: formatBoolean(getFieldValue(formData, stepId, 'smokingAllowed')) ? 'Yes' : 'No' },
        { label: 'Drinking Allowed', value: formatBoolean(getFieldValue(formData, stepId, 'drinkingAllowed')) ? 'Yes' : 'No' }
      ];
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // Coworking specific items
  const coworkingItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.COWORKING) {
      const stepId = stepIds.coworkingDetails || '';
      
      return [
        { label: 'Workspace Type', value: getFieldValue(formData, stepId, 'workspaceType') },
        { label: 'Seating Capacity', value: getFieldValue(formData, stepId, 'seatingCapacity') },
        { label: 'Min. Booking Period', value: getFieldValue(formData, stepId, 'minBookingPeriod') },
        { label: 'Max. Booking Period', value: getFieldValue(formData, stepId, 'maxBookingPeriod') },
        { label: 'Internet Speed', value: getFieldValue(formData, stepId, 'internetSpeed') },
        { label: 'Meeting Rooms', value: formatBoolean(getFieldValue(formData, stepId, 'meetingRooms')) ? 'Yes' : 'No' },
        { label: 'Printer', value: formatBoolean(getFieldValue(formData, stepId, 'printer')) ? 'Yes' : 'No' },
        { label: 'Cafeteria', value: formatBoolean(getFieldValue(formData, stepId, 'cafeteria')) ? 'Yes' : 'No' },
        { label: '24/7 Access', value: formatBoolean(getFieldValue(formData, stepId, 'access247')) ? 'Yes' : 'No' },
        { label: 'Reception', value: formatBoolean(getFieldValue(formData, stepId, 'reception')) ? 'Yes' : 'No' }
      ];
    }
    
    return [];
  }, [formData, stepIds, flowType]);

  // Land feature items - specific to land sale
  const landFeatureItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const stepId = stepIds.landFeatures || '';
      return [
        { label: 'Corner Plot', value: formatBoolean(getFieldValue(formData, stepId, 'cornerPlot')) },
        { label: 'Park Facing', value: formatBoolean(getFieldValue(formData, stepId, 'parkFacing')) },
        { label: 'East Facing', value: formatBoolean(getFieldValue(formData, stepId, 'eastFacing')) },
        { label: 'Water Connection', value: formatBoolean(getFieldValue(formData, stepId, 'waterConnection')) },
        { label: 'Gated Community', value: formatBoolean(getFieldValue(formData, stepId, 'gatedCommunity')) },
        { label: 'Boundary Type', value: getFieldValue(formData, stepIds.basicDetails || '', 'boundaryType') },
        { label: 'Topography', value: getFieldValue(formData, stepIds.basicDetails || '', 'topographyType') },
        { label: 'Water Availability', value: getFieldValue(formData, stepIds.basicDetails || '', 'waterAvailability') },
        { label: 'Electricity Status', value: getFieldValue(formData, stepIds.basicDetails || '', 'electricityStatus') },
        { label: 'Road Connectivity', value: getFieldValue(formData, stepIds.basicDetails || '', 'roadConnectivity') },
        { label: 'Distance from City', value: formatDistance(getFieldValue(formData, stepId, 'distanceFromCity')) },
        { label: 'Distance from Highway', value: formatDistance(getFieldValue(formData, stepId, 'distanceFromHighway')) },
        { label: 'Nearby Facilities', value: getFieldValue(formData, stepId, 'nearbyFacilities') },
        { label: 'Land Documents', value: getFieldValue(formData, stepId, 'landDocuments') }
      ];
    }
    return [];
  }, [formData, stepIds, flowType]);

  return {
    basicDetailItems,
    locationItems,
    saleItems,
    rentalItems,
    featuresItems,
    landFeatureItems,
    flatmateItems,
    pgItems,
    coworkingItems
  };
};