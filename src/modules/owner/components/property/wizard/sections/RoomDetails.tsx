// src/modules/owner/components/property/wizard/sections/RoomDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 20:30 IST
// Purpose: Room details section for PG/Hostel properties

import React from 'react';
import { FormData, FormSectionProps } from '../types';
import { ROOM_TYPES, BATHROOM_TYPES } from '../constants';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const RoomDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  // Watch for dependency values
  const roomType = watch('roomType');
  
  return (
    <FormSection
      title="Room Details"
      description="Provide details about your PG/Hostel rooms"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="roomType">Room Type</RequiredLabel>
          <Select
            value={getValues('roomType') || ''}
            onValueChange={(value) => setValue('roomType', value, { shouldValidate: true })}
            disabled={isEditMode}
          >
            <SelectTrigger 
              id="roomType"
              className={cn(
                "w-full",
                errors.roomType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Room Type" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roomType && (
            <p className="text-sm text-destructive mt-1">{errors.roomType.message as string}</p>
          )}
        </div>

        {/* Room Capacity */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="roomCapacity">Total Capacity (per room)</RequiredLabel>
          <Input
            id="roomCapacity"
            type="number"
            min={1}
            {...register('roomCapacity')}
            placeholder="How many people per room?"
            className={cn(
              errors.roomCapacity && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.roomCapacity && (
            <p className="text-sm text-destructive mt-1">{errors.roomCapacity.message as string}</p>
          )}
        </div>

        {/* Available Rooms */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="availableRooms">Available Rooms</RequiredLabel>
          <Input
            id="availableRooms"
            type="number"
            min={1}
            {...register('availableRooms')}
            placeholder="Number of rooms available"
            className={cn(
              errors.availableRooms && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.availableRooms && (
            <p className="text-sm text-destructive mt-1">{errors.availableRooms.message as string}</p>
          )}
        </div>

        {/* Total Rooms */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="totalRooms">Total Rooms</RequiredLabel>
          <Input
            id="totalRooms"
            type="number"
            min={1}
            {...register('totalRooms')}
            placeholder="Total number of rooms"
            className={cn(
              errors.totalRooms && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.totalRooms && (
            <p className="text-sm text-destructive mt-1">{errors.totalRooms.message as string}</p>
          )}
        </div>

        {/* Bathroom Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="bathroomType">Bathroom Type</RequiredLabel>
          <Select
            value={getValues('bathroomType') || ''}
            onValueChange={(value) => setValue('bathroomType', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="bathroomType"
              className={cn(
                "w-full",
                errors.bathroomType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Bathroom Type" />
            </SelectTrigger>
            <SelectContent>
              {BATHROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bathroomType && (
            <p className="text-sm text-destructive mt-1">{errors.bathroomType.message as string}</p>
          )}
        </div>

        {/* Room Size */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="roomSize">Room Size (sqft)</RequiredLabel>
          <Input
            id="roomSize"
            type="number"
            min={1}
            {...register('roomSize')}
            placeholder="Size of room in square feet"
            className={cn(
              errors.roomSize && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.roomSize && (
            <p className="text-sm text-destructive mt-1">{errors.roomSize.message as string}</p>
          )}
        </div>

      </div>

      {/* Room Features */}
      <div className="mt-8">
        <h3 className="text-base font-medium mb-3">Room Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasAC"
              checked={getValues('hasAC') || false}
              onCheckedChange={(checked) => setValue('hasAC', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasAC"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Air Conditioner
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasFan"
              checked={getValues('hasFan') || false}
              onCheckedChange={(checked) => setValue('hasFan', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasFan"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Fan
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasFurniture"
              checked={getValues('hasFurniture') || false}
              onCheckedChange={(checked) => setValue('hasFurniture', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasFurniture"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Furniture (Bed, Table, Chair)
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasTV"
              checked={getValues('hasTV') || false}
              onCheckedChange={(checked) => setValue('hasTV', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasTV"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              TV
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasWifi"
              checked={getValues('hasWifi') || false}
              onCheckedChange={(checked) => setValue('hasWifi', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasWifi"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Wi-Fi
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasGeyser"
              checked={getValues('hasGeyser') || false}
              onCheckedChange={(checked) => setValue('hasGeyser', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="hasGeyser"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Geyser
            </label>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default RoomDetails;