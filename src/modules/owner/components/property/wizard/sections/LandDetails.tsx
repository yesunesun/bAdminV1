// src/modules/owner/components/property/wizard/sections/LandDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 23:25 IST
// Purpose: Land/Plot details form section for the Land/Plot Sale property flow

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

const LandDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for certain values to conditionally display fields
  const landType = watch('landType');
  const isAgricultural = landType === 'Agricultural Land';
  
  // Calculate total area from dimensions
  const plotLength = watch('plotLength');
  const plotWidth = watch('plotWidth');
  const areaUnit = watch('areaUnit') || 'sqft';
  
  React.useEffect(() => {
    if (plotLength && plotWidth && !isNaN(Number(plotLength)) && !isNaN(Number(plotWidth))) {
      const totalArea = Math.round(Number(plotLength) * Number(plotWidth));
      setValue('builtUpArea', totalArea.toString());
      setValue('builtUpAreaUnit', areaUnit);
    }
  }, [plotLength, plotWidth, areaUnit, setValue]);

  return (
    <FormSection
      title="Land/Plot Details"
      description="Provide details about your land or plot for sale"
    >
      <div className="space-y-6">
        {/* Land Type */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="landType">
            Land/Plot Type
          </RequiredLabel>
          <Select
            id="landType"
            placeholder="Select land type"
            error={errors.landType?.message}
            {...register('landType')}
          >
            <option value="">Select land type</option>
            {LAND_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Plot Dimensions */}
        <div>
          <p className="text-sm font-medium mb-3">Plot Dimensions</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="plotLength">
                Length (ft)
              </RequiredLabel>
              <Input
                id="plotLength"
                type="number"
                placeholder="e.g., 60"
                error={errors.plotLength?.message}
                {...register('plotLength')}
              />
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="plotWidth">
                Width (ft)
              </RequiredLabel>
              <Input
                id="plotWidth"
                type="number"
                placeholder="e.g., 40"
                error={errors.plotWidth?.message}
                {...register('plotWidth')}
              />
            </div>
          </div>
        </div>
        
        {/* Area Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="builtUpArea">
              Total Area
            </RequiredLabel>
            <Input
              id="builtUpArea"
              type="number"
              placeholder="Auto-calculated"
              error={errors.builtUpArea?.message}
              {...register('builtUpArea')}
              readOnly
            />
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="areaUnit">
              Area Unit
            </RequiredLabel>
            <Select
              id="areaUnit"
              placeholder="Select area unit"
              error={errors.areaUnit?.message}
              {...register('areaUnit')}
            >
              <option value="sqft">Square Feet</option>
              <option value="sqyd">Square Yards</option>
              <option value="acre">Acre</option>
              <option value="hectare">Hectare</option>
            </Select>
          </div>
        </div>
        
        {/* Plot Facing and Price */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="plotFacing">
              Plot Facing
            </RequiredLabel>
            <Select
              id="plotFacing"
              placeholder="Select plot facing"
              error={errors.plotFacing?.message}
              {...register('plotFacing')}
            >
              <option value="">Select plot facing</option>
              {PLOT_FACING.map((facing) => (
                <option key={facing} value={facing}>
                  {facing}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="expectedPrice">
              Expected Price (₹)
            </RequiredLabel>
            <Input
              id="expectedPrice"
              type="number"
              placeholder="e.g., 5000000"
              error={errors.expectedPrice?.message}
              {...register('expectedPrice')}
            />
          </div>
        </div>
        
        {/* Development Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="developmentStatus">
              Development Status
            </RequiredLabel>
            <Select
              id="developmentStatus"
              placeholder="Select development status"
              error={errors.developmentStatus?.message}
              {...register('developmentStatus')}
            >
              <option value="">Select development status</option>
              {DEVELOPMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="approvalStatus">
              Approval Status
            </RequiredLabel>
            <Select
              id="approvalStatus"
              placeholder="Select approval status"
              error={errors.approvalStatus?.message}
              {...register('approvalStatus')}
            >
              <option value="">Select approval status</option>
              {APPROVAL_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Floor Space Index (FSI) - Only for non-agricultural land */}
        {!isAgricultural && (
          <div className="grid gap-3">
            <RequiredLabel htmlFor="floorSpaceIndex">
              Floor Space Index (FSI)
            </RequiredLabel>
            <Input
              id="floorSpaceIndex"
              type="text"
              placeholder="e.g., 1.5"
              error={errors.floorSpaceIndex?.message}
              {...register('floorSpaceIndex')}
            />
          </div>
        )}
        
        {/* Soil type - Only for agricultural land */}
        {isAgricultural && (
          <div className="grid gap-3">
            <RequiredLabel htmlFor="soilType">
              Soil Type
            </RequiredLabel>
            <Select
              id="soilType"
              placeholder="Select soil type"
              error={errors.soilType?.message}
              {...register('soilType')}
            >
              <option value="">Select soil type</option>
              {SOIL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        )}
        
        {/* Boundary and Topography */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="boundaryType">
              Boundary Type
            </RequiredLabel>
            <Select
              id="boundaryType"
              placeholder="Select boundary type"
              error={errors.boundaryType?.message}
              {...register('boundaryType')}
            >
              <option value="">Select boundary type</option>
              {BOUNDARY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="topographyType">
              Topography
            </RequiredLabel>
            <Select
              id="topographyType"
              placeholder="Select topography"
              error={errors.topographyType?.message}
              {...register('topographyType')}
            >
              <option value="">Select topography</option>
              {TOPOGRAPHY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Utilities */}
        <div>
          <p className="text-sm font-medium mb-3">Utilities</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="waterAvailability">
                Water Availability
              </RequiredLabel>
              <Select
                id="waterAvailability"
                placeholder="Select water availability"
                error={errors.waterAvailability?.message}
                {...register('waterAvailability')}
              >
                <option value="">Select water availability</option>
                {WATER_AVAILABILITY.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="electricityStatus">
                Electricity Status
              </RequiredLabel>
              <Select
                id="electricityStatus"
                placeholder="Select electricity status"
                error={errors.electricityStatus?.message}
                {...register('electricityStatus')}
              >
                <option value="">Select electricity status</option>
                {ELECTRICITY_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        
        {/* Road Connectivity */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="roadConnectivity">
            Road Connectivity
          </RequiredLabel>
          <Select
            id="roadConnectivity"
            placeholder="Select road connectivity"
            error={errors.roadConnectivity?.message}
            {...register('roadConnectivity')}
          >
            <option value="">Select road connectivity</option>
            {ROAD_CONNECTIVITY.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Additional Details */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="additionalDetails">
            Additional Details
          </RequiredLabel>
          <Textarea
            id="additionalDetails"
            placeholder="Add any additional details about your land/plot..."
            error={errors.additionalDetails?.message}
            {...register('additionalDetails')}
            rows={4}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default LandDetails;