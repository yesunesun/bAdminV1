import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from './types';
import { PROPERTY_TYPES, BHK_TYPES, PROPERTY_AGE, FACING_OPTIONS } from './constants';

interface PropertyDetailsProps extends FormSectionProps {
  mode?: 'create' | 'edit';
}

export function PropertyDetails({ form, mode = 'create' }: PropertyDetailsProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const propertyType = watch('propertyType');
  const bhkType = watch('bhkType');
  const propertyAge = watch('propertyAge');
  const facing = watch('facing');

  return (
    <FormSection
      title="Property Details"
      description="Tell us about your property's basic features."
    >
      <div className="space-y-6">
        {mode === 'edit' && (
          <div>
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter a descriptive title for your property"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={propertyType} onValueChange={value => setValue('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType && (
              <p className="text-sm text-red-600 mt-1">{errors.propertyType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bhkType">BHK Type</Label>
            <Select value={bhkType} onValueChange={value => setValue('bhkType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select BHK type" />
              </SelectTrigger>
              <SelectContent>
                {BHK_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bhkType && (
              <p className="text-sm text-red-600 mt-1">{errors.bhkType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              type="number"
              min="1"
              max="99"
              {...register('floor')}
              placeholder="Floor number"
            />
            {errors.floor && (
              <p className="text-sm text-red-600 mt-1">{errors.floor.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalFloors">Total Floors</Label>
            <Input
              id="totalFloors"
              type="number"
              min="1"
              max="99"
              {...register('totalFloors')}
              placeholder="Total floors"
            />
            {errors.totalFloors && (
              <p className="text-sm text-red-600 mt-1">{errors.totalFloors.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="propertyAge">Property Age</Label>
            <Select value={propertyAge} onValueChange={value => setValue('propertyAge', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property age" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_AGE.map(age => (
                  <SelectItem key={age} value={age}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyAge && (
              <p className="text-sm text-red-600 mt-1">{errors.propertyAge.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="facing">Facing</Label>
            <Select value={facing} onValueChange={value => setValue('facing', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select facing direction" />
              </SelectTrigger>
              <SelectContent>
                {FACING_OPTIONS.map(facing => (
                  <SelectItem key={facing} value={facing}>{facing}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="builtUpArea">Built Up Area (sq ft)</Label>
            <Input
              id="builtUpArea"
              type="number"
              min="0"
              {...register('builtUpArea')}
              placeholder="Built up area in sq ft"
            />
            {errors.builtUpArea && (
              <p className="text-sm text-red-600 mt-1">{errors.builtUpArea.message}</p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
}