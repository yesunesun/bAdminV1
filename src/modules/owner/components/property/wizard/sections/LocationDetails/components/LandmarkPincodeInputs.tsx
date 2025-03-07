// src/modules/owner/components/property/wizard/sections/LocationDetails/components/LandmarkPincodeInputs.tsx
// Version: 1.1.0
// Last Modified: 07-03-2025 14:30 IST
// Purpose: Fix uncontrolled to controlled input warning for PIN code field

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';

interface LandmarkPincodeInputsProps {
  form: UseFormReturn<FormData>;
  handlePinCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LandmarkPincodeInputs({ form, handlePinCodeChange }: LandmarkPincodeInputsProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const pinCode = watch('pinCode');
  
  // Ensure pinCode is always a string, never undefined
  useEffect(() => {
    if (pinCode === undefined) {
      setValue('pinCode', '');
    }
  }, [pinCode, setValue]);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <RequiredLabel>Landmark</RequiredLabel>
        <Input
          className="h-11 text-base"
          {...register('landmark')}
          placeholder="Nearby landmark"
        />
        {errors.landmark && (
          <p className="text-sm text-red-600 mt-0.5">{errors.landmark.message}</p>
        )}
      </div>

      <div>
        <RequiredLabel required>PIN Code</RequiredLabel>
        <Input
          value={pinCode || ''}
          onChange={handlePinCodeChange}
          className="h-11 text-base"
          maxLength={6}
          placeholder="6-digit PIN code"
        />
        {errors.pinCode && (
          <p className="text-sm text-red-600 mt-0.5">{errors.pinCode.message}</p>
        )}
      </div>
    </div>
  );
}