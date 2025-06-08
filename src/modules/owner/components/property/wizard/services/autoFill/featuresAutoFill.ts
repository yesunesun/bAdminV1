// src/modules/owner/components/property/wizard/services/autoFill/featuresAutoFill.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Auto fill service for features tab

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';
import { DOMUtilsService } from './domUtilsService';

export class FeaturesAutoFill {
  /**
   * Fill features details section of the form using React Hook Form
   */
  static fillForm(form: UseFormReturn<FormData>): void {
    form.setValue('amenities', [
      'Power Backup',
      'Lift',
      'Swimming Pool',
      'Gym',
      '24x7 Security',
      'Children\'s Play Area',
      'Club House',
      'Visitor Parking',
      'Garden'
    ], { shouldDirty: true });
    
    form.setValue('parking', 'Car & Bike', { shouldDirty: true });
    form.setValue('petFriendly', true, { shouldDirty: true });
    form.setValue('nonVegAllowed', true, { shouldDirty: true });
    form.setValue('gatedSecurity', true, { shouldDirty: true });
    form.setValue('description', 'A beautiful spacious apartment with excellent ventilation and natural light. Located in a premium gated community with top-notch amenities.', { shouldDirty: true });
    form.setValue('propertyShowOption', 'Any Time', { shouldDirty: true });
    form.setValue('propertyCondition', 'Excellent', { shouldDirty: true });
    form.setValue('hasGym', true, { shouldDirty: true });
    form.setValue('secondaryNumber', '9876543210', { shouldDirty: true });
    form.setValue('hasSimilarUnits', false, { shouldDirty: true });
    form.setValue('direction', 'North-East', { shouldDirty: true });
    
    // Set structured data for v2 format
    form.setValue('features', {
      amenities: [
        'Power Backup',
        'Lift',
        'Swimming Pool',
        'Gym',
        '24x7 Security',
        'Children\'s Play Area',
        'Club House',
        'Visitor Parking',
        'Garden'
      ],
      parking: 'Car & Bike',
      petFriendly: true,
      nonVegAllowed: true,
      waterSupply: '24 Hours',
      powerBackup: 'Full',
      gatedSecurity: true,
      description: 'A beautiful spacious apartment with excellent ventilation and natural light. Located in a premium gated community with top-notch amenities.',
      propertyShowOption: 'Any Time',
      propertyCondition: 'Excellent',
      hasGym: true,
      secondaryNumber: '9876543210',
      hasSimilarUnits: false,
      direction: 'North-East'
    }, { shouldDirty: true });
    
    // Trigger validation
    form.trigger();
    
    console.log("Features details filled successfully via React Hook Form");
  }
  
  /**
   * Fill DOM elements for features tab
   */
  static fillDOMElements(): void {
    try {
      console.log("Filling features fields using DOM manipulation");
      
      // Check amenities checkboxes
      const amenities = [
        'Power Backup', 'Lift', 'Swimming Pool', 'Gym', 'Security',
        'Play Area', 'Club House', 'Visitor Parking', 'Garden'
      ];
      
      amenities.forEach(amenity => {
        DOMUtilsService.checkCheckboxByLabel([amenity.toLowerCase()], true);
      });
      
      // Fill description
      DOMUtilsService.fillInputByLabel(
        ['description', 'about property'],
        'A beautiful spacious apartment with excellent ventilation and natural light. Located in a premium gated community with top-notch amenities.'
      );
      
      // Select Property Show Option
      DOMUtilsService.fillRadixSelectByMapping({
        labelTexts: ['property show', 'viewing time', 'visit time'],
        values: ['Any Time', 'Weekends Only', 'Weekdays Only'],
        dataTestId: 'propertyShowOption'
      });
      
      // Select Property Condition
      DOMUtilsService.fillRadixSelectByMapping({
        labelTexts: ['condition', 'property condition'],
        values: ['Excellent', 'Good', 'Average', 'Needs Renovation'],
        dataTestId: 'propertyCondition'
      });
      
      // Fill Secondary Contact Number
      DOMUtilsService.fillInputByLabel(['secondary', 'alternate', 'another contact'], '9876543210');
      
      // Check other feature checkboxes
      DOMUtilsService.checkCheckboxByLabel(['gym', 'fitness center'], true);
      DOMUtilsService.checkCheckboxByLabel(['gated', 'secure community'], true);
      
      console.log("Features fields filled successfully");
    } catch (error) {
      console.error("Error filling features fields:", error);
    }
  }
}