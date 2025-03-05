// src/modules/owner/components/property/wizard/sections/LocationDetails/components/FlatPlotInput.tsx
// Version: 1.1.0
// Last Modified: 06-03-2025 23:45 IST
// Purpose: Fixed flat/plot number input to ensure value is properly saved and loaded

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';
import { Home } from 'lucide-react';

interface FlatPlotInputProps {
  form: UseFormReturn<FormData>;
}

export function FlatPlotInput({ form }: FlatPlotInputProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  
  // Watch the value to debug
  const flatPlotValue = watch('flatPlotNo');
  
  // Debug log when the component renders or value changes
  useEffect(() => {
    console.log('FlatPlotInput rendered with value:', flatPlotValue);
  }, [flatPlotValue]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Setting flatPlotNo to:', newValue);
    setValue('flatPlotNo', newValue, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };
  
  return (
    <div className="mb-3">
      <RequiredLabel>Flat No/Plot No</RequiredLabel>
      <div className="relative">
        <Input
          {...register('flatPlotNo')}
          className="h-11 pl-10 text-base"
          placeholder="Enter flat number or plot number"
          value={flatPlotValue || ''}
          onChange={handleInputChange}
        />
        <Home className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
      </div>
      {errors.flatPlotNo && (
        <p className="text-sm text-red-600 mt-0.5">{errors.flatPlotNo.message}</p>
      )}
    </div>
  );
}