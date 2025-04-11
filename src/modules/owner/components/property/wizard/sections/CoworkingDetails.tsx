// src/modules/owner/components/property/wizard/sections/CoworkingDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 23:20 IST
// Purpose: Co-working space details form section for the Commercial Co-working property flow

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  
  return (
    <FormSection
      title="Co-working Space Details"
      description="Provide details about your co-working space"
    >
      <div className="space-y-6">
        {/* Space Type */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="coworkingSpaceType">
            Co-working Space Type
          </RequiredLabel>
          <Select
            id="coworkingSpaceType"
            placeholder="Select space type"
            error={errors.coworkingSpaceType?.message}
            {...register('coworkingSpaceType')}
          >
            <option value="">Select space type</option>
            {COWORKING_SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Capacity */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="totalCapacity">
              Total Capacity
            </RequiredLabel>
            <Input
              id="totalCapacity"
              type="number"
              placeholder="e.g., 50"
              error={errors.totalCapacity?.message}
              {...register('totalCapacity')}
            />
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="availableCapacity">
              Available Capacity
            </RequiredLabel>
            <Input
              id="availableCapacity"
              type="number"
              placeholder="e.g., 25"
              error={errors.availableCapacity?.message}
              {...register('availableCapacity')}
            />
          </div>
        </div>
        
        {/* Pricing Structure */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="pricingStructure">
              Pricing Structure
            </RequiredLabel>
            <Select
              id="pricingStructure"
              placeholder="Select pricing structure"
              error={errors.pricingStructure?.message}
              {...register('pricingStructure')}
            >
              <option value="">Select pricing structure</option>
              {PRICING_STRUCTURES.map((structure) => (
                <option key={structure} value={structure}>
                  {structure}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="basePrice">
              Base Price (₹)
            </RequiredLabel>
            <Input
              id="basePrice"
              type="number"
              placeholder="e.g., 5000"
              error={errors.basePrice?.message}
              {...register('basePrice')}
            />
          </div>
        </div>
        
        {/* Desk Type Options - Conditional based on space type */}
        {showDeskOptions && (
          <div className="grid gap-3">
            <RequiredLabel htmlFor="deskType">
              Desk Type
            </RequiredLabel>
            <Select
              id="deskType"
              placeholder="Select desk type"
              error={errors.deskType?.message}
              {...register('deskType')}
            >
              <option value="">Select desk type</option>
              {DESK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        )}
        
        {/* Private Office Options - Conditional based on space type */}
        {showOfficeOptions && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="officeSize">
                Office Size (sq.ft)
              </RequiredLabel>
              <Input
                id="officeSize"
                type="number"
                placeholder="e.g., 200"
                error={errors.officeSize?.message}
                {...register('officeSize')}
              />
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="seatingCapacity">
                Seating Capacity
              </RequiredLabel>
              <Input
                id="seatingCapacity"
                type="number"
                placeholder="e.g., 6"
                error={errors.seatingCapacity?.message}
                {...register('seatingCapacity')}
              />
            </div>
          </div>
        )}
        
        {/* Lease Terms */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="leaseTerm">
              Lease Term
            </RequiredLabel>
            <Select
              id="leaseTerm"
              placeholder="Select lease term"
              error={errors.leaseTerm?.message}
              {...register('leaseTerm')}
            >
              <option value="">Select lease term</option>
              {COWORKING_LEASE_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="securityDeposit">
              Security Deposit (₹)
            </RequiredLabel>
            <Input
              id="securityDeposit"
              type="number"
              placeholder="e.g., 10000"
              error={errors.securityDeposit?.message}
              {...register('securityDeposit')}
            />
          </div>
        </div>
        
        {/* Booking Options */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="bookingOption">
            Booking Option
          </RequiredLabel>
          <Select
            id="bookingOption"
            placeholder="Select booking option"
            error={errors.bookingOption?.message}
            {...register('bookingOption')}
          >
            <option value="">Select booking option</option>
            {BOOKING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Operating Hours and Access */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="operatingHours">
              Operating Hours
            </RequiredLabel>
            <Input
              id="operatingHours"
              type="text"
              placeholder="e.g., 9 AM - 7 PM"
              error={errors.operatingHours?.message}
              {...register('operatingHours')}
            />
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="accessPolicy">
              Access Policy
            </RequiredLabel>
            <Select
              id="accessPolicy"
              placeholder="Select access policy"
              error={errors.accessPolicy?.message}
              {...register('accessPolicy')}
            >
              <option value="">Select access policy</option>
              {ACCESS_POLICY_OPTIONS.map((policy) => (
                <option key={policy} value={policy}>
                  {policy}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Internet Speed */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="internetSpeed">
            Internet Speed
          </RequiredLabel>
          <Select
            id="internetSpeed"
            placeholder="Select internet speed"
            error={errors.internetSpeed?.message}
            {...register('internetSpeed')}
          >
            <option value="">Select internet speed</option>
            {INTERNET_SPEED_OPTIONS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Co-working Amenities */}
        <div className="grid gap-3">
          <RequiredLabel>Available Amenities</RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COWORKING_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  value={amenity}
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
        <div className="grid gap-3">
          <RequiredLabel htmlFor="additionalInformation">
            Additional Information
          </RequiredLabel>
          <Textarea
            id="additionalInformation"
            placeholder="Add any additional details about your co-working space..."
            error={errors.additionalInformation?.message}
            {...register('additionalInformation')}
            rows={4}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingDetails;