// src/modules/owner/components/property/wizard/sections/LocationDetails/components/LandmarkPincodeInputs.tsx
// Version: 1.0.0
// Last Modified: 28-02-2025 19:25 IST
// Purpose: Landmark and pincode input component

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';

interface LandmarkPincodeInputsProps {
  form: UseFormReturn<FormData>;
  handlePinCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LandmarkPincodeInputs({ form, handlePinCodeChange }: LandmarkPincodeInputsProps) {
  const { register, formState: { errors }, watch } = form;
  const pinCode = watch('pinCode');
  
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
          value={pinCode}
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