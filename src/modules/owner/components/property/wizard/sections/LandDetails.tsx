// src/modules/owner/components/property/wizard/sections/LandDetails.tsx
// Version: 1.8.0
// Last Modified: 14-04-2025 15:30 IST
// Purpose: Fixed rupee symbol overlap issue by using direct text input with placeholder

import React, { useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';
import { 
  LAND_TYPES, 
  PLOT_FACING, 
  APPROVAL_STATUS,
  BOUNDARY_TYPES,
  SOIL_TYPES,
  TOPOGRAPHY_TYPES,
  WATER_AVAILABILITY,
  ELECTRICITY_STATUS,
  ROAD_CONNECTIVITY,
  DEVELOPMENT_STATUS
} from '../constants/landDetails';

// Conversion factors for area units
const AREA_CONVERSION = {
  sqft: {
    sqft: 1,
    sqyd: 0.111111,
    acre: 0.0000229568,
    hectare: 0.00000929,
  },
  sqyd: {
    sqft: 9,
    sqyd: 1,
    acre: 0.000206612,
    hectare: 0.0000836127,
  },
  acre: {
    sqft: 43560,
    sqyd: 4840,
    acre: 1,
    hectare: 0.404686,
  },
  hectare: {
    sqft: 107639,
    sqyd: 11960,
    acre: 2.47105,
    hectare: 1,
  },
};

const LandDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for certain values to conditionally display fields
  const landType = watch('landType');
  const isAgricultural = landType === 'Agricultural Land';
  
  // Calculate total area from dimensions and handle unit changes
  const plotLength = watch('plotLength');
  const plotWidth = watch('plotWidth');
  const areaUnit = watch('areaUnit') || 'sqft';
  const previousAreaUnit = React.useRef(areaUnit);
  const builtUpArea = watch('builtUpArea');

  // Effect to calculate area when dimensions change
  useEffect(() => {
    if (plotLength && plotWidth && !isNaN(Number(plotLength)) && !isNaN(Number(plotWidth))) {
      const totalAreaInSqft = Math.round(Number(plotLength) * Number(plotWidth));
      
      // Convert to the selected unit
      let convertedArea = totalAreaInSqft;
      if (areaUnit !== 'sqft') {
        convertedArea = totalAreaInSqft * AREA_CONVERSION.sqft[areaUnit];
      }

      setValue('builtUpArea', convertedArea.toFixed(
        areaUnit === 'sqft' || areaUnit === 'sqyd' ? 0 : 4
      ));
      setValue('builtUpAreaUnit', areaUnit);
    }
  }, [plotLength, plotWidth, areaUnit, setValue]);

  // Effect to handle area unit changes (convert existing area to new unit)
  useEffect(() => {
    // Skip on initial render or if no area value exists
    if (previousAreaUnit.current === areaUnit || !builtUpArea) {
      previousAreaUnit.current = areaUnit;
      return;
    }

    // Convert from previous unit to new unit
    if (builtUpArea && previousAreaUnit.current) {
      const currentArea = parseFloat(builtUpArea);
      
      // First convert to sqft (our base unit)
      let areaInSqft;
      if (previousAreaUnit.current === 'sqft') {
        areaInSqft = currentArea;
      } else {
        areaInSqft = currentArea / AREA_CONVERSION.sqft[previousAreaUnit.current];
      }

      // Then convert from sqft to target unit
      let convertedArea = areaInSqft;
      if (areaUnit !== 'sqft') {
        convertedArea = areaInSqft * AREA_CONVERSION.sqft[areaUnit];
      }

      // Update the area value with proper precision based on unit
      setValue('builtUpArea', convertedArea.toFixed(
        areaUnit === 'sqft' || areaUnit === 'sqyd' ? 0 : 4
      ));
      setValue('builtUpAreaUnit', areaUnit);
    }

    previousAreaUnit.current = areaUnit;
  }, [areaUnit, builtUpArea, setValue]);
  
  return (
    <FormSection
      title="Land/Plot Details"
      description="Provide details about your land or plot for sale"
    >
      <div className="space-y-6">
        {/* Land Type */}
        <div className="mb-6">
          <RequiredLabel htmlFor="landType" className="mb-2 block">
            Land/Plot Type
          </RequiredLabel>
          <select
            id="landType"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('landType')}
          >
            <option value="">Select land type</option>
            {LAND_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.landType && (
            <p className="text-sm text-destructive mt-1">{errors.landType.message as string}</p>
          )}
        </div>
        
        {/* Plot Dimensions */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2 block">Plot Dimensions</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="plotLength" className="mb-2 block">
                Length (ft)
              </RequiredLabel>
              <Input
                id="plotLength"
                type="number"
                placeholder="e.g., 60"
                className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                {...register('plotLength')}
              />
              {errors.plotLength && (
                <p className="text-sm text-destructive mt-1">{errors.plotLength.message as string}</p>
              )}
            </div>
            
            <div>
              <RequiredLabel htmlFor="plotWidth" className="mb-2 block">
                Width (ft)
              </RequiredLabel>
              <Input
                id="plotWidth"
                type="number"
                placeholder="e.g., 40"
                className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
                {...register('plotWidth')}
              />
              {errors.plotWidth && (
                <p className="text-sm text-destructive mt-1">{errors.plotWidth.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Area Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="builtUpArea" className="mb-2 block">
              Total Area
            </RequiredLabel>
            <Input
              id="builtUpArea"
              type="text"
              placeholder="Auto-calculated"
              readOnly
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('builtUpArea')}
            />
            {errors.builtUpArea && (
              <p className="text-sm text-destructive mt-1">{errors.builtUpArea.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="areaUnit" className="mb-2 block">
              Area Unit
            </RequiredLabel>
            <select
              id="areaUnit"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('areaUnit')}
            >
              <option value="sqft">Square Feet</option>
              <option value="sqyd">Square Yards</option>
              <option value="acre">Acre</option>
              <option value="hectare">Hectare</option>
            </select>
            {errors.areaUnit && (
              <p className="text-sm text-destructive mt-1">{errors.areaUnit.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Plot Facing and Price */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="plotFacing" className="mb-2 block">
              Plot Facing
            </RequiredLabel>
            <select
              id="plotFacing"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('plotFacing')}
            >
              <option value="">Select plot facing</option>
              {PLOT_FACING.map((facing) => (
                <option key={facing} value={facing}>
                  {facing}
                </option>
              ))}
            </select>
            {errors.plotFacing && (
              <p className="text-sm text-destructive mt-1">{errors.plotFacing.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="expectedPrice" className="mb-2 block">
              Expected Price (₹)
            </RequiredLabel>
            {/* Using a direct input field without the symbol overlay */}
            <Input
              id="expectedPrice"
              type="text"
              placeholder="e.g., 5000000"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('expectedPrice')}
            />
            {errors.expectedPrice && (
              <p className="text-sm text-destructive mt-1">{errors.expectedPrice.message as string}</p>
            )}
            <div className="flex items-center space-x-2 pt-2 mt-1">
              <input
                type="checkbox"
                id="isNegotiable"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                {...register('isNegotiable')}
              />
              <label
                htmlFor="isNegotiable"
                className="text-sm text-gray-600 font-medium"
              >
                Price Negotiable
              </label>
            </div>
          </div>
        </div>
        
        {/* Development Status */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="developmentStatus" className="mb-2 block">
              Development Status
            </RequiredLabel>
            <select
              id="developmentStatus"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('developmentStatus')}
            >
              <option value="">Select development status</option>
              {DEVELOPMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.developmentStatus && (
              <p className="text-sm text-destructive mt-1">{errors.developmentStatus.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="approvalStatus" className="mb-2 block">
              Approval Status
            </RequiredLabel>
            <select
              id="approvalStatus"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('approvalStatus')}
            >
              <option value="">Select approval status</option>
              {APPROVAL_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.approvalStatus && (
              <p className="text-sm text-destructive mt-1">{errors.approvalStatus.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Floor Space Index (FSI) - Only for non-agricultural land */}
        {!isAgricultural && (
          <div className="mb-6">
            <RequiredLabel htmlFor="floorSpaceIndex" className="mb-2 block">
              Floor Space Index (FSI)
            </RequiredLabel>
            <Input
              id="floorSpaceIndex"
              type="text"
              placeholder="e.g., 1.5"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...register('floorSpaceIndex')}
            />
            {errors.floorSpaceIndex && (
              <p className="text-sm text-destructive mt-1">{errors.floorSpaceIndex.message as string}</p>
            )}
          </div>
        )}
        
        {/* Soil type - Only for agricultural land */}
        {isAgricultural && (
          <div className="mb-6">
            <RequiredLabel htmlFor="soilType" className="mb-2 block">
              Soil Type
            </RequiredLabel>
            <select
              id="soilType"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('soilType')}
            >
              <option value="">Select soil type</option>
              {SOIL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.soilType && (
              <p className="text-sm text-destructive mt-1">{errors.soilType.message as string}</p>
            )}
          </div>
        )}
        
        {/* Boundary and Topography */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor="boundaryType" className="mb-2 block">
              Boundary Type
            </RequiredLabel>
            <select
              id="boundaryType"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('boundaryType')}
            >
              <option value="">Select boundary type</option>
              {BOUNDARY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.boundaryType && (
              <p className="text-sm text-destructive mt-1">{errors.boundaryType.message as string}</p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor="topographyType" className="mb-2 block">
              Topography
            </RequiredLabel>
            <select
              id="topographyType"
              className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
              {...register('topographyType')}
            >
              <option value="">Select topography</option>
              {TOPOGRAPHY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.topographyType && (
              <p className="text-sm text-destructive mt-1">{errors.topographyType.message as string}</p>
            )}
          </div>
        </div>
        
        {/* Utilities */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium mb-3 block">Utilities</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="waterAvailability" className="mb-2 block">
                Water Availability
              </RequiredLabel>
              <select
                id="waterAvailability"
                className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
                {...register('waterAvailability')}
              >
                <option value="">Select water availability</option>
                {WATER_AVAILABILITY.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.waterAvailability && (
                <p className="text-sm text-destructive mt-1">{errors.waterAvailability.message as string}</p>
              )}
            </div>
            
            <div>
              <RequiredLabel htmlFor="electricityStatus" className="mb-2 block">
                Electricity Status
              </RequiredLabel>
              <select
                id="electricityStatus"
                className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
                {...register('electricityStatus')}
              >
                <option value="">Select electricity status</option>
                {ELECTRICITY_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.electricityStatus && (
                <p className="text-sm text-destructive mt-1">{errors.electricityStatus.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Road Connectivity */}
        <div className="mb-6">
          <RequiredLabel htmlFor="roadConnectivity" className="mb-2 block">
            Road Connectivity
          </RequiredLabel>
          <select
            id="roadConnectivity"
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...register('roadConnectivity')}
          >
            <option value="">Select road connectivity</option>
            {ROAD_CONNECTIVITY.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.roadConnectivity && (
            <p className="text-sm text-destructive mt-1">{errors.roadConnectivity.message as string}</p>
          )}
        </div>
        
        {/* Additional Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <RequiredLabel htmlFor="additionalDetails">
              Additional Details
            </RequiredLabel>
            <div className="text-xs text-muted-foreground italic">Recommended</div>
          </div>
          <Textarea
            id="additionalDetails"
            placeholder="Add any additional details about your land/plot..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-32"
            {...register('additionalDetails')}
          />
          {errors.additionalDetails && (
            <p className="text-sm text-destructive mt-1">{errors.additionalDetails.message as string}</p>
          )}
          <div className="mt-2 flex items-start text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="8"></line>
            </svg>
            <span>Include key selling points like nearby developments, potential use cases, or investment benefits.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default LandDetails;