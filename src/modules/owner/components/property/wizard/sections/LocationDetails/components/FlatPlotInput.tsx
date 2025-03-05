
// src/modules/owner/components/property/wizard/sections/LocationDetails/components/FlatPlotInput.tsx
// Version: 1.0.0
// Last Modified: 06-03-2025 18:45 IST
// Purpose: Flat/Plot number input field component

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';
import { Home } from 'lucide-react';

interface FlatPlotInputProps {
  form: UseFormReturn<FormData>;
}

export function FlatPlotInput({ form }: FlatPlotInputProps) {
  const { register, formState: { errors } } = form;
  
  return (
    <div className="mb-3">
      <RequiredLabel>Flat No/Plot No</RequiredLabel>
      <div className="relative">
        <Input
          {...register('flatPlotNo')}
          className="h-11 pl-10 text-base"
          placeholder="Enter flat number or plot number"
        />
        <Home className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
      </div>
      {errors.flatPlotNo && (
        <p className="text-sm text-red-600 mt-0.5">{errors.flatPlotNo.message}</p>
      )}
    </div>
  );
}