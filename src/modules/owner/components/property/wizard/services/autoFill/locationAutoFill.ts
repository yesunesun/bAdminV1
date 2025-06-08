// src/modules/owner/components/property/wizard/services/autoFill/locationAutoFill.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Auto fill service for location tab

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';
import { DOMUtilsService } from './domUtilsService';

export class LocationAutoFill {
  /**
   * Fill location details section of the form using React Hook Form
   */
  static fillForm(form: UseFormReturn<FormData>): void {
    form.setValue('address', '123 Lake View Apartments, Green Avenue', { shouldDirty: true });
    form.setValue('flatPlotNo', 'B-304', { shouldDirty: true });
    form.setValue('landmark', 'Near Central Park', { shouldDirty: true });
    form.setValue('locality', 'Jubilee Hills', { shouldDirty: true });
    form.setValue('area', 'Jubilee Hills', { shouldDirty: true });
    form.setValue('city', 'Hyderabad', { shouldDirty: true });
    form.setValue('state', 'Telangana', { shouldDirty: true });
    form.setValue('district', 'Hyderabad', { shouldDirty: true });
    form.setValue('pinCode', '500033', { shouldDirty: true });
    form.setValue('latitude', 17.423889, { shouldDirty: true });
    form.setValue('longitude', 78.445833, { shouldDirty: true });
    
    // Set structured data for v2 format
    form.setValue('location', {
      address: '123 Lake View Apartments, Green Avenue',
      flatPlotNo: 'B-304',
      landmark: 'Near Central Park',
      locality: 'Jubilee Hills',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      pinCode: '500033',
      coordinates: {
        latitude: 17.423889,
        longitude: 78.445833
      }
    }, { shouldDirty: true });
    
    // Trigger validation
    form.trigger();
    
    console.log("Location details filled successfully via React Hook Form");
  }
  
  /**
   * Fill DOM elements for location tab
   */
  static fillDOMElements(): void {
    try {
      console.log("Filling location fields using DOM manipulation");
      
      // Fill address
      DOMUtilsService.fillInputByLabel(['address', 'street'], '123 Lake View Apartments, Green Avenue');
      
      // Fill flat/plot number
      DOMUtilsService.fillInputByLabel(['flat', 'plot', 'house number'], 'B-304');
      
      // Fill landmark
      DOMUtilsService.fillInputByLabel(['landmark', 'nearby'], 'Near Central Park');
      
      // Fill locality/area
      DOMUtilsService.fillInputByLabel(['locality', 'area', 'neighborhood'], 'Jubilee Hills');
      
      // Fill city
      DOMUtilsService.fillInputByLabel(['city', 'town'], 'Hyderabad');
      
      // Fill state
      DOMUtilsService.fillInputByLabel(['state', 'province'], 'Telangana');
      
      // Fill district
      DOMUtilsService.fillInputByLabel(['district'], 'Hyderabad');
      
      // Fill pincode
      DOMUtilsService.fillInputByLabel(['pin', 'pincode', 'zip', 'postal'], '500033');
      
      // Try to select location on map if available
      const setLocationButton = document.querySelector('button[type="button"]');
      if (setLocationButton && setLocationButton.textContent?.includes('Set Location')) {
        console.log("Found set location button, clicking");
        (setLocationButton as HTMLButtonElement).click();
        
        // Wait a bit for the map to load and then try to click a point
        setTimeout(() => {
          const mapContainer = document.querySelector('[class*="map-container"]');
          if (mapContainer) {
            console.log("Found map container, simulating click");
            const mapElement = mapContainer as HTMLElement;
            // Simulate a click at the center of the map
            const rect = mapElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: centerX,
              clientY: centerY
            });
            
            mapElement.dispatchEvent(clickEvent);
            
            // Try to find the confirm button
            setTimeout(() => {
              const confirmButton = document.querySelector('button[type="button"]');
              if (confirmButton && confirmButton.textContent?.includes('Confirm')) {
                console.log("Found confirm location button, clicking");
                (confirmButton as HTMLButtonElement).click();
              }
            }, 500);
          }
        }, 1000);
      }
      
      console.log("Location fields filled successfully");
    } catch (error) {
      console.error("Error filling location fields:", error);
    }
  }
}