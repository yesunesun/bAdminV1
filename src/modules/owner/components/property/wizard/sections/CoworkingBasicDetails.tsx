// src/modules/owner/components/property/wizard/sections/CoworkingBasicDetails.tsx
// Version: 1.0.0
// Last Modified: 02-05-2025 19:00 IST
// Purpose: Specialized basic details component for co-working spaces

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { 
  COWORKING_SPACE_TYPES
} from '../constants/coworkingDetails';

const CoworkingBasicDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, formState: { errors } } = form;
  
  return (
    <FormSection
      title="Co-working Space Basic Information"
      description="Provide basic information about your co-working space property"
    >
      <div className="space-y-6">
        {/* Property Title */}
        <div className="mb-6">
          <RequiredLabel htmlFor="title" className="mb-2 block">
            Property Title
          </RequiredLabel>
          <Input
            id="title"
            placeholder="Enter a catchy title for your co-working space"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message as string}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            A good title helps your property stand out (e.g., "Modern Co-working Space in HITEC City")
          </p>
        </div>
        
        {/* Space Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor="propertyType" className="mb-2 block">
            Co-working Space Type
          </RequiredLabel>
          <select
            id="propertyType"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('propertyType')}
          >
            <option value="">Select space type</option>
            {COWORKING_SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p className="text-sm text-destructive mt-1">{errors.propertyType.message as string}</p>
          )}
        </div>
        
        {/* Total Area */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="builtUpArea" className="mb-2 block">
              Total Area
            </RequiredLabel>
            <Input
              id="builtUpArea"
              type="number"
              placeholder="e.g., 2000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('builtUpArea')}
            />
            {errors.builtUpArea && (
              <p className="text-sm text-destructive mt-1">{errors.builtUpArea.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="builtUpAreaUnit" className="mb-2 block">
              Area Unit
            </RequiredLabel>
            <select
              id="builtUpAreaUnit"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('builtUpAreaUnit')}
            >
              <option value="sqft">Square Feet</option>
              <option value="sqyd">Square Yards</option>
            </select>
            {errors.builtUpAreaUnit && (
              <p className="text-sm text-destructive mt-1">{errors.builtUpAreaUnit.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Property Age */}
        <div className="mb-6">
          <RequiredLabel htmlFor="propertyAge" className="mb-2 block">
            Property Age
          </RequiredLabel>
          <select
            id="propertyAge"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('propertyAge')}
          >
            <option value="">Select property age</option>
            <option value="New">Brand New</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-10 years">5-10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
          {errors.propertyAge && (
            <p className="text-sm text-destructive mt-1">{errors.propertyAge.message as string}</p>
          )}
        </div>
        
        {/* Floor and Total Floors */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="floor" className="mb-2 block">
              Floor
            </RequiredLabel>
            <Input
              id="floor"
              type="number"
              placeholder="e.g., 3"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('floor')}
            />
            {errors.floor && (
              <p className="text-sm text-destructive mt-1">{errors.floor.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="totalFloors" className="mb-2 block">
              Total Floors
            </RequiredLabel>
            <Input
              id="totalFloors"
              type="number"
              placeholder="e.g., 10"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('totalFloors')}
            />
            {errors.totalFloors && (
              <p className="text-sm text-destructive mt-1">{errors.totalFloors.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Facing */}
        <div className="mb-6">
          <RequiredLabel htmlFor="facing" className="mb-2 block">
            Facing Direction
          </RequiredLabel>
          <select
            id="facing"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('facing')}
          >
            <option value="">Select direction</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North-East">North-East</option>
            <option value="North-West">North-West</option>
            <option value="South-East">South-East</option>
            <option value="South-West">South-West</option>
          </select>
          {errors.facing && (
            <p className="text-sm text-destructive mt-1">{errors.facing.message as string}</p>
          )}
        </div>
        
        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor="description">
              Short Description
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Recommended</div>
          </div>
          <Textarea
            id="description"
            placeholder="Briefly describe your co-working space..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-24"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message as string}</p>
          )}
          <div className="mt-2 flex items-start text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="8"></line>
            </svg>
            <span>Include key highlights such as location advantages, unique amenities, or special offers.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingBasicDetails;