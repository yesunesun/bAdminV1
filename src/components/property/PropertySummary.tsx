import React from 'react';
import { FormSection } from '@/components/FormSection';
import { FormData } from './types';
import { IndianRupee } from 'lucide-react';

interface PropertySummaryProps {
  formData: FormData;
  onSaveForLater: () => void;
  onPublish: () => void;
  onPrevious: () => void;
}

export function PropertySummary({ formData, onSaveForLater, onPublish, onPrevious }: PropertySummaryProps) {
  return (
    <FormSection
      title="Property Summary"
      description="Review your property details before saving or publishing."
    >
      <div className="space-y-8">
        <div className="border-b pb-6">
          <h4 className="font-medium text-lg mb-4">Property Details</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Property Type</dt>
              <dd className="mt-1 font-medium">{formData.propertyType}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">BHK Type</dt>
              <dd className="mt-1 font-medium">{formData.bhkType}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Floor</dt>
              <dd className="mt-1 font-medium">{formData.floor}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Floors</dt>
              <dd className="mt-1 font-medium">{formData.totalFloors}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Property Age</dt>
              <dd className="mt-1 font-medium">{formData.propertyAge}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Facing</dt>
              <dd className="mt-1 font-medium">{formData.facing}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Built Up Area</dt>
              <dd className="mt-1 font-medium">{formData.builtUpArea} sq ft</dd>
            </div>
          </dl>
        </div>

        <div className="border-b pb-6">
          <h4 className="font-medium text-lg mb-4">Location Details</h4>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Zone</dt>
              <dd className="mt-1 font-medium">{formData.zone}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Locality</dt>
              <dd className="mt-1 font-medium">{formData.locality}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Landmark</dt>
              <dd className="mt-1 font-medium">{formData.landmark}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Complete Address</dt>
              <dd className="mt-1 font-medium">{formData.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">PIN Code</dt>
              <dd className="mt-1 font-medium">{formData.pinCode}</dd>
            </div>
          </dl>
        </div>

        <div className="border-b pb-6">
          <h4 className="font-medium text-lg mb-4">Rental Details</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Rental Type</dt>
              <dd className="mt-1 font-medium capitalize">{formData.rentalType}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Monthly Rent</dt>
              <dd className="mt-1 font-medium flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {parseInt(formData.rentAmount).toLocaleString('en-IN')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Security Deposit</dt>
              <dd className="mt-1 font-medium flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {parseInt(formData.securityDeposit).toLocaleString('en-IN')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Maintenance</dt>
              <dd className="mt-1 font-medium">{formData.maintenance}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Available From</dt>
              <dd className="mt-1 font-medium">
                {new Date(formData.availableFrom).toLocaleDateString('en-IN')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Furnishing</dt>
              <dd className="mt-1 font-medium">{formData.furnishing}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Parking</dt>
              <dd className="mt-1 font-medium">{formData.parking}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rent Negotiable</dt>
              <dd className="mt-1 font-medium">{formData.rentNegotiable ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        <div className="border-b pb-6">
          <h4 className="font-medium text-lg mb-4">Preferred Tenants</h4>
          <div className="flex flex-wrap gap-2">
            {formData.preferredTenants.map((tenant) => (
              <span
                key={tenant}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {tenant}
              </span>
            ))}
          </div>
        </div>

        <div className="border-b pb-6">
          <h4 className="font-medium text-lg mb-4">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {formData.description && (
          <div>
            <h4 className="font-medium text-lg mb-4">Description</h4>
            <p className="text-gray-700 whitespace-pre-line">{formData.description}</p>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-xl hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-4 focus:ring-slate-100"
          >
            Previous
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onSaveForLater}
              className="px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 
                rounded-xl hover:bg-slate-200 transition-colors focus:outline-none 
                focus:ring-4 focus:ring-slate-100"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={onPublish}
              className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 
                rounded-xl hover:bg-indigo-700 transition-colors focus:outline-none 
                focus:ring-4 focus:ring-indigo-100"
            >
              Save & Publish
            </button>
          </div>
        </div>
      </div>
    </FormSection>
  );
}