import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee } from 'lucide-react';
import { FormSectionProps } from './types';
import { cn } from '@/lib/utils';
import {
  RENTAL_TYPES,
  MAINTENANCE_OPTIONS,
  TENANT_PREFERENCES,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
} from './constants';

export function RentalDetails({ form }: FormSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const maintenance = watch('maintenance');
  const furnishing = watch('furnishing');
  const parking = watch('parking');

  return (
    <FormSection
      title="Rental Details"
      description="Specify your rental terms and conditions."
    >
      <div className="space-y-6">
        <div>
          <Label>Property Available For</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {RENTAL_TYPES.map((type) => (
              <div
                key={type.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white",
                  "transition-all hover:border-slate-300",
                  "shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                )}
              >
                <Checkbox
                  id={type.id}
                  checked={watch('rentalType') === type.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setValue('rentalType', type.id as 'rent' | 'lease');
                    }
                  }}
                />
                <label
                  htmlFor={type.id}
                  className="text-base font-medium text-slate-700 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="rentAmount">Expected Rent</Label>
            <div className="relative flex items-center">
              <Input
                id="rentAmount"
                type="number"
                className="pr-32"
                {...register('rentAmount')}
                placeholder="Amount"
              />
              <span className="absolute right-5 text-sm font-medium text-slate-500">
                per month
              </span>
            </div>
            {errors.rentAmount && (
              <p className="text-sm text-red-600 mt-1">{errors.rentAmount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="securityDeposit">Expected Deposit</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="securityDeposit"
                type="number"
                className="pl-12"
                {...register('securityDeposit')}
                placeholder="Security deposit amount"
              />
            </div>
            {errors.securityDeposit && (
              <p className="text-sm text-red-600 mt-1">{errors.securityDeposit.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rentNegotiable"
            checked={watch('rentNegotiable')}
            onCheckedChange={(checked) => {
              setValue('rentNegotiable', checked as boolean);
            }}
          />
          <label
            htmlFor="rentNegotiable"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Rent Negotiable
          </label>
        </div>

        <div>
          <Label htmlFor="maintenance">Monthly Maintenance</Label>
          <Select value={maintenance} onValueChange={value => setValue('maintenance', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select maintenance option" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.maintenance && (
            <p className="text-sm text-red-600 mt-1">{errors.maintenance.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="availableFrom">Available From</Label>
          <Input
            id="availableFrom"
            type="date"
            {...register('availableFrom')}
          />
          {errors.availableFrom && (
            <p className="text-sm text-red-600 mt-1">{errors.availableFrom.message}</p>
          )}
        </div>

        <div>
          <Label>Preferred Tenants</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
            {TENANT_PREFERENCES.map((tenant) => (
              <div
                key={tenant}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white",
                  "transition-all hover:border-slate-300",
                  "shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                )}
              >
                <Checkbox
                  id={`tenant-${tenant}`}
                  checked={watch('preferredTenants')?.includes(tenant)}
                  onCheckedChange={(checked) => {
                    const currentTenants = watch('preferredTenants') || [];
                    if (checked) {
                      setValue('preferredTenants', [...currentTenants, tenant]);
                    } else {
                      setValue('preferredTenants', currentTenants.filter(t => t !== tenant));
                    }
                  }}
                />
                <label
                  htmlFor={`tenant-${tenant}`}
                  className="text-base font-medium text-slate-700 cursor-pointer"
                >
                  {tenant}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="furnishing">Furnishing</Label>
          <Select value={furnishing} onValueChange={value => setValue('furnishing', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select furnishing status" />
            </SelectTrigger>
            <SelectContent>
              {FURNISHING_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.furnishing && (
            <p className="text-sm text-red-600 mt-1">{errors.furnishing.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="parking">Parking</Label>
          <Select value={parking} onValueChange={value => setValue('parking', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select parking option" />
            </SelectTrigger>
            <SelectContent>
              {PARKING_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parking && (
            <p className="text-sm text-red-600 mt-1">{errors.parking.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base transition-all
              shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
              focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
              hover:border-slate-300 hover:shadow-[0_3px_6px_rgba(0,0,0,0.04)]"
            placeholder="Add more details about your property"
          />
        </div>
      </div>
    </FormSection>
  );
}