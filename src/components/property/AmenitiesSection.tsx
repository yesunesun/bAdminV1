import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSectionProps } from './types';
import { cn } from '@/lib/utils';
import { AMENITIES_LIST, PROPERTY_SHOW_OPTIONS, PROPERTY_CONDITION_OPTIONS } from './constants';

export function AmenitiesSection({ form }: FormSectionProps) {
  const { watch, setValue, register, formState: { errors } } = form;

  // Initialize bathrooms and balconies to 0 if not set
  React.useEffect(() => {
    if (!watch('bathrooms')) setValue('bathrooms', '0');
    if (!watch('balconies')) setValue('balconies', '0');
  }, [watch, setValue]);

  return (
    <FormSection
      title="Amenities & Additional Details"
      description="Specify amenities and other important details about your property."
    >
      <div className="space-y-8">
        {/* Bathroom and Balcony Counters */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bathrooms">Number of Bathrooms</Label>
            <div className="flex items-center space-x-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(watch('bathrooms') || '0');
                  if (current > 0) setValue('bathrooms', (current - 1).toString());
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                -
              </button>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                className="text-center"
                {...register('bathrooms')}
              />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(watch('bathrooms') || '0');
                  setValue('bathrooms', (current + 1).toString());
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="balconies">Number of Balconies</Label>
            <div className="flex items-center space-x-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(watch('balconies') || '0');
                  if (current > 0) setValue('balconies', (current - 1).toString());
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                -
              </button>
              <Input
                id="balconies"
                type="number"
                min="0"
                className="text-center"
                {...register('balconies')}
              />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(watch('balconies') || '0');
                  setValue('balconies', (current + 1).toString());
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Yes/No Options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white">
            <Checkbox
              id="hasGym"
              checked={watch('hasGym')}
              onCheckedChange={(checked) => setValue('hasGym', checked)}
            />
            <label
              htmlFor="hasGym"
              className="text-base font-medium text-slate-700 cursor-pointer"
            >
              Gym
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white">
            <Checkbox
              id="nonVegAllowed"
              checked={watch('nonVegAllowed')}
              onCheckedChange={(checked) => setValue('nonVegAllowed', checked)}
            />
            <label
              htmlFor="nonVegAllowed"
              className="text-base font-medium text-slate-700 cursor-pointer"
            >
              Non-Veg Allowed
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white">
            <Checkbox
              id="gatedSecurity"
              checked={watch('gatedSecurity')}
              onCheckedChange={(checked) => setValue('gatedSecurity', checked)}
            />
            <label
              htmlFor="gatedSecurity"
              className="text-base font-medium text-slate-700 cursor-pointer"
            >
              Gated Security
            </label>
          </div>
        </div>

        {/* Property Show and Condition Options - Side by Side */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="propertyShowOption">Who will show the property?</Label>
            <Select 
              value={watch('propertyShowOption')} 
              onValueChange={value => setValue('propertyShowOption', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who will show the property" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_SHOW_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="propertyCondition">Current Property Condition</Label>
            <Select 
              value={watch('propertyCondition')} 
              onValueChange={value => setValue('propertyCondition', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select current property condition" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_CONDITION_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Secondary Number */}
        <div>
          <Label htmlFor="secondaryNumber">Secondary Contact Number</Label>
          <div className="relative">
            <span className="absolute left-0 inset-y-0 flex items-center pl-4 text-gray-500 pointer-events-none">
              +91
            </span>
            <Input
              id="secondaryNumber"
              type="tel"
              className="pl-12"
              maxLength={10}
              pattern="[0-9]{10}"
              {...register('secondaryNumber')}
              placeholder="Enter 10-digit mobile number"
            />
          </div>
          {errors.secondaryNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.secondaryNumber.message}</p>
          )}
        </div>

        {/* Similar Units */}
        <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white">
          <Checkbox
            id="hasSimilarUnits"
            checked={watch('hasSimilarUnits')}
            onCheckedChange={(checked) => setValue('hasSimilarUnits', checked)}
          />
          <label
            htmlFor="hasSimilarUnits"
            className="text-base font-medium text-slate-700 cursor-pointer"
          >
            Do you have more similar units/properties available?
          </label>
        </div>

        {/* Direction */}
        <div>
          <Label htmlFor="direction">Direction</Label>
          <Input
            id="direction"
            {...register('direction')}
            placeholder="e.g., Take the second left after the main signal, building is on the right"
          />
        </div>

        {/* Other Amenities */}
        <div>
          <Label className="mb-4">Other Amenities</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AMENITIES_LIST.map((amenity) => (
              <div
                key={amenity}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white",
                  "transition-all hover:border-slate-300",
                  "shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                )}
              >
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={watch('amenities')?.includes(amenity)}
                  onCheckedChange={(checked) => {
                    const currentAmenities = watch('amenities') || [];
                    if (checked) {
                      setValue('amenities', [...currentAmenities, amenity]);
                    } else {
                      setValue('amenities', currentAmenities.filter(a => a !== amenity));
                    }
                  }}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-base font-medium text-slate-700 cursor-pointer"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
}