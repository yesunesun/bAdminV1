// src/modules/owner/components/property/wizard/sections/AmenitiesSection.tsx
// Version: 1.5.0
// Last Modified: 2025-05-09T14:15:00+05:30 (IST)
// Purpose: Updated to support structured steps hierarchy

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
  Home,
  Car,
  Droplet,
  Lock,
  Users,
  HeartPulse,
  Utensils,
  Zap,
  ArrowUpDown,
  Trees,
  Building,
  Gamepad,
  ParkingSquare,
  Container,
  CloudRain,
  CheckCircle,
  Navigation,
  Wifi,
  Wind,
  Speaker,
  PlaySquare,
  UserCircle,
  Flame,
  Trash2,
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

  // Updated to use steps structure
  const handleNumberChange = (type: 'bathrooms' | 'balconies', action: 'increment' | 'decrement') => {
    // For backward compatibility, keep the original field paths working
    // while also updating the new structured paths
    const fieldPath = `steps.basic_details.${type}`;
    const current = parseInt(watch(type) || watch(fieldPath) || '0');
    const newValue = (action === 'increment') ? (current + 1) : (current > 0 ? current - 1 : 0);
    
    // Update both paths
    setValue(type, newValue.toString());
    setValue(fieldPath, newValue);
  };

  // Removed "Non-Veg Allowed" from quick amenities
  const quickAmenities = [
    { id: 'hasGym', label: 'Gym', icon: HeartPulse },           // Heart pulse for gym/fitness
    { id: 'gatedSecurity', label: 'Gated Security', icon: Shield }      // Shield for security
  ];

  // Using unique icons for each amenity
  const otherAmenitiesIcons: Record<string, React.ComponentType> = {
    'Power Backup': Zap,                    // Electric symbol for power backup
    'Lift': ArrowUpDown,                    // Up/down arrows for lift
    'Security': Lock,                       // Lock for security
    'Park': Trees,                          // Trees for park
    'Swimming Pool': Droplet,               // Water drop for pool
    'Club House': Building2,                // Modern building for club house
    'Children Play Area': PlaySquare,       // Play symbol for play area
    'Garden': Trees,                        // Trees for garden
    'Indoor Games': Gamepad,                // Gamepad for indoor games
    'Visitor Parking': ParkingSquare,       // Parking sign for visitor parking
    'Water Storage': Container,             // Container for water storage
    'Rain Water Harvesting': CloudRain,     // Rain cloud for rain water harvesting
    'Internet Services': Wifi,              // WiFi symbol for internet
    'Air Conditioner': Wind,                // Wind symbol for AC
    'Intercom': Speaker,                    // Speaker for intercom
    'Servant Room': UserCircle,             // User icon for servant room
    'Gas Pipeline': Flame,                  // Flame icon for gas
    'Fire Safety': Shield,                  // Shield for fire safety
    'Shopping Center': Store,               // Store for shopping center
    'Sewage Treatment Plant': Trash2,       // Waste management icon
    'House Keeping': HomeIcon               // Home icon for house keeping
  };

  // Helper to get value from both old and new structure
  const getFieldValue = (oldPath: string, newPath: string) => {
    return watch(oldPath) || watch(newPath);
  };

  // Helper to set value in both old and new structure
  const setFieldValue = (oldPath: string, newPath: string, value: any) => {
    setValue(oldPath, value);
    setValue(newPath, value);
  };

  return (
    <FormSection
      title="Amenities & Features"
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
                disabled={parseInt(getFieldValue('bathrooms', 'steps.basic_details.bathrooms') || '0') <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="flex-1 text-center border-x rounded-none h-full"
                value={getFieldValue('bathrooms', 'steps.basic_details.bathrooms') || '0'}
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
          </div>

          {/* Balconies Counter */}
          <div>
            <RequiredLabel>Balconies</RequiredLabel>
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'decrement')}
                disabled={parseInt(getFieldValue('balconies', 'steps.basic_details.balconies') || '0') <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="text"
                className="flex-1 text-center border-x rounded-none h-full"
                value={getFieldValue('balconies', 'steps.basic_details.balconies') || '0'}
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
        <div className="grid grid-cols-2 gap-4">
          {quickAmenities.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white"
            >
              <Checkbox
                id={id}
                checked={getFieldValue(id, `steps.features.${id}`)}
                onCheckedChange={(checked) => {
                  setFieldValue(id, `steps.features.${id}`, checked);
                }}
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
              value={getFieldValue('propertyShowOption', 'steps.features.propertyShowOption')} 
              onValueChange={value => setFieldValue('propertyShowOption', 'steps.features.propertyShowOption', value)}
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
            {(errors.propertyShowOption || errors.steps?.features?.propertyShowOption) && (
              <p className="text-sm text-red-500 mt-1">
                {errors.propertyShowOption?.message || errors.steps?.features?.propertyShowOption?.message}
              </p>
            )}
          </div>

          <div>
            <RequiredLabel required>Property Condition</RequiredLabel>
            <Select 
              value={getFieldValue('propertyCondition', 'steps.basic_details.propertyCondition')} 
              onValueChange={value => setFieldValue('propertyCondition', 'steps.basic_details.propertyCondition', value)}
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
            {(errors.propertyCondition || errors.steps?.basic_details?.propertyCondition) && (
              <p className="text-sm text-red-500 mt-1">
                {errors.propertyCondition?.message || errors.steps?.basic_details?.propertyCondition?.message}
              </p>
            )}
          </div>
        </div>

        {/* Alternate Contact - Now full width since Directions is removed */}
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
              {...register('secondaryNumber')}
              onChange={(e) => {
                // Also update the new structured path
                setValue('steps.features.secondaryNumber', e.target.value);
              }}
              placeholder="Additional contact number"
            />
          </div>
        </div>

        {/* Similar Units */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white">
          <Checkbox
            id="hasSimilarUnits"
            checked={getFieldValue('hasSimilarUnits', 'steps.features.hasSimilarUnits')}
            onCheckedChange={(checked) => setFieldValue('hasSimilarUnits', 'steps.features.hasSimilarUnits', checked)}
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
                    checked={(getFieldValue('amenities', 'steps.features.amenities') || []).includes(amenity)}
                    onCheckedChange={(checked) => {
                      // Update old structure
                      const currentOld = watch('amenities') || [];
                      // Update new structure
                      const currentNew = watch('steps.features.amenities') || [];
                      
                      if (checked) {
                        setValue('amenities', [...currentOld, amenity]);
                        setValue('steps.features.amenities', [...currentNew, amenity]);
                      } else {
                        setValue('amenities', currentOld.filter(a => a !== amenity));
                        setValue('steps.features.amenities', currentNew.filter(a => a !== amenity));
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
          {(errors.amenities || errors.steps?.features?.amenities) && (
            <p className="text-sm text-red-500 mt-1">
              {errors.amenities?.message || errors.steps?.features?.amenities?.message}
            </p>
          )}
        </div>
      </div>
    </FormSection>
  );
}