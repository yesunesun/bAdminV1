// src/modules/moderator/components/PropertyDetailModal/components/PropertyInfo.tsx
// Version: 1.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Display property information in the detail modal

import React from 'react';
import { Property } from '@/components/property/PropertyFormTypes';

interface PropertyInfoProps {
  property: Property;
}

export function PropertyInfo({ property }: PropertyInfoProps) {
  // Helper functions to extract data from properties_v2 structure
  const extractPropertyType = () => {
    const details = property.property_details;
    return details?.steps?.res_rent_basic_details?.propertyType ||
           details?.steps?.res_sale_basic_details?.propertyType ||
           details?.steps?.com_rent_basic_details?.propertyType ||
           details?.steps?.land_sale_basic_details?.propertyType ||
           'N/A';
  };

  const extractPrice = () => {
    const details = property.property_details;
    const rentAmount = details?.steps?.res_rent_rental?.rentAmount ||
                      details?.steps?.com_rent_rental?.rentAmount;
    const salePrice = details?.steps?.res_sale_sale_details?.expectedPrice ||
                     details?.steps?.com_sale_sale_details?.expectedPrice ||
                     details?.steps?.land_sale_land_features?.expectedPrice;
    const price = rentAmount || salePrice || property.price;
    return price ? `₹${parseInt(price).toLocaleString()}` : 'N/A';
  };

  const extractBedrooms = () => {
    const details = property.property_details;
    const bhkType = details?.steps?.res_rent_basic_details?.bhkType ||
                   details?.steps?.res_sale_basic_details?.bhkType;
    if (bhkType && bhkType.match(/^(\d+)/)) {
      return bhkType.match(/^(\d+)/)[1];
    }
    return 'N/A';
  };

  const extractBathrooms = () => {
    const details = property.property_details;
    return details?.steps?.res_rent_features?.bathrooms ||
           details?.steps?.res_sale_features?.bathrooms ||
           details?.steps?.com_rent_features?.bathrooms ||
           'N/A';
  };

  const extractArea = () => {
    const details = property.property_details;
    const area = details?.steps?.res_rent_basic_details?.builtUpArea ||
                details?.steps?.res_sale_basic_details?.builtUpArea ||
                details?.steps?.com_rent_basic_details?.builtUpArea ||
                details?.steps?.land_sale_basic_details?.landArea;
    const unit = details?.steps?.res_rent_basic_details?.builtUpAreaUnit ||
                details?.steps?.res_sale_basic_details?.builtUpAreaUnit ||
                'sq.ft.';
    return area ? `${area} ${unit}` : 'N/A';
  };

  const extractAddress = () => {
    const details = property.property_details;
    return details?.address ||
           details?.steps?.res_rent_location?.address ||
           details?.steps?.res_sale_location?.address ||
           details?.steps?.com_rent_location?.address ||
           details?.steps?.land_sale_location?.address ||
           'N/A';
  };

  const extractCity = () => {
    const details = property.property_details;
    return details?.city ||
           details?.steps?.res_rent_location?.city ||
           details?.steps?.res_sale_location?.city ||
           details?.steps?.com_rent_location?.city ||
           details?.steps?.land_sale_location?.city ||
           property.city ||
           'N/A';
  };

  const extractState = () => {
    const details = property.property_details;
    return details?.state ||
           details?.steps?.res_rent_location?.state ||
           details?.steps?.res_sale_location?.state ||
           details?.steps?.com_rent_location?.state ||
           details?.steps?.land_sale_location?.state ||
           property.state ||
           'Telangana';
  };

  const extractZipCode = () => {
    const details = property.property_details;
    return details?.pinCode ||
           details?.steps?.res_rent_location?.pinCode ||
           details?.steps?.res_sale_location?.pinCode ||
           details?.steps?.com_rent_location?.pinCode ||
           details?.steps?.land_sale_location?.pinCode ||
           'N/A';
  };

  const extractFloorInfo = () => {
    const details = property.property_details;
    const floor = details?.steps?.res_rent_basic_details?.floor ||
                 details?.steps?.res_sale_basic_details?.floor ||
                 details?.steps?.com_rent_basic_details?.floor;
    const totalFloors = details?.steps?.res_rent_basic_details?.totalFloors ||
                       details?.steps?.res_sale_basic_details?.totalFloors ||
                       details?.steps?.com_rent_basic_details?.totalFloors;
    
    if (floor && totalFloors) {
      return `${floor} of ${totalFloors}`;
    } else if (floor) {
      return floor;
    }
    return 'N/A';
  };

  const extractFacing = () => {
    const details = property.property_details;
    return details?.steps?.res_rent_basic_details?.facing ||
           details?.steps?.res_sale_basic_details?.facing ||
           details?.steps?.com_rent_basic_details?.facing ||
           'N/A';
  };

  const extractFurnishing = () => {
    const details = property.property_details;
    return details?.steps?.res_rent_rental?.furnishingStatus ||
           details?.steps?.res_sale_sale_details?.furnishingStatus ||
           details?.steps?.com_rent_rental?.furnishingStatus ||
           'N/A';
  };

  const extractPropertyAge = () => {
    const details = property.property_details;
    return details?.steps?.res_rent_basic_details?.propertyAge ||
           details?.steps?.res_sale_basic_details?.propertyAge ||
           details?.steps?.com_rent_basic_details?.propertyAge ||
           'N/A';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-medium">{extractPropertyType()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">{extractPrice()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-medium">{extractBedrooms()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-medium">{extractBathrooms()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-medium">{extractArea()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floor</p>
              <p className="font-medium">{extractFloorInfo()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Facing</p>
              <p className="font-medium">{extractFacing()}</p>
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
              <p className="font-medium">{extractAddress()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{extractCity()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{extractState()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Zip Code</p>
              <p className="font-medium">{extractZipCode()}</p>
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
        <p className="text-gray-700">{property.description || property.property_details?.flow?.title || 'No description provided'}</p>
      </div>
      
      {/* Additional Details */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Additional Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Flow</p>
            <p className="font-medium">{property.property_details?.flow?.flowType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Meta</p>
            <p className="font-medium">{property.property_details?.meta?.code || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Media</p>
            <p className="font-medium">{property.property_details?.imageFiles?.length || 0} images</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Image Files</p>
            <p className="font-medium">{property.property_details?.imageFiles ? 'Available' : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Condition</p>
            <p className="font-medium">{property.property_details?.steps?.res_rent_basic_details?.propertyCondition || 
                                       property.property_details?.steps?.res_sale_basic_details?.propertyCondition || 
                                       'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Show Option</p>
            <p className="font-medium">{property.property_details?.steps?.res_rent_features?.propertyShowOption || 
                                       property.property_details?.steps?.res_sale_features?.propertyShowOption || 
                                       'Agent'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Age</p>
            <p className="font-medium">{extractPropertyAge()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Furnishing</p>
            <p className="font-medium">{extractFurnishing()}</p>
          </div>
        </div>
      </div>
    </>
  );
}