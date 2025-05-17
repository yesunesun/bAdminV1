// src/modules/owner/components/property/wizard/sections/CoworkingDetails.tsx
// Version: 1.2.0
// Last Modified: 17-05-2025 15:45 IST
// Purpose: Fix utils import to use the correct exports

import React, { useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { useStepForm } from '../hooks/useStepForm';
import { 
  COWORKING_PRICING_STRUCTURES,
  COWORKING_LEASE_TERMS,
  COWORKING_BOOKING_OPTIONS,
  COWORKING_INTERNET_SPEEDS,
  COWORKING_AMENITIES
} from '../constants/coworkingDetails';
import { utils } from '@/lib/utils';

const CoworkingDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType,
  stepId = 'com_cow_coworking_details' // Default step ID for coworking details
}) => {
  const { 
    registerField, 
    getFieldError, 
    setFieldValue, 
    getFieldValue,
    getFieldId
  } = useStepForm(form, stepId);
  
  // Migrate data from root to step object if needed
  useEffect(() => {
    const fieldsToMigrate = [
      'coworkingSpaceType', 'totalCapacity', 'availableCapacity', 'pricingStructure',
      'basePrice', 'leaseTerm', 'securityDeposit', 'bookingOption', 'openingTime',
      'closingTime', 'operatingHours', 'accessPolicy', 'operatingDays',
      'internetSpeed', 'coworkingAmenities', 'additionalInformation',
      'officeSize', 'seatingCapacity'
    ];
    
    // Check each field and migrate if needed
    fieldsToMigrate.forEach(field => {
      const currentValue = getFieldValue(field);
      const rootValue = form.getValues(field);
      
      // If there's a value at the root but not in the step, migrate it
      if (rootValue !== undefined && currentValue === undefined) {
        setFieldValue(field, rootValue);
      }
    });
    
    // Handle calculation of operating hours as a composite field
    const openingTime = getFieldValue('openingTime') || form.getValues('openingTime');
    const closingTime = getFieldValue('closingTime') || form.getValues('closingTime');
    
    if (openingTime && closingTime) {
      const operatingHours = `${openingTime} - ${closingTime}`;
      setFieldValue('operatingHours', operatingHours);
    }
  }, []);
  
  // Update operating hours when opening or closing time changes
  const handleTimeChange = () => {
    const openingTime = getFieldValue('openingTime');
    const closingTime = getFieldValue('closingTime');
    
    if (openingTime && closingTime) {
      const operatingHours = `${openingTime} - ${closingTime}`;
      setFieldValue('operatingHours', operatingHours);
    }
  };
  
  return (
    <FormSection
      title="Co-working Space Details"
      description="Provide specific details about your co-working space"
    >
      <div className="space-y-6">
        {/* Space Type - This might be redundant with basic details */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('coworkingSpaceType')} className="mb-2 block">
            Co-working Space Type
          </RequiredLabel>
          <select
            id={getFieldId('coworkingSpaceType')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('coworkingSpaceType')}
          >
            <option value="">Select space type</option>
            <option value="Hot Desk">Hot Desk</option>
            <option value="Dedicated Desk">Dedicated Desk</option>
            <option value="Private Office">Private Office</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Event Space">Event Space</option>
          </select>
          {getFieldError('coworkingSpaceType') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('coworkingSpaceType')?.message as string}</p>
          )}
        </div>
        
        {/* Capacity */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('totalCapacity')} className="mb-2 block">
              Total Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('totalCapacity')}
              type="number"
              placeholder="e.g., 50"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('totalCapacity')}
            />
            {getFieldError('totalCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('totalCapacity')?.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('availableCapacity')} className="mb-2 block">
              Available Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('availableCapacity')}
              type="number"
              placeholder="e.g., 20"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('availableCapacity')}
            />
            {getFieldError('availableCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('availableCapacity')?.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Pricing Structure */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('pricingStructure')} className="mb-2 block">
            Pricing Structure
          </RequiredLabel>
          <select
            id={getFieldId('pricingStructure')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('pricingStructure')}
          >
            <option value="">Select pricing structure</option>
            {COWORKING_PRICING_STRUCTURES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('pricingStructure') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('pricingStructure')?.message as string}</p>
          )}
        </div>
        
        {/* Base Price */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('basePrice')} className="mb-2 block">
            Base Price (₹)
          </RequiredLabel>
          <Input
            id={getFieldId('basePrice')}
            type="number"
            placeholder="e.g., 5000"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...registerField('basePrice')}
          />
          {getFieldError('basePrice') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('basePrice')?.message as string}</p>
          )}
        </div>
        
        {/* Lease Term */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('leaseTerm')} className="mb-2 block">
            Lease Term
          </RequiredLabel>
          <select
            id={getFieldId('leaseTerm')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('leaseTerm')}
          >
            <option value="">Select lease term</option>
            {COWORKING_LEASE_TERMS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('leaseTerm') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('leaseTerm')?.message as string}</p>
          )}
        </div>
        
        {/* Security Deposit */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('securityDeposit')} className="mb-2 block">
            Security Deposit (₹)
          </RequiredLabel>
          <Input
            id={getFieldId('securityDeposit')}
            type="number"
            placeholder="e.g., 10000"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...registerField('securityDeposit')}
          />
          {getFieldError('securityDeposit') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('securityDeposit')?.message as string}</p>
          )}
        </div>
        
        {/* Booking Option */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('bookingOption')} className="mb-2 block">
            Booking Option
          </RequiredLabel>
          <select
            id={getFieldId('bookingOption')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('bookingOption')}
          >
            <option value="">Select booking option</option>
            {COWORKING_BOOKING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('bookingOption') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('bookingOption')?.message as string}</p>
          )}
        </div>
        
        {/* Operating Hours */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('openingTime')} className="mb-2 block">
              Opening Time
            </RequiredLabel>
            <Input
              id={getFieldId('openingTime')}
              type="time"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('openingTime')}
              onChange={(e) => {
                form.setValue(`steps.${stepId}.openingTime`, e.target.value);
                handleTimeChange();
              }}
            />
            {getFieldError('openingTime') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('openingTime')?.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('closingTime')} className="mb-2 block">
              Closing Time
            </RequiredLabel>
            <Input
              id={getFieldId('closingTime')}
              type="time"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('closingTime')}
              onChange={(e) => {
                form.setValue(`steps.${stepId}.closingTime`, e.target.value);
                handleTimeChange();
              }}
            />
            {getFieldError('closingTime') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('closingTime')?.message as string}</p>
            )}
          </div>
          
          {/* Hidden field to store combined operating hours */}
          <input type="hidden" {...registerField('operatingHours')} />
        </div>
        
        {/* Operating Days */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block">Operating Days</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <label 
                key={day} 
                className="flex items-center space-x-2 border border-border rounded-lg px-3 py-2"
              >
                <input 
                  type="checkbox" 
                  value={day} 
                  id={getFieldId(`operatingDays-${day}`)}
                  {...registerField('operatingDays')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
          {getFieldError('operatingDays') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('operatingDays')?.message as string}</p>
          )}
        </div>
        
        {/* Internet Speed */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('internetSpeed')} className="mb-2 block">
            Internet Speed
          </RequiredLabel>
          <select
            id={getFieldId('internetSpeed')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('internetSpeed')}
          >
            <option value="">Select internet speed</option>
            {COWORKING_INTERNET_SPEEDS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('internetSpeed') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('internetSpeed')?.message as string}</p>
          )}
        </div>
        
        {/* Coworking Amenities */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block">Amenities</RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COWORKING_AMENITIES.map((amenity) => (
              <label 
                key={amenity} 
                className="flex items-center space-x-2 border border-border rounded-lg px-3 py-2"
              >
                <input 
                  type="checkbox" 
                  value={amenity}
                  id={getFieldId(`coworkingAmenities-${utils.slugify(amenity)}`)} 
                  {...registerField('coworkingAmenities')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
          {getFieldError('coworkingAmenities') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('coworkingAmenities')?.message as string}</p>
          )}
        </div>
        
        {/* Additional Information */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor={getFieldId('additionalInformation')}>
              Additional Information
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Optional</div>
          </div>
          <Textarea
            id={getFieldId('additionalInformation')}
            placeholder="Any additional information about your co-working space..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-24"
            {...registerField('additionalInformation')}
          />
          {getFieldError('additionalInformation') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('additionalInformation')?.message as string}</p>
          )}
        </div>
        
        {/* Office Size and Seating Capacity */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('officeSize')} className="mb-2 block">
              Office Size (sqft)
            </RequiredLabel>
            <Input
              id={getFieldId('officeSize')}
              type="number"
              placeholder="e.g., 500"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('officeSize')}
            />
            {getFieldError('officeSize') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('officeSize')?.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('seatingCapacity')} className="mb-2 block">
              Seating Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('seatingCapacity')}
              type="number"
              placeholder="e.g., 20"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('seatingCapacity')}
            />
            {getFieldError('seatingCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('seatingCapacity')?.message as string}</p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingDetails;