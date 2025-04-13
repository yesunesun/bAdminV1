// src/modules/owner/components/property/wizard/sections/CoworkingDetails.tsx
// Version: 1.2.0
// Last Modified: 14-04-2025 17:15 IST
// Purpose: Updated Operating Hours with time selection controls

import React, { useState } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';
import { 
  COWORKING_SPACE_TYPES, 
  COWORKING_LEASE_TERMS, 
  COWORKING_AMENITIES,
  DESK_TYPES,
  BOOKING_OPTIONS,
  PRICING_STRUCTURES,
  ACCESS_POLICY_OPTIONS,
  INTERNET_SPEED_OPTIONS
} from '../constants/coworkingDetails';

const CoworkingDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for selected space type to show conditional fields
  const spaceType = watch('coworkingSpaceType');
  const showDeskOptions = spaceType === 'Dedicated Desk' || spaceType === 'Hot Desk';
  const showOfficeOptions = spaceType === 'Private Office';
  
  // Watch for operating hours
  const openingTime = watch('openingTime') || '';
  const closingTime = watch('closingTime') || '';
  
  // Format operating hours when both times are selected
  React.useEffect(() => {
    if (openingTime && closingTime) {
      setValue('operatingHours', `${openingTime} - ${closingTime}`);
    }
  }, [openingTime, closingTime, setValue]);
  
  return (
    <FormSection
      title="Co-working Space Details"
      description="Provide details about your co-working space"
    >
      <div className="space-y-6">
        {/* Space Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor="coworkingSpaceType" className="mb-2 block">
            Co-working Space Type
          </RequiredLabel>
          <select
            id="coworkingSpaceType"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('coworkingSpaceType')}
          >
            <option value="">Select space type</option>
            {COWORKING_SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.coworkingSpaceType && (
            <p className="text-sm text-destructive mt-1">{errors.coworkingSpaceType.message as string}</p>
          )}
        </div>
        
        {/* Capacity */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="totalCapacity" className="mb-2 block">
              Total Capacity
            </RequiredLabel>
            <Input
              id="totalCapacity"
              type="number"
              placeholder="e.g., 50"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('totalCapacity')}
            />
            {errors.totalCapacity && (
              <p className="text-sm text-destructive mt-1">{errors.totalCapacity.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="availableCapacity" className="mb-2 block">
              Available Capacity
            </RequiredLabel>
            <Input
              id="availableCapacity"
              type="number"
              placeholder="e.g., 25"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('availableCapacity')}
            />
            {errors.availableCapacity && (
              <p className="text-sm text-destructive mt-1">{errors.availableCapacity.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Pricing Structure */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="pricingStructure" className="mb-2 block">
              Pricing Structure
            </RequiredLabel>
            <select
              id="pricingStructure"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('pricingStructure')}
            >
              <option value="">Select pricing structure</option>
              {PRICING_STRUCTURES.map((structure) => (
                <option key={structure} value={structure}>
                  {structure}
                </option>
              ))}
            </select>
            {errors.pricingStructure && (
              <p className="text-sm text-destructive mt-1">{errors.pricingStructure.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="basePrice" className="mb-2 block">
              Base Price (₹)
            </RequiredLabel>
            <Input
              id="basePrice"
              type="text"
              placeholder="e.g., 5000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('basePrice')}
            />
            {errors.basePrice && (
              <p className="text-sm text-destructive mt-1">{errors.basePrice.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Desk Type Options - Conditional based on space type */}
        {showDeskOptions && (
          <div className="mb-6">
            <RequiredLabel htmlFor="deskType" className="mb-2 block">
              Desk Type
            </RequiredLabel>
            <select
              id="deskType"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('deskType')}
            >
              <option value="">Select desk type</option>
              {DESK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.deskType && (
              <p className="text-sm text-destructive mt-1">{errors.deskType.message as string}</p>
            )}
          </div>
        )}
        
        {/* Private Office Options - Conditional based on space type */}
        {showOfficeOptions && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <RequiredLabel htmlFor="officeSize" className="mb-2 block">
                Office Size (sq.ft)
              </RequiredLabel>
              <Input
                id="officeSize"
                type="number"
                placeholder="e.g., 200"
                className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                {...register('officeSize')}
              />
              {errors.officeSize && (
                <p className="text-sm text-destructive mt-1">{errors.officeSize.message as string}</p>
              )}
            </div>
            
            <div>
              <RequiredLabel htmlFor="seatingCapacity" className="mb-2 block">
                Seating Capacity
              </RequiredLabel>
              <Input
                id="seatingCapacity"
                type="number"
                placeholder="e.g., 6"
                className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                {...register('seatingCapacity')}
              />
              {errors.seatingCapacity && (
                <p className="text-sm text-destructive mt-1">{errors.seatingCapacity.message as string}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Lease Terms */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="leaseTerm" className="mb-2 block">
              Lease Term
            </RequiredLabel>
            <select
              id="leaseTerm"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('leaseTerm')}
            >
              <option value="">Select lease term</option>
              {COWORKING_LEASE_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
            {errors.leaseTerm && (
              <p className="text-sm text-destructive mt-1">{errors.leaseTerm.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="securityDeposit" className="mb-2 block">
              Security Deposit (₹)
            </RequiredLabel>
            <Input
              id="securityDeposit"
              type="text"
              placeholder="e.g., 10000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('securityDeposit')}
            />
            {errors.securityDeposit && (
              <p className="text-sm text-destructive mt-1">{errors.securityDeposit.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Booking Options */}
        <div className="mb-6">
          <RequiredLabel htmlFor="bookingOption" className="mb-2 block">
            Booking Option
          </RequiredLabel>
          <select
            id="bookingOption"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('bookingOption')}
          >
            <option value="">Select booking option</option>
            {BOOKING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.bookingOption && (
            <p className="text-sm text-destructive mt-1">{errors.bookingOption.message as string}</p>
          )}
        </div>
        
        {/* Operating Hours and Access - Updated with time controls */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="operatingHours" className="mb-2 block">
              Operating Hours
            </RequiredLabel>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="openingTime" className="text-xs text-gray-500 mb-1 block">Opening Time</label>
                <Input
                  id="openingTime"
                  type="time"
                  className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                  {...register('openingTime')}
                />
              </div>
              <div>
                <label htmlFor="closingTime" className="text-xs text-gray-500 mb-1 block">Closing Time</label>
                <Input
                  id="closingTime"
                  type="time"
                  className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                  {...register('closingTime')}
                />
              </div>
            </div>
            <input type="hidden" {...register('operatingHours')} />
            {errors.operatingHours && (
              <p className="text-sm text-destructive mt-1">{errors.operatingHours.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="accessPolicy" className="mb-2 block">
              Access Policy
            </RequiredLabel>
            <select
              id="accessPolicy"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('accessPolicy')}
            >
              <option value="">Select access policy</option>
              {ACCESS_POLICY_OPTIONS.map((policy) => (
                <option key={policy} value={policy}>
                  {policy}
                </option>
              ))}
            </select>
            {errors.accessPolicy && (
              <p className="text-sm text-destructive mt-1">{errors.accessPolicy.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Days of Operation - New field */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block">Days of Operation</RequiredLabel>
          <div className="grid grid-cols-4 gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  value={day}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
                  {...register('operatingDays')}
                />
                <label
                  htmlFor={`day-${day}`}
                  className="text-sm font-medium"
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
          {errors.operatingDays && (
            <p className="text-sm text-destructive mt-1">{errors.operatingDays.message as string}</p>
          )}
        </div>
        
        {/* Internet Speed */}
        <div className="mb-6">
          <RequiredLabel htmlFor="internetSpeed" className="mb-2 block">
            Internet Speed
          </RequiredLabel>
          <select
            id="internetSpeed"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('internetSpeed')}
          >
            <option value="">Select internet speed</option>
            {INTERNET_SPEED_OPTIONS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}
              </option>
            ))}
          </select>
          {errors.internetSpeed && (
            <p className="text-sm text-destructive mt-1">{errors.internetSpeed.message as string}</p>
          )}
        </div>
        
        {/* Co-working Amenities */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block">Available Amenities</RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COWORKING_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  value={amenity}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
                  {...register('coworkingAmenities')}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Information */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor="additionalInformation">
              Additional Information
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Recommended</div>
          </div>
          <Textarea
            id="additionalInformation"
            placeholder="Add any additional details about your co-working space..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-32"
            {...register('additionalInformation')}
          />
          {errors.additionalInformation && (
            <p className="text-sm text-destructive mt-1">{errors.additionalInformation.message as string}</p>
          )}
          <div className="mt-2 flex items-start text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="8"></line>
            </svg>
            <span>Include key selling points like flexibility options, special facilities, or nearby conveniences.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingDetails;