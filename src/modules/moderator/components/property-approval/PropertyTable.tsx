// src/modules/moderator/components/property-approval/PropertyTable.tsx
// Version: 2.2.0
// Last Modified: 26-02-2025 21:45 IST
// Purpose: Display properties in a table with owner emails

import React from 'react';
import { Property } from '@/components/property/types';
import { cn } from '@/lib/utils';

interface PropertyTableProps {
  filteredProperties: Property[];
  ownersMap: Record<string, any>;
  isProcessing: string | null;
  onApprove: (id: string) => Promise<void>;
  handleReject: (id: string) => void;
  handleViewProperty: (property: Property) => void;
  searchQuery: string;
  statusFilter: string;
  propertyTypeFilter: string;
  locationFilter: string;
  ownerFilter: string;
  hasImagesFilter: string;
}

export function PropertyTable({
  filteredProperties,
  ownersMap,
  isProcessing,
  onApprove,
  handleReject,
  handleViewProperty,
  searchQuery,
  statusFilter,
  propertyTypeFilter,
  locationFilter,
  ownerFilter,
  hasImagesFilter
}: PropertyTableProps) {
  
  // Show empty state if no properties match filters
  if (filteredProperties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || statusFilter !== 'all' || propertyTypeFilter !== 'all' || 
           locationFilter !== 'all' || ownerFilter !== 'all' || hasImagesFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'Properties pending moderation will appear here'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (₹)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties.map((property) => {
              return (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewProperty(property)}>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0].url} 
                            alt={property.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.property_details?.propertyType} • {property.property_details?.bhkType || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.city || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{property.property_details?.locality || property.state || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.price ? `₹${property.price.toLocaleString()}` : `₹${property.property_details?.rentAmount || 'N/A'}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.property_details?.rentalType === 'rent' ? 'Monthly' : 'Lease'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.owner_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      property.status === 'published' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    )}>
                      {property.status === 'published' ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}