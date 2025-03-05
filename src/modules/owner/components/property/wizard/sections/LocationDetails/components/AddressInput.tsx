// src/modules/owner/components/property/wizard/sections/LocationDetails/components/AddressInput.tsx
// Version: 2.1.0
// Last Modified: 06-03-2025 18:45 IST
// Purpose: Updated address input component with simplified label

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';

interface AddressInputProps {
  form: UseFormReturn<FormData>;
}

export function AddressInput({ form }: AddressInputProps) {
  const { register, formState: { errors } } = form;
  
  return (
    <div>
      <RequiredLabel required>Address</RequiredLabel>
      <div className="relative">
        <textarea
          {...register('address')}
          rows={2}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 py-3 text-base
            shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
            focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
            hover:border-slate-300"
          placeholder="Building name, street, area"
        />
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
      </div>
      {errors.address && (
        <p className="text-sm text-red-600 mt-0.5">{errors.address.message}</p>
      )}
    </div>
  );
}