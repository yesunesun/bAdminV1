// src/components/property/RentalDetails.tsx
// Version: 1.5.0
// Last Modified: 2025-02-09T16:30:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee } from 'lucide-react';
import { FormSectionProps } from '../types';
import { cn } from '@/lib/utils';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import {
  RENTAL_TYPES,
  MAINTENANCE_OPTIONS,
  TENANT_PREFERENCES,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
} from '../constants';

export function RentalDetails({ form }: FormSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    let value = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    
    if (value === '') {
      setValue(fieldName, '', {
        shouldValidate: true,
        shouldDirty: true
      });
      return;
    }

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setValue(fieldName, numValue.toString(), {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <FormSection
      title="Rental Detailsx"
      description="Specify your rental terms and conditions"
    >
      <div className="space-y-4">
        {/* Rental Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RENTAL_TYPES.map((type) => (
            <div
              key={type.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white",
                "transition-all hover:border-slate-300",
                "shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
              )}
            >
              <Checkbox
                id={type.id}
                checked={watch('rentalType') === type.id}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('rentalType', type.id, {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }
                }}
              />
              <label htmlFor={type.id} className="text-base font-medium text-slate-700 cursor-pointer">
                {type.label}
              </label>
            </div>
          ))}
          {errors.rentalType && (
            <p className="text-sm text-red-600 col-span-2">{errors.rentalType.message?.toString()}</p>
          )}
        </div>

        {/* Rent and Deposit - Two Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Monthly Rent</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-slate-500">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-11 pl-9 pr-20 text-base"
                {...register('rentAmount', {
                  required: 'Monthly rent is required',
                  pattern: {
                    value: /^[1-9][0-9]*$/,
                    message: 'Please enter a valid amount'
                  }
                })}
                placeholder="Enter amount"
                onChange={(e) => handleCurrencyInput(e, 'rentAmount')}
              />
              <span className="absolute right-3 inset-y-0 flex items-center text-sm text-slate-500">
                per month
              </span>
            </div>
            {errors.rentAmount && (
              <p className="text-sm text-red-600 mt-0.5">{errors.rentAmount.message?.toString()}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Security Deposit</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-slate-500">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-11 pl-9 text-base"
                {...register('securityDeposit', {
                  required: 'Security deposit is required',
                  pattern: {
                    value: /^[1-9][0-9]*$/,
                    message: 'Please enter a valid amount'
                  }
                })}
                placeholder="Enter deposit amount"
                onChange={(e) => handleCurrencyInput(e, 'securityDeposit')}
              />
            </div>
            {errors.securityDeposit && (
              <p className="text-sm text-red-600 mt-0.5">{errors.securityDeposit.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Rent Negotiable and Maintenance - Two Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rentNegotiable"
              checked={watch('rentNegotiable')}
              onCheckedChange={(checked) => setValue('rentNegotiable', checked as boolean)}
            />
            <label htmlFor="rentNegotiable" className="text-base text-slate-700 cursor-pointer">
              Rent Negotiable
            </label>
          </div>

          <div>
            <RequiredLabel required>Maintenance</RequiredLabel>
            <Select 
              value={watch('maintenance')} 
              onValueChange={value => setValue('maintenance', value, {
                shouldValidate: true,
                shouldDirty: true
              })}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Maintenance terms?" />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maintenance && (
              <p className="text-sm text-red-600 mt-0.5">{errors.maintenance.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Available From and Furnishing - Two Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Available From</RequiredLabel>
            <Input
              type="date"
              className="h-11 text-base"
              min={minDate}
              {...register('availableFrom', {
                required: 'Available date is required'
              })}
            />
            {errors.availableFrom && (
              <p className="text-sm text-red-600 mt-0.5">{errors.availableFrom.message?.toString()}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Furnishing</RequiredLabel>
            <Select 
              value={watch('furnishing')} 
              onValueChange={value => setValue('furnishing', value, {
                shouldValidate: true,
                shouldDirty: true
              })}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Furnishing status?" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.furnishing && (
              <p className="text-sm text-red-600 mt-0.5">{errors.furnishing.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Parking */}
        <div>
          <RequiredLabel required>Parking</RequiredLabel>
          <Select 
            value={watch('parking')} 
            onValueChange={value => setValue('parking', value, {
              shouldValidate: true,
              shouldDirty: true
            })}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Available parking?" />
            </SelectTrigger>
            <SelectContent>
              {PARKING_OPTIONS.map(option => (
                <SelectItem key={option} value={option} className="text-base">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parking && (
            <p className="text-sm text-red-600 mt-0.5">{errors.parking.message?.toString()}</p>
          )}
        </div>

        {/* Preferred Tenants */}
        <div>
          <RequiredLabel required>Preferred Tenants</RequiredLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TENANT_PREFERENCES.map((tenant) => (
              <div
                key={tenant}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white",
                  "transition-all hover:border-slate-300"
                )}
              >
                <Checkbox
                  id={`tenant-${tenant}`}
                  checked={watch('preferredTenants')?.includes(tenant)}
                  onCheckedChange={(checked) => {
                    const current = watch('preferredTenants') || [];
                    if (checked) {
                      setValue('preferredTenants', [...current, tenant], {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    } else {
                      setValue('preferredTenants', current.filter(t => t !== tenant), {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }
                  }}
                />
                <label
                  htmlFor={`tenant-${tenant}`}
                  className="text-base text-slate-700 cursor-pointer"
                >
                  {tenant}
                </label>
              </div>
            ))}
          </div>
          {errors.preferredTenants && (
            <p className="text-sm text-red-600 mt-0.5">{errors.preferredTenants.message?.toString()}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <RequiredLabel>Description</RequiredLabel>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base
              shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
              focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
              hover:border-slate-300"
            placeholder="Additional details about your property (optional)"
          />
        </div>
      </div>
    </FormSection>
  );
}