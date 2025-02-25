// src/modules/moderator/components/PropertyDetailModal/components/PropertyInfo.tsx
// Version: 1.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Display property information in the detail modal

import React from 'react';
import { Property } from '@/components/property/types';

interface PropertyInfoProps {
  property: Property;
}

export function PropertyInfo({ property }: PropertyInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-medium">{property.property_details?.propertyType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">₹{property.price?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-medium">{property.bedrooms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-medium">{property.bathrooms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-medium">{property.square_feet ? `${property.square_feet} sq.ft.` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <p className="font-medium">{property.owner_email || 'No Email Available'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Location Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{property.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{property.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{property.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Zip Code</p>
              <p className="font-medium">{property.zip_code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Listed</p>
              <p className="font-medium">
                {property.created_at 
                  ? new Date(property.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) + ' at ' + new Date(property.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'
                }
              </p>
            </div>
            {property.status === 'published' && property.updated_at && (
              <div>
                <p className="text-sm text-gray-500">Date Published</p>
                <p className="font-medium">
                  {new Date(property.updated_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) + ' at ' + new Date(property.updated_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Description</h3>
        <p className="text-gray-700">{property.description || 'No description provided'}</p>
      </div>
      
      {/* Additional Details */}
      {property.property_details && Object.keys(property.property_details).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Additional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(property.property_details)
              .filter(([key]) => !['propertyType', 'bhkType', 'locality', 'rentAmount', 'rentalType'].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                  <p className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}