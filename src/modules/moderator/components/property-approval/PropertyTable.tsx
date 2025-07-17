// src/modules/moderator/components/property-approval/PropertyTable.tsx
// Version: 2.3.0
// Last Modified: 17-07-2025 12:00 IST
// Purpose: Display properties in a table with correct title, location, price, and transaction type

import React from 'react';
import { PropertyType as Property } from '@/modules/owner/components/property/PropertyFormTypes';
import { cn } from '@/lib/utils';

// Helper function to generate a fallback title based on property details
const generateFallbackTitle = (property: Property): string => {
  try {
    const flow = property.property_details?.flow;
    const steps = property.property_details?.steps;
    
    if (!flow || !steps) return 'Property Listing';
    
    const { category, listingType } = flow;
    let stepId = '';
    
    if (category === 'residential') {
      stepId = `res_${listingType}_basic_details`;
    } else if (category === 'commercial') {
      stepId = `com_${listingType}_basic_details`;
    } else if (category === 'land') {
      stepId = 'land_sale_basic_details';
    }
    
    const stepData = steps[stepId] || {};
    const bhkType = stepData.bhkType || '';
    const propertyType = stepData.propertyType || '';
    
    // Get location data
    let locationStepId = '';
    if (category === 'residential') {
      locationStepId = `res_${listingType}_location`;
    } else if (category === 'commercial') {
      locationStepId = `com_${listingType}_location`;
    } else if (category === 'land') {
      locationStepId = 'land_sale_location';
    }
    
    const locationData = steps[locationStepId] || {};
    const locality = locationData.locality || locationData.zone || '';
    
    // Build descriptive title
    let title = '';
    
    if (bhkType && propertyType) {
      title = `${bhkType} ${propertyType}`;
    } else if (propertyType) {
      title = propertyType;
    } else if (category === 'land') {
      title = 'Land';
    } else {
      title = 'Property';
    }
    
    if (locality) {
      title += ` in ${locality}`;
    }
    
    // Add listing type context
    if (listingType === 'rent') {
      title += ' for Rent';
    } else if (listingType === 'sale') {
      title += ' for Sale';
    } else if (listingType === 'pghostel') {
      title += ' PG/Hostel';
    } else if (listingType === 'flatmates') {
      title += ' Flatmates';
    } else if (listingType === 'coworking') {
      title += ' Coworking';
    }
    
    return title || 'Property Listing';
  } catch (error) {
    console.error('Error generating fallback title:', error);
    return 'Property Listing';
  }
};

// Helper function to get property title
const getPropertyTitle = (property: Property): string => {
  // Try to get title from property_details meta
  if (property.property_details?.meta?.title) {
    return property.property_details.meta.title;
  }
  
  // Try to get from basic details in appropriate step
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) {
    return property.title || generateFallbackTitle(property);
  }
  
  const { category, listingType } = flow;
  let stepId = '';
  
  if (category === 'residential') {
    stepId = `res_${listingType}_basic_details`;
  } else if (category === 'commercial') {
    stepId = `com_${listingType}_basic_details`;
  } else if (category === 'land') {
    stepId = 'land_sale_basic_details';
  }
  
  const stepData = steps[stepId] || {};
  const title = stepData.title || stepData.propertyTitle || stepData.name;
  
  if (title && title.trim()) {
    return title;
  }
  
  // Generate a descriptive title based on property details
  return generateFallbackTitle(property);
};

// Helper function to get property price
const getPropertyPrice = (property: Property): { amount: number, type: string } => {
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) {
    return { amount: property.price || 0, type: 'Per Month' };
  }
  
  const { category, listingType } = flow;
  
  // Get appropriate step ID based on flow type
  let stepId = '';
  let priceField = '';
  let priceType = 'Per Month';
  
  if (category === 'residential') {
    if (listingType === 'rent') {
      stepId = 'res_rent_rental';
      priceField = 'rentAmount';
      priceType = 'Per Month';
    } else if (listingType === 'sale') {
      stepId = 'res_sale_sale_details';
      priceField = 'expectedPrice';
      priceType = 'Sale Price';
    } else if (listingType === 'pghostel') {
      stepId = 'res_pg_pg_details';
      priceField = 'rentAmount';
      priceType = 'Per Month';
    } else if (listingType === 'flatmates') {
      stepId = 'res_flat_flatmate_details';
      priceField = 'rentAmount';
      priceType = 'Per Month';
    }
  } else if (category === 'commercial') {
    if (listingType === 'rent') {
      stepId = 'com_rent_rental';
      priceField = 'rentAmount';
      priceType = 'Per Month';
    } else if (listingType === 'sale') {
      stepId = 'com_sale_sale_details';
      priceField = 'expectedPrice';
      priceType = 'Sale Price';
    } else if (listingType === 'coworking') {
      stepId = 'com_cow_coworking_details';
      priceField = 'deskPrice';
      priceType = 'Per Month';
    }
  } else if (category === 'land') {
    stepId = 'land_sale_basic_details';
    priceField = 'expectedPrice';
    priceType = 'Sale Price';
  }
  
  // Return price from the appropriate step
  const stepData = steps[stepId] || {};
  const price = stepData[priceField] || property.price || 0;
  return { amount: parseFloat(price) || 0, type: priceType };
};

// Helper function to get property location
const getPropertyLocation = (property: Property): { city: string, locality: string } => {
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) {
    return { 
      city: property.city || 'N/A', 
      locality: '' 
    };
  }
  
  const { category, listingType } = flow;
  let stepId = '';
  
  if (category === 'residential') {
    stepId = `res_${listingType}_location`;
  } else if (category === 'commercial') {
    stepId = `com_${listingType}_location`;
  } else if (category === 'land') {
    stepId = 'land_sale_location';
  }
  
  const stepData = steps[stepId] || {};
  const city = stepData.city || property.city || 'N/A';
  const locality = stepData.locality || stepData.area || '';
  
  return { city, locality };
};

// Helper function to get property type and subtype
const getPropertyType = (property: Property): { type: string, subtype: string } => {
  const flow = property.property_details?.flow;
  const steps = property.property_details?.steps;
  
  if (!flow || !steps) {
    return { type: 'N/A', subtype: '' };
  }
  
  const { category, listingType } = flow;
  let stepId = '';
  
  if (category === 'residential') {
    stepId = `res_${listingType}_basic_details`;
  } else if (category === 'commercial') {
    stepId = `com_${listingType}_basic_details`;
  } else if (category === 'land') {
    stepId = 'land_sale_basic_details';
  }
  
  const stepData = steps[stepId] || {};
  const propertyType = stepData.propertyType || 'N/A';
  const bhkType = stepData.bhkType || stepData.bhk || '';
  
  return { type: propertyType, subtype: bhkType };
};

// Helper function to get transaction type
const getTransactionType = (property: Property): string => {
  const flow = property.property_details?.flow;
  
  if (!flow) {
    return 'N/A';
  }
  
  const { listingType } = flow;
  
  switch (listingType) {
    case 'rent':
      return 'Rent';
    case 'sale':
      return 'Sale';
    case 'pghostel':
      return 'PG/Hostel';
    case 'flatmates':
      return 'Flatmates';
    case 'coworking':
      return 'Coworking';
    default:
      return 'N/A';
  }
};

interface PropertyTableProps {
  filteredProperties: Property[];
  ownersMap: Record<string, any>;
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
                Property & Location
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
                            alt={getPropertyTitle(property)} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback to noimage placeholder
                              e.currentTarget.src = '/images/noimage.png';
                              e.currentTarget.onerror = null; // Prevent infinite loop
                            }}
                          />
                        ) : (
                          <img 
                            src="/images/noimage.png" 
                            alt="No image available" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // If noimage.png also fails, show icon
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="h-full w-full flex items-center justify-center text-gray-400">
                                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline">
                          {getPropertyTitle(property)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const { type, subtype } = getPropertyType(property);
                            const transactionType = getTransactionType(property);
                            return `${type}${subtype ? ` • ${subtype}` : ''} • ${transactionType}`;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {(() => {
                            const { city, locality } = getPropertyLocation(property);
                            return `${city}${locality ? `, ${locality}` : ''}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        const { amount, type } = getPropertyPrice(property);
                        return amount > 0 ? `₹${amount.toLocaleString()}` : 'N/A';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getPropertyPrice(property).type}
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