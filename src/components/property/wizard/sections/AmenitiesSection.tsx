// src/components/property/AmenitiesSection.tsx
// Version: 1.1.0
// Last Modified: 2025-01-30T17:30:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSectionProps } from '../types';
import { cn } from '@/lib/utils';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Minus, Plus, Phone } from 'lucide-react';
import { 
  AMENITIES_LIST, 
  PROPERTY_SHOW_OPTIONS, 
  PROPERTY_CONDITION_OPTIONS 
} from '../constants';

export function AmenitiesSection({ form }: FormSectionProps) {
  const { watch, setValue, register, formState: { errors } } = form;

  const handleNumberChange = (type: 'bathrooms' | 'balconies', action: 'increment' | 'decrement') => {
    const current = parseInt(watch(type) || '0');
    if (action === 'increment') {
      setValue(type, (current + 1).toString());
    } else if (current > 0) {
      setValue(type, (current - 1).toString());
    }
  };

  return (
    <FormSection
      title="Amenities & Features"
      description="What does your property offer?"
    >
      <div className="space-y-4">
        {/* Bathrooms and Balconies Counter - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bathrooms Counter */}
          <div>
            <RequiredLabel required>Bathrooms</RequiredLabel>
            <div className="flex items-center h-11">
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'decrement')}
                className="h-full aspect-square flex items-center justify-center rounded-l-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={parseInt(watch('bathrooms') || '0') <= 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="h-full text-center rounded-none border-x-0 text-base"
                value={watch('bathrooms') || '0'}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'increment')}
                className="h-full aspect-square flex items-center justify-center rounded-r-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Balconies Counter */}
          <div>
            <RequiredLabel>Balconies</RequiredLabel>
            <div className="flex items-center h-11">
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'decrement')}
                className="h-full aspect-square flex items-center justify-center rounded-l-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                disabled={parseInt(watch('balconies') || '0') <= 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="h-full text-center rounded-none border-x-0 text-base"
                value={watch('balconies') || '0'}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'increment')}
                className="h-full aspect-square flex items-center justify-center rounded-r-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Amenities - Three Column */}
        <div className="grid grid-cols-3 gap-3">
          {['hasGym', 'nonVegAllowed', 'gatedSecurity'].map((amenity) => (
            <div
              key={amenity}
              className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <Checkbox
                id={amenity}
                checked={watch(amenity)}
                onCheckedChange={(checked) => setValue(amenity, checked)}
              />
              <label
                htmlFor={amenity}
                className="text-base text-slate-700 cursor-pointer"
              >
                {amenity === 'hasGym' ? 'Gym'
                  : amenity === 'nonVegAllowed' ? 'Non-Veg Allowed'
                  : 'Gated Security'}
              </label>
            </div>
          ))}
        </div>

        {/* Property Show and Condition - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Who Shows Property?</RequiredLabel>
            <Select 
              value={watch('propertyShowOption')} 
              onValueChange={value => setValue('propertyShowOption', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Select who shows" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_SHOW_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyShowOption && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyShowOption.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Property Condition</RequiredLabel>
            <Select 
              value={watch('propertyCondition')} 
              onValueChange={value => setValue('propertyCondition', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_CONDITION_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyCondition && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyCondition.message}</p>
            )}
          </div>
        </div>

        {/* Contact and Direction - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Alternate Contact</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-slate-400">
                <Phone className="h-4 w-4" />
              </span>
              <span className="absolute left-9 inset-y-0 flex items-center text-slate-400">
                +91
              </span>
              <Input
                type="tel"
                className="h-11 pl-16 text-base"
                maxLength={10}
                {...register('secondaryNumber')}
                placeholder="Additional contact number"
              />
            </div>
          </div>

          <div>
            <RequiredLabel>Directions</RequiredLabel>
            <Input
              className="h-11 text-base"
              {...register('direction')}
              placeholder="How to reach the property?"
            />
          </div>
        </div>

        {/* Similar Units Checkbox */}
        <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
          <Checkbox
            id="hasSimilarUnits"
            checked={watch('hasSimilarUnits')}
            onCheckedChange={(checked) => setValue('hasSimilarUnits', checked)}
          />
          <label
            htmlFor="hasSimilarUnits"
            className="text-base text-slate-700 cursor-pointer"
          >
            Have similar units available?
          </label>
        </div>

        {/* Other Amenities Grid */}
        <div>
          <RequiredLabel required>Other Amenities</RequiredLabel>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {AMENITIES_LIST.map((amenity) => (
              <div
                key={amenity}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white",
                  "transition-colors hover:border-slate-300",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                )}
              >
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={watch('amenities')?.includes(amenity)}
                  onCheckedChange={(checked) => {
                    const current = watch('amenities') || [];
                    if (checked) {
                      setValue('amenities', [...current, amenity]);
                    } else {
                      setValue('amenities', current.filter(a => a !== amenity));
                    }
                  }}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-base text-slate-700 cursor-pointer"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
          {errors.amenities && (
            <p className="text-sm text-red-600 mt-0.5">{errors.amenities.message}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}