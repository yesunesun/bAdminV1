// src/modules/owner/components/property/wizard/sections/CommercialSaleDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 23:15 IST
// Purpose: Commercial Sale details form section for the Commercial Sale property flow

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { FormSectionProps } from '../types';
import { 
  COMMERCIAL_SALE_PROPERTY_TYPES, 
  COMMERCIAL_PRICE_OPTIONS, 
  COMMERCIAL_OWNERSHIP_OPTIONS,
  TRANSACTION_TYPES,
  APPROVED_USAGE_TYPES,
  PROPERTY_STATUS_OPTIONS,
  TITLE_DEED_STATUS
} from '../constants/commercialSaleDetails';

const CommercialSaleDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType
}) => {
  const { register, watch, setValue, formState: { errors } } = form;
  
  // Watch for property status to conditionally show fields
  const propertyStatus = watch('propertyStatus');
  const isUnderConstruction = propertyStatus === 'Under Construction';
  
  // Calculate price per sq. ft automatically
  const expectedPrice = watch('expectedPrice');
  const builtUpArea = watch('builtUpArea');
  
  React.useEffect(() => {
    if (expectedPrice && builtUpArea && !isNaN(Number(expectedPrice)) && !isNaN(Number(builtUpArea))) {
      const pricePerSqFt = Math.round(Number(expectedPrice) / Number(builtUpArea));
      setValue('pricePerSqFt', pricePerSqFt.toString());
    }
  }, [expectedPrice, builtUpArea, setValue]);

  return (
    <FormSection
      title="Commercial Sale Details"
      description="Provide details about your commercial property for sale"
    >
      <div className="space-y-6">
        {/* Property Type */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="commercialPropertyType">
            Commercial Property Type
          </RequiredLabel>
          <Select
            id="commercialPropertyType"
            placeholder="Select property type"
            error={errors.commercialPropertyType?.message}
            {...register('commercialPropertyType')}
          >
            <option value="">Select property type</option>
            {COMMERCIAL_SALE_PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Price details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="expectedPrice">
              Expected Price (₹)
            </RequiredLabel>
            <Input
              id="expectedPrice"
              type="number"
              placeholder="e.g., 25000000"
              error={errors.expectedPrice?.message}
              {...register('expectedPrice')}
            />
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="pricePerSqFt">
              Price Per Sq. Ft. (₹)
            </RequiredLabel>
            <Input
              id="pricePerSqFt"
              type="number"
              placeholder="Auto-calculated"
              error={errors.pricePerSqFt?.message}
              {...register('pricePerSqFt')}
              readOnly
            />
          </div>
        </div>
        
        {/* Price Options */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="priceOption">
            Price Option
          </RequiredLabel>
          <Select
            id="priceOption"
            placeholder="Select price option"
            error={errors.priceOption?.message}
            {...register('priceOption')}
          >
            <option value="">Select price option</option>
            {COMMERCIAL_PRICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Ownership details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <RequiredLabel htmlFor="ownershipType">
              Ownership Type
            </RequiredLabel>
            <Select
              id="ownershipType"
              placeholder="Select ownership type"
              error={errors.ownershipType?.message}
              {...register('ownershipType')}
            >
              <option value="">Select ownership type</option>
              {COMMERCIAL_OWNERSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid gap-3">
            <RequiredLabel htmlFor="transactionType">
              Transaction Type
            </RequiredLabel>
            <Select
              id="transactionType"
              placeholder="Select transaction type"
              error={errors.transactionType?.message}
              {...register('transactionType')}
            >
              <option value="">Select transaction type</option>
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Property Status */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="propertyStatus">
            Property Status
          </RequiredLabel>
          <Select
            id="propertyStatus"
            placeholder="Select property status"
            error={errors.propertyStatus?.message}
            {...register('propertyStatus')}
          >
            <option value="">Select property status</option>
            {PROPERTY_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Conditional fields based on property status */}
        {isUnderConstruction ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="possessionDate">
                Expected Possession Date
              </RequiredLabel>
              <Input
                id="possessionDate"
                type="date"
                placeholder="Select date"
                error={errors.possessionDate?.message}
                {...register('possessionDate')}
              />
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="completionStatus">
                Construction Status
              </RequiredLabel>
              <Select
                id="completionStatus"
                placeholder="Select completion status"
                error={errors.completionStatus?.message}
                {...register('completionStatus')}
              >
                <option value="">Select completion status</option>
                {PROPERTY_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <RequiredLabel htmlFor="propertyAge">
                Property Age (in years)
              </RequiredLabel>
              <Input
                id="propertyAge"
                type="number"
                placeholder="e.g., 2"
                error={errors.propertyAge?.message}
                {...register('propertyAge')}
              />
            </div>
            
            <div className="grid gap-3">
              <RequiredLabel htmlFor="availableFrom">
                Available From
              </RequiredLabel>
              <Input
                id="availableFrom"
                type="date"
                placeholder="Select date"
                error={errors.availableFrom?.message}
                {...register('availableFrom')}
              />
            </div>
          </div>
        )}
        
        {/* Approved Usage */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="approvedUsage">
            Approved Usage
          </RequiredLabel>
          <Select
            id="approvedUsage"
            placeholder="Select approved usage"
            error={errors.approvedUsage?.message}
            {...register('approvedUsage')}
          >
            <option value="">Select approved usage</option>
            {APPROVED_USAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Title deed status */}
        <div className="grid gap-3">
          <RequiredLabel htmlFor="titleDeedStatus">
            Title Deed Status
          </RequiredLabel>
          <Select
            id="titleDeedStatus"
            placeholder="Select title deed status"
            error={errors.titleDeedStatus?.message}
            {...register('titleDeedStatus')}
          >
            <option value="">Select title deed status</option>
            {TITLE_DEED_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        
        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasMaintenanceCharges"
              {...register('hasMaintenanceCharges')}
            />
            <label
              htmlFor="hasMaintenanceCharges"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include maintenance charges
            </label>
          </div>
          
          {watch('hasMaintenanceCharges') && (
            <div className="grid gap-3 pl-6">
              <RequiredLabel htmlFor="maintenanceAmount">
                Maintenance Amount (₹)
              </RequiredLabel>
              <Input
                id="maintenanceAmount"
                type="number"
                placeholder="e.g., 5000"
                error={errors.maintenanceAmount?.message}
                {...register('maintenanceAmount')}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fireSafety"
              {...register('fireSafety')}
            />
            <label
              htmlFor="fireSafety"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Fire safety measures installed
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="centralizedAC"
              {...register('centralizedAC')}
            />
            <label
              htmlFor="centralizedAC"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Centralized AC
            </label>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CommercialSaleDetails;