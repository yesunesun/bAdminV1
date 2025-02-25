// src/modules/moderator/components/property-approval/PropertyTable.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 20:30 IST
// Purpose: Display properties in a table with approval actions

import React from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Property } from '@/components/property/types';
import { cn } from '@/lib/utils';

interface PropertyOwner {
  id: string;
  email: string;
  name?: string;
}

interface PropertyTableProps {
  filteredProperties: Property[];
  ownersMap: Record<string, PropertyOwner>;
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties.map((property) => {
              const isPending = property.status === 'draft';
              const isProcessingThis = isProcessing === property.id;
              const owner = ownersMap[property.owner_id];
              
              return (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                        <div className="text-sm font-medium text-gray-900">
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
                      {owner ? (owner.name || owner.email) : 'Unknown'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <div className="relative group">
                        <button
                          onClick={() => handleViewProperty(property)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label="View property details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                          View details
                        </div>
                      </div>
                      
                      {isPending && (
                        <>
                          <div className="relative group">
                            <button
                              onClick={() => onApprove(property.id)}
                              disabled={isProcessingThis}
                              className={cn(
                                "text-green-600 hover:text-green-900",
                                isProcessingThis && "opacity-50 cursor-not-allowed"
                              )}
                              aria-label="Approve property"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                              Approve property
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <button
                              onClick={() => handleReject(property.id)}
                              disabled={isProcessingThis}
                              className={cn(
                                "text-red-600 hover:text-red-900",
                                isProcessingThis && "opacity-50 cursor-not-allowed"
                              )}
                              aria-label="Reject property"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                              Reject property
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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