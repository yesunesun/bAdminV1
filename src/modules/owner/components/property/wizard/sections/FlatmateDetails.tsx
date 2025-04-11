// src/modules/owner/components/property/wizard/sections/FlatmateDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 23:35 IST
// Purpose: Flatmate details form section for the Residential Flatmates property flow

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
  FLATMATE_PREFERENCES, 
  GENDER_PREFERENCES, 
  ROOM_SHARING_OPTIONS,
  OCCUPANCY_STATUS,
  HOUSE_RULES,
  AGE_GROUP_PREFERENCES,
  BATHROOM_SHARING,
  ADDITIONAL_EXPENSES,
  CURRENT_OCCUPANT_COUNT,
  LEASE_DURATION_OPTIONS
} from '../constants/flatmateDetails';

const FlatmateDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for room sharing to conditionally display fields
  const roomSharing = watch('roomSharingOption');
  const isSharedRoom = roomSharing === 'Shared Room (2 People)' || roomSharing === 'Shared Room (3+ People)';
  
  return (
    <FormSection
      title="Flatmate Preferences"
      description="Provide details about flatmate preferences and accommodation details"
    >
      <div className="space-y-6">
        {/* Flatmate Preferences */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="flatmatePreference">
              Flatmate Preference
            </RequiredLabel>
            <Select
              id="flatmatePreference"
              placeholder="Select preferred flatmate type"
              error={errors.flatmatePreference?.message}
              {...register('flatmatePreference')}
            >
              <option value="">Select preferred flatmate type</option>
              {FLATMATE_PREFERENCES.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="genderPreference">
              Gender Preference
            </RequiredLabel>
            <Select
              id="genderPreference"
              placeholder="Select gender preference"
              error={errors.genderPreference?.message}
              {...register('genderPreference')}
            >
              <option value="">Select gender preference</option>
              {GENDER_PREFERENCES.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Age Group Preference */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="ageGroupPreference">
            Age Group Preference
          </RequiredLabel>
          <Select
            id="ageGroupPreference"
            placeholder="Select age group preference"
            error={errors.ageGroupPreference?.message}
            {...register('ageGroupPreference')}
          >
            <option value="">Select age group preference</option>
            {AGE_GROUP_PREFERENCES.map((preference) => (
              <option key={preference} value={preference}>
                {preference}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Room Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="roomSharingOption">
              Room Sharing
            </RequiredLabel>
            <Select
              id="roomSharingOption"
              placeholder="Select room sharing option"
              error={errors.roomSharingOption?.message}
              {...register('roomSharingOption')}
            >
              <option value="">Select room sharing option</option>
              {ROOM_SHARING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="bathroomSharing">
              Bathroom Sharing
            </RequiredLabel>
            <Select
              id="bathroomSharing"
              placeholder="Select bathroom sharing option"
              error={errors.bathroomSharing?.message}
              {...register('bathroomSharing')}
            >
              <option value="">Select bathroom sharing option</option>
              {BATHROOM_SHARING.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Rent Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="rentAmount">
              Rent Amount (₹)
            </RequiredLabel>
            <Input
              id="rentAmount"
              type="number"
              placeholder="e.g., 8000"
              error={errors.rentAmount?.message}
              {...register('rentAmount')}
            />
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="securityDeposit">
              Security Deposit (₹)
            </RequiredLabel>
            <Input
              id="securityDeposit"
              type="number"
              placeholder="e.g., 16000"
              error={errors.securityDeposit?.message}
              {...register('securityDeposit')}
            />
          </div>
        </div>
        
        {/* Additional Expenses */}
        <div>
          <p className="text-sm font-medium mb-3">Additional Expenses (to be shared)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ADDITIONAL_EXPENSES.map((expense) => (
              <div key={expense} className="flex items-center space-x-2">
                <Checkbox
                  id={`expense-${expense}`}
                  value={expense}
                  {...register('additionalExpenses')}
                />
                <label
                  htmlFor={`expense-${expense}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {expense}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Occupants */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="currentOccupantCount">
              Current Occupant Count
            </RequiredLabel>
            <Select
              id="currentOccupantCount"
              placeholder="Select current occupant count"
              error={errors.currentOccupantCount?.message}
              {...register('currentOccupantCount')}
            >
              <option value="">Select current occupant count</option>
              {CURRENT_OCCUPANT_COUNT.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="occupancyStatus">
              Occupancy Status
            </RequiredLabel>
            <Select
              id="occupancyStatus"
              placeholder="Select occupancy status"
              error={errors.occupancyStatus?.message}
              {...register('occupancyStatus')}
            >
              <option value="">Select occupancy status</option>
              {OCCUPANCY_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Available From */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="availableFrom">
            Available From
          </RequiredLabel>
          <Input
            id="availableFrom"
            type="date"
            placeholder="Select date"
            error={errors.availableFrom?.message}
            {...register('availableFrom')}
          />
        </div>
        
        {/* Lease Duration */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="leaseDuration">
            Lease Duration
          </RequiredLabel>
          <Select
            id="leaseDuration"
            placeholder="Select lease duration"
            error={errors.leaseDuration?.message}
            {...register('leaseDuration')}
          >
            <option value="">Select lease duration</option>
            {LEASE_DURATION_OPTIONS.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </Select>
        </div>
        
        {/* House Rules */}
        <div>
          <p className="text-sm font-medium mb-3">House Rules</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HOUSE_RULES.map((rule) => (
              <div key={rule} className="flex items-center space-x-2">
                <Checkbox
                  id={`rule-${rule}`}
                  value={rule}
                  {...register('houseRules')}
                />
                <label
                  htmlFor={`rule-${rule}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {rule}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Common Area Details */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="commonAreaDetails">
            Common Area Details
          </RequiredLabel>
          <Textarea
            id="commonAreaDetails"
            placeholder="Describe common areas like kitchen, living room, etc..."
            error={errors.commonAreaDetails?.message}
            {...register('commonAreaDetails')}
            rows={3}
          />
        </div>
        
        {/* About Current Occupants */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="aboutCurrentOccupants">
            About Current Occupants
          </RequiredLabel>
          <Textarea
            id="aboutCurrentOccupants"
            placeholder="Tell about current flatmates (age, profession, gender, lifestyle)..."
            error={errors.aboutCurrentOccupants?.message}
            {...register('aboutCurrentOccupants')}
            rows={3}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default FlatmateDetails;