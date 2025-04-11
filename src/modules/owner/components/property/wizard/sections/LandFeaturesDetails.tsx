// src/modules/owner/components/property/wizard/sections/LandFeaturesDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 23:30 IST
// Purpose: Land/Plot features form section for the Land/Plot Sale property flow

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';

const LandFeaturesDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for land type to conditionally display fields
  const landType = watch('landType');
  const isResidential = landType === 'Residential Plot';
  const isCommercial = landType === 'Commercial Plot';
  const isAgricultural = landType === 'Agricultural Land';
  
  return (
    <FormSection
      title="Land/Plot Features"
      description="Provide additional features and specifications for your land or plot"
    >
      <div className="space-y-6">
        {/* Nearby Development Features */}
        <div>
          <p className="text-sm font-medium mb-3">Nearby Developments</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbySchool"
                {...register('nearbySchool')}
              />
              <label
                htmlFor="nearbySchool"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                School
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbyHospital"
                {...register('nearbyHospital')}
              />
              <label
                htmlFor="nearbyHospital"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hospital
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbyMarket"
                {...register('nearbyMarket')}
              />
              <label
                htmlFor="nearbyMarket"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Market/Mall
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbyStation"
                {...register('nearbyStation')}
              />
              <label
                htmlFor="nearbyStation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Metro/Railway Station
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbyAirport"
                {...register('nearbyAirport')}
              />
              <label
                htmlFor="nearbyAirport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Airport
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearbyHighway"
                {...register('nearbyHighway')}
              />
              <label
                htmlFor="nearbyHighway"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Highway
              </label>
            </div>
          </div>
        </div>
        
        {/* Land/Plot Features - Based on type */}
        {isResidential && (
          <div>
            <p className="text-sm font-medium mb-3">Residential Plot Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gatedCommunity"
                  {...register('gatedCommunity')}
                />
                <label
                  htmlFor="gatedCommunity"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gated Community
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cornerPlot"
                  {...register('cornerPlot')}
                />
                <label
                  htmlFor="cornerPlot"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Corner Plot
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parkFacing"
                  {...register('parkFacing')}
                />
                <label
                  htmlFor="parkFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Park Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eastFacing"
                  {...register('eastFacing')}
                />
                <label
                  htmlFor="eastFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  East Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waterConnection"
                  {...register('waterConnection')}
                />
                <label
                  htmlFor="waterConnection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Water Connection
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sewerConnection"
                  {...register('sewerConnection')}
                />
                <label
                  htmlFor="sewerConnection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sewer Connection
                </label>
              </div>
            </div>
          </div>
        )}
        
        {isCommercial && (
          <div>
            <p className="text-sm font-medium mb-3">Commercial Plot Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mainRoadFacing"
                  {...register('mainRoadFacing')}
                />
                <label
                  htmlFor="mainRoadFacing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Main Road Facing
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cornerCommercialPlot"
                  {...register('cornerCommercialPlot')}
                />
                <label
                  htmlFor="cornerCommercialPlot"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Corner Plot
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="commercialComplex"
                  {...register('commercialComplex')}
                />
                <label
                  htmlFor="commercialComplex"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Commercial Complex
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="industrialZone"
                  {...register('industrialZone')}
                />
                <label
                  htmlFor="industrialZone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Industrial Zone
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessPark"
                  {...register('businessPark')}
                />
                <label
                  htmlFor="businessPark"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Business Park
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highFootfall"
                  {...register('highFootfall')}
                />
                <label
                  htmlFor="highFootfall"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  High Footfall Area
                </label>
              </div>
            </div>
          </div>
        )}
        
        {isAgricultural && (
          <div>
            <p className="text-sm font-medium mb-3">Agricultural Land Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="irrigationFacility"
                  {...register('irrigationFacility')}
                />
                <label
                  htmlFor="irrigationFacility"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Irrigation Facility
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="farmHouse"
                  {...register('farmHouse')}
                />
                <label
                  htmlFor="farmHouse"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Farm House
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="borewellTubewell"
                  {...register('borewellTubewell')}
                />
                <label
                  htmlFor="borewellTubewell"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Borewell/Tubewell
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organicFarming"
                  {...register('organicFarming')}
                />
                <label
                  htmlFor="organicFarming"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Organic Farming
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="riverCanal"
                  {...register('riverCanal')}
                />
                <label
                  htmlFor="riverCanal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  River/Canal Nearby
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Distance from Key Landmarks */}
        <div>
          <p className="text-sm font-medium mb-3">Distance from Key Locations (in km)</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="distanceFromCity">
                Distance from City Center
              </RequiredLabel>
              <Input
                id="distanceFromCity"
                type="number"
                placeholder="e.g., 5"
                error={errors.distanceFromCity?.message}
                {...register('distanceFromCity')}
              />
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="distanceFromHighway">
                Distance from Highway
              </RequiredLabel>
              <Input
                id="distanceFromHighway"
                type="number"
                placeholder="e.g., 2"
                error={errors.distanceFromHighway?.message}
                {...register('distanceFromHighway')}
              />
            </div>
          </div>
        </div>
        
        {/* Property Documents */}
        <div>
          <p className="text-sm font-medium mb-3">Available Documents</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="titleDeed"
                {...register('titleDeed')}
              />
              <label
                htmlFor="titleDeed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title Deed
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="encumbranceCertificate"
                {...register('encumbranceCertificate')}
              />
              <label
                htmlFor="encumbranceCertificate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Encumbrance Certificate
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="approvalLetters"
                {...register('approvalLetters')}
              />
              <label
                htmlFor="approvalLetters"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Approval Letters
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taxReceipts"
                {...register('taxReceipts')}
              />
              <label
                htmlFor="taxReceipts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tax Receipts
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="landSurveyReport"
                {...register('landSurveyReport')}
              />
              <label
                htmlFor="landSurveyReport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Land Survey Report
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conversionOrder"
                {...register('conversionOrder')}
              />
              <label
                htmlFor="conversionOrder"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Conversion Order
              </label>
            </div>
          </div>
        </div>
        
        {/* Landmarks and Important Places */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="nearbyLandmarks">
            Nearby Landmarks
          </RequiredLabel>
          <Textarea
            id="nearbyLandmarks"
            placeholder="Describe important landmarks near your land/plot..."
            error={errors.nearbyLandmarks?.message}
            {...register('nearbyLandmarks')}
            rows={3}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default LandFeaturesDetails;