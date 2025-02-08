// src/components/property/wizard/sections/AmenitiesSection.tsx
// Version: 1.5.0
// Last Modified: 2025-02-09T16:30:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import {
  Minus,
  Plus,
  Phone,
  Building2,
  Shield,
  HeartPulse,
  Utensils,
  Zap,
  ArrowUpDown,
  Trees,
  Lock,
  Droplet,
  Gamepad,
  ParkingSquare,
  Container,
  CloudRain,
  Wifi,
  Wind,
  Speaker,
  PlaySquare,
  UserCircle,
  Flame,
  HomeIcon,
  Store
} from 'lucide-react';

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
      setValue(type, (current + 1).toString(), {
        shouldValidate: true,
        shouldDirty: true
      });
    } else if (current > 0) {
      setValue(type, (current - 1).toString(), {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };

  const quickAmenities = [
    { id: 'hasGym', label: 'Gym', icon: HeartPulse },
    { id: 'nonVegAllowed', label: 'Non-Veg Allowed', icon: Utensils },
    { id: 'gatedSecurity', label: 'Gated Security', icon: Shield }
  ];

  // Using unique icons for each amenity
  const otherAmenitiesIcons: Record<string, React.ComponentType> = {
    'Power Backup': Zap,
    'Lift': ArrowUpDown,
    'Security': Lock,
    'Park': Trees,
    'Swimming Pool': Droplet,
    'Club House': Building2,
    'Children Play Area': PlaySquare,
    'Garden': Trees,
    'Indoor Games': Gamepad,
    'Visitor Parking': ParkingSquare,
    'Water Storage': Container,
    'Rain Water Harvesting': CloudRain,
    'Internet Services': Wifi,
    'Air Conditioner': Wind,
    'Intercom': Speaker,
    'Servant Room': UserCircle,
    'Gas Pipeline': Flame,
    'Fire Safety': Shield,
    'Shopping Center': Store,
    'House Keeping': HomeIcon
  };

  return (
    <FormSection
      title="Amenities & Featuresx"
      description="What does your property offer?"
    >
      <div className="space-y-6">
        {/* Bathrooms and Balconies Counter */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bathrooms Counter */}
          <div>
            <RequiredLabel required>Bathrooms</RequiredLabel>
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'decrement')}
                disabled={parseInt(watch('bathrooms') || '0') <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="flex-1 text-center border-x rounded-none h-full"
                {...register('bathrooms', {
                  required: 'Number of bathrooms is required',
                  min: { value: 1, message: 'At least 1 bathroom is required' }
                })}
                value={watch('bathrooms') || '0'}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {errors.bathrooms && (
              <p className="text-sm text-red-600 mt-0.5">{errors.bathrooms.message?.toString()}</p>
            )}
          </div>

          {/* Balconies Counter */}
          <div>
            <RequiredLabel>Balconies</RequiredLabel>
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'decrement')}
                disabled={parseInt(watch('balconies') || '0') <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="flex-1 text-center border-x rounded-none h-full"
                value={watch('balconies') || '0'}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Amenities */}
        <div className="grid grid-cols-3 gap-4">
          {quickAmenities.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white"
            >
              <Checkbox
                id={id}
                checked={watch(id)}
                onCheckedChange={(checked) => setValue(id, checked as boolean)}
              />
              <label
                htmlFor={id}
                className="flex items-center gap-2 text-gray-700"
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>

        {/* Property Show and Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Who Shows Property?</RequiredLabel>
            <Select 
              value={watch('propertyShowOption')} 
              onValueChange={value => setValue('propertyShowOption', value, {
                shouldValidate: true,
                shouldDirty: true
              })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select who shows" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_SHOW_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyShowOption && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyShowOption.message?.toString()}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Property Condition</RequiredLabel>
            <Select 
              value={watch('propertyCondition')} 
              onValueChange={value => setValue('propertyCondition', value, {
                shouldValidate: true,
                shouldDirty: true
              })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_CONDITION_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyCondition && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyCondition.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Contact and Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Alternate Contact</RequiredLabel>
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                <Phone className="h-4 w-4" />
              </span>
              <span className="absolute left-9 inset-y-0 flex items-center text-gray-400">
                +91
              </span>
              <Input
                type="tel"
                className="h-12 pl-16"
                maxLength={10}
                {...register('secondaryNumber', {
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                placeholder="Additional contact number"
              />
            </div>
            {errors.secondaryNumber && (
              <p className="text-sm text-red-600 mt-0.5">{errors.secondaryNumber.message?.toString()}</p>
            )}
          </div>

          <div>
            <RequiredLabel>Directions</RequiredLabel>
            <Input
              className="h-12"
              {...register('direction')}
              placeholder="How to reach the property?"
            />
          </div>
        </div>

        {/* Similar Units */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white">
          <Checkbox
            id="hasSimilarUnits"
            checked={watch('hasSimilarUnits')}
            onCheckedChange={(checked) => setValue('hasSimilarUnits', checked as boolean)}
          />
          <label
            htmlFor="hasSimilarUnits"
            className="text-gray-700"
          >
            Have similar units available?
          </label>
        </div>

        {/* Other Amenities */}
        <div>
          <RequiredLabel required>Other Amenities</RequiredLabel>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {AMENITIES_LIST.map((amenity) => {
              const Icon = otherAmenitiesIcons[amenity];
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={watch('amenities')?.includes(amenity)}
                    onCheckedChange={(checked) => {
                      const current = watch('amenities') || [];
                      if (checked) {
                        setValue('amenities', [...current, amenity], {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      } else {
                        setValue('amenities', current.filter(a => a !== amenity), {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                    <span>{amenity}</span>
                  </label>
                </div>
              );
            })}
          </div>
          {errors.amenities && (
            <p className="text-sm text-red-600 mt-0.5">{errors.amenities.message?.toString()}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}