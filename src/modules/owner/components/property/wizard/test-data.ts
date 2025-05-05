// src/modules/owner/components/property/wizard/test-data.ts
// Version: 2.0.0
// Last Modified: 05-05-2025 11:30 IST
// Purpose: Updated to use v3 data structure only

import { FormData } from './types';
import { DATA_VERSION_V3 } from './utils/propertyDataAdapter';

// Sample property data in v3 format for testing
export const samplePropertyData: FormData = {
  meta: {
    _version: DATA_VERSION_V3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'draft'
  },
  flow: {
    category: 'residential',
    listingType: 'rent'
  },
  details: {
    basicDetails: {
      title: "Spacious 2BHK Apartment",
      propertyType: "Apartment",
      bhkType: "2BHK",
      floor: 3,
      totalFloors: 5,
      builtUpArea: 1200,
      builtUpAreaUnit: "sqft",
      bathrooms: 2,
      balconies: 1,
      facing: "East",
      propertyAge: "5-10 years"
    },
    location: {
      address: "123 MG Road",
      flatPlotNo: "B-204",
      landmark: "Near Central Mall",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560038",
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    rentalInfo: {
      rentAmount: 30000,
      securityDeposit: 90000,
      maintenanceCharges: 2500,
      rentNegotiable: true,
      availableFrom: "2025-06-01",
      preferredTenants: [
        "Family",
        "Working Professionals"
      ],
      leaseDuration: "11 months",
      furnishingStatus: "Semi-Furnished"
    },
    features: {
      amenities: [
        "Lift",
        "Gym",
        "Swimming Pool"
      ],
      parking: "Covered",
      petFriendly: true,
      nonVegAllowed: true,
      waterSupply: "24x7",
      powerBackup: "Full",
      gatedSecurity: true,
      description: "Well-maintained apartment with good ventilation and natural light."
    },
    media: {
      photos: {
        images: [
          {
            id: "img_1",
            url: "https://example.com/image1.jpg",
            isPrimary: true,
            displayOrder: 1
          },
          {
            id: "img_2",
            url: "https://example.com/image2.jpg",
            isPrimary: false,
            displayOrder: 2
          }
        ]
      }
    }
  }
};

// Generate test data for sale property
export const sampleSalePropertyData: FormData = {
  meta: {
    _version: DATA_VERSION_V3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'draft'
  },
  flow: {
    category: 'residential',
    listingType: 'sale'
  },
  details: {
    basicDetails: {
      title: "Premium 3BHK Villa",
      propertyType: "Villa",
      bhkType: "3BHK",
      floor: 0,
      totalFloors: 2,
      builtUpArea: 2500,
      builtUpAreaUnit: "sqft",
      bathrooms: 3,
      balconies: 2,
      facing: "North",
      propertyAge: "1-5 years"
    },
    location: {
      address: "456 Lake View Road",
      flatPlotNo: "Villa 15",
      landmark: "Near International Airport",
      locality: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560066",
      coordinates: {
        latitude: 12.9698,
        longitude: 77.7499
      }
    },
    saleInfo: {
      expectedPrice: 12000000,
      priceNegotiable: true,
      possessionDate: "2025-06-15"
    },
    features: {
      amenities: [
        "24x7 Security",
        "Clubhouse",
        "Swimming Pool",
        "Gym",
        "Power Backup",
        "Garden"
      ],
      parking: "Reserved",
      petFriendly: true,
      nonVegAllowed: true,
      waterSupply: "24x7",
      powerBackup: "Full",
      gatedSecurity: true,
      description: "Luxurious villa with premium amenities in a gated community."
    },
    media: {
      photos: {
        images: [
          {
            id: "sale_img_1",
            url: "https://example.com/sale_image1.jpg",
            isPrimary: true,
            displayOrder: 1
          },
          {
            id: "sale_img_2",
            url: "https://example.com/sale_image2.jpg",
            isPrimary: false,
            displayOrder: 2
          }
        ]
      }
    }
  }
};

// Function to generate a test property based on type and listing
export const generateTestProperty = (
  category: 'residential' | 'commercial' | 'land' = 'residential',
  listingType: 'rent' | 'sale' = 'rent'
): FormData => {
  // Start with a base template
  const baseTemplate = listingType === 'sale' ? sampleSalePropertyData : samplePropertyData;
  
  // Create a deep copy to avoid modifying the original
  const property = JSON.parse(JSON.stringify(baseTemplate));
  
  // Update the flow information
  property.flow.category = category;
  property.flow.listingType = listingType;
  
  // For commercial properties
  if (category === 'commercial') {
    property.details.basicDetails.propertyType = "Office Space";
    property.details.basicDetails.bhkType = "";
    
    // Update property title based on listing type
    property.details.basicDetails.title = listingType === 'sale' 
      ? "Premium Commercial Office Space For Sale" 
      : "Office Space Available For Lease";
    
    // Add commercial-specific features
    property.details.features.amenities.push("24x7 Access");
    property.details.features.amenities.push("Reception Area");
    property.details.features.amenities.push("Conference Room");
  }
  
  // For land properties
  if (category === 'land') {
    // Land is typically only for sale
    property.flow.listingType = 'sale';
    
    // Update basic details for land
    property.details.basicDetails.propertyType = "Plot";
    property.details.basicDetails.bhkType = "";
    property.details.basicDetails.floor = null;
    property.details.basicDetails.totalFloors = null;
    property.details.basicDetails.bathrooms = null;
    property.details.basicDetails.balconies = null;
    property.details.basicDetails.title = "Prime Land Plot For Sale";
    
    // Remove rental info if it exists
    if (property.details.rentalInfo) {
      delete property.details.rentalInfo;
    }
    
    // Ensure sale info exists
    if (!property.details.saleInfo) {
      property.details.saleInfo = {
        expectedPrice: 5000000,
        priceNegotiable: true,
        possessionDate: "2025-07-01"
      };
    }
    
    // Update land-specific features
    property.details.features.amenities = [
      "Corner Plot",
      "Road Facing",
      "Clear Title",
      "RERA Approved"
    ];
  }
  
  return property;
};

// Export sample data for various types
export const testRentalProperty = generateTestProperty('residential', 'rent');
export const testSaleProperty = generateTestProperty('residential', 'sale');
export const testCommercialRental = generateTestProperty('commercial', 'rent');
export const testCommercialSale = generateTestProperty('commercial', 'sale');
export const testLandSale = generateTestProperty('land', 'sale');

// Add specialized property types
export const testPGHostelProperty: FormData = {
  ...JSON.parse(JSON.stringify(samplePropertyData)),
  flow: {
    category: 'residential',
    listingType: 'pghostel'
  },
  details: {
    ...JSON.parse(JSON.stringify(samplePropertyData.details)),
    basicDetails: {
      ...JSON.parse(JSON.stringify(samplePropertyData.details.basicDetails)),
      title: "PG Accommodation for Working Professionals",
      propertyType: "PG/Hostel",
      bhkType: ""
    },
    rentalInfo: {
      rentAmount: 12000,
      securityDeposit: 24000,
      maintenanceCharges: 1000,
      rentNegotiable: true,
      availableFrom: "2025-05-15",
      preferredTenants: ["Working Professionals", "Students"],
      leaseDuration: "6 months",
      furnishingStatus: "Fully Furnished"
    }
  }
};

export const testFlatmateProperty: FormData = {
  ...JSON.parse(JSON.stringify(samplePropertyData)),
  flow: {
    category: 'residential',
    listingType: 'flatmates'
  },
  details: {
    ...JSON.parse(JSON.stringify(samplePropertyData.details)),
    basicDetails: {
      ...JSON.parse(JSON.stringify(samplePropertyData.details.basicDetails)),
      title: "Room Available in 3BHK for Flatmates",
      propertyType: "Apartment",
      bhkType: "3BHK"
    },
    rentalInfo: {
      rentAmount: 15000,
      securityDeposit: 30000,
      maintenanceCharges: 1500,
      rentNegotiable: true,
      availableFrom: "2025-05-10",
      preferredTenants: ["Working Professionals", "Students"],
      leaseDuration: "11 months",
      furnishingStatus: "Fully Furnished"
    }
  }
};

// Helper function to convert form data to database format
export const convertToDbFormat = (formData: FormData): any => {
  return {
    id: formData.meta.id || `test-${Math.random().toString(36).substring(2, 9)}`,
    owner_id: formData.meta.owner_id || `user-${Math.random().toString(36).substring(2, 9)}`,
    title: formData.details.basicDetails.title,
    price: formData.flow.listingType === 'rent' 
      ? formData.details.rentalInfo?.rentAmount || 0 
      : formData.details.saleInfo?.expectedPrice || 0,
    address: formData.details.location.address,
    city: formData.details.location.city,
    state: formData.details.location.state,
    zip_code: formData.details.location.pinCode,
    bedrooms: formData.details.basicDetails.bhkType?.includes('BHK') 
      ? parseInt(formData.details.basicDetails.bhkType) 
      : null,
    bathrooms: formData.details.basicDetails.bathrooms,
    square_feet: formData.details.basicDetails.builtUpArea,
    status: formData.meta.status,
    tags: formData.details.features.amenities.slice(0, 5),
    created_at: formData.meta.created_at,
    updated_at: formData.meta.updated_at,
    property_details: formData
  };
};