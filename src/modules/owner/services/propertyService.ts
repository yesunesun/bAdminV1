// src/modules/owner/services/propertyService.ts
// Version: 4.7.0
// Last Modified: 07-03-2025 15:30 IST
// Purpose: Added deleteProperty function to fix property deletion functionality

import { supabase } from '@/lib/supabase';
import { Property, FormData } from '../components/property/PropertyFormTypes';

// Cache for properties to avoid redundant fetches
const propertiesCache = new Map<string, {data: Property[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

export const propertyService = {
  // Fetch a user's properties with caching
  async getUserProperties(userId: string, forceRefresh = false): Promise<Property[]> {
    // Check cache first if not forcing refresh
    const now = Date.now();
    const cachedData = propertiesCache.get(userId);
    
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('Returning cached properties for user:', userId);
      return cachedData.data;
    }
    
    try {
      console.log('Fetching properties for user:', userId);
      
      // Fetch properties and images in a single query using inner join
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Found properties:', data?.length || 0);
      
      // Format the properties data
      const formattedProperties = (data || []).map(property => {
        // Process images
        const images = property.property_images
          ? property.property_images.map((img: any) => ({
              id: img.id,
              url: img.url,
              type: img.is_primary ? 'primary' : 'additional',
            }))
          : [];
        
        // Ensure property_details exists
        if (!property.property_details) {
          property.property_details = {};
        }
        
        // Ensure required fields exist in property_details
        if (!property.property_details.flatPlotNo) {
          property.property_details.flatPlotNo = '';
        }
        
        // Check if this is a sale property and ensure sale fields exist
        const isSaleProperty = 
          property.property_details.listingType?.toLowerCase() === 'sale' || 
          property.property_details.listingType?.toLowerCase() === 'sell' ||
          property.property_details.isSaleProperty === true;
        
        if (isSaleProperty) {
          property.property_details.expectedPrice = property.property_details.expectedPrice || property.price?.toString() || '';
          property.property_details.maintenanceCost = property.property_details.maintenanceCost || '';
          property.property_details.kitchenType = property.property_details.kitchenType || '';
          property.property_details.priceNegotiable = property.property_details.priceNegotiable || false;
          
          // Explicitly mark as sale property
          property.property_details.isSaleProperty = true;
          property.property_details.propertyPriceType = 'sale';
        } else {
          // For rental properties, ensure rental fields exist
          property.property_details.rentalType = property.property_details.rentalType || 'rent';
          property.property_details.rentAmount = property.property_details.rentAmount || property.price?.toString() || '';
          property.property_details.securityDeposit = property.property_details.securityDeposit || '';
          property.property_details.rentNegotiable = property.property_details.rentNegotiable || false;
          
          // Explicitly mark as rental property
          property.property_details.isSaleProperty = false;
          property.property_details.propertyPriceType = 'rental';
        }
        
        return {
          ...property,
          images
        };
      });
      
      // Update cache
      propertiesCache.set(userId, {
        data: formattedProperties,
        timestamp: now
      });
      
      return formattedProperties;
    } catch (error) {
      console.error('Error in getUserProperties:', error);
      throw error;
    }
  },

  // Fetch a single property by ID
  async getPropertyById(id: string): Promise<Property> {
    try {
      console.log('=========== DEBUG: LOADING PROPERTY ===========');
      console.log('Fetching property with ID:', id);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error fetching property:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No property found with ID:', id);
        throw new Error('Property not found');
      }
      
      console.log('Property data found:', {
        id: data.id,
        title: data.title,
        status: data.status,
        price: data.price,
        imageCount: data.property_images?.length || 0
      });

      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            type: img.is_primary ? 'primary' : 'additional',
          }))
        : [];
      
      // Make sure property_details exists
      if (!data.property_details) {
        console.warn('Property has no property_details, creating empty object');
        data.property_details = {};
      }
      
      // Check if this is a sale property and ensure all required fields exist
      const isSaleProperty = 
        data.property_details.listingType?.toLowerCase() === 'sale' || 
        data.property_details.listingType?.toLowerCase() === 'sell' ||
        data.property_details.isSaleProperty === true ||
        data.property_details.propertyPriceType === 'sale';
      
      console.log('Property is sale type:', isSaleProperty);
      console.log('Sale fields before processing:', {
        expectedPrice: data.property_details.expectedPrice,
        maintenanceCost: data.property_details.maintenanceCost,
        kitchenType: data.property_details.kitchenType,
        isSaleProperty: data.property_details.isSaleProperty,
        propertyPriceType: data.property_details.propertyPriceType
      });
      
      // IMPORTANT: Explicitly check and set required fields
      if (!data.property_details.flatPlotNo) {
        console.log('Property has no flatPlotNo field, initializing with empty string');
        data.property_details.flatPlotNo = '';
      }
      
      if (isSaleProperty) {
        // For sale properties, ensure sale fields exist with price fallback
        console.log('Setting up sale property fields');
        
        // If expectedPrice is missing but price exists, use price
        if (!data.property_details.expectedPrice && data.price) {
          console.log('Setting expectedPrice from price:', data.price);
          data.property_details.expectedPrice = data.price.toString();
        } else if (!data.property_details.expectedPrice) {
          console.log('No expectedPrice or price found, setting to empty string');
          data.property_details.expectedPrice = '';
        }
        
        // Set other fields with defaults if missing
        data.property_details.maintenanceCost = data.property_details.maintenanceCost || '';
        data.property_details.kitchenType = data.property_details.kitchenType || '';
        data.property_details.priceNegotiable = data.property_details.priceNegotiable || false;
        
        // Explicitly mark as sale property
        data.property_details.isSaleProperty = true;
        data.property_details.propertyPriceType = 'sale';
        
        console.log('Sale property fields set:', {
          expectedPrice: data.property_details.expectedPrice,
          maintenanceCost: data.property_details.maintenanceCost,
          kitchenType: data.property_details.kitchenType,
          priceNegotiable: data.property_details.priceNegotiable
        });
      } else {
        // For rental properties, ensure rental fields exist
        console.log('Setting up rental property fields');
        data.property_details.rentalType = data.property_details.rentalType || 'rent';
        
        // If rentAmount is missing but price exists, use price
        if (!data.property_details.rentAmount && data.price) {
          console.log('Setting rentAmount from price:', data.price);
          data.property_details.rentAmount = data.price.toString();
        } else if (!data.property_details.rentAmount) {
          console.log('No rentAmount or price found, setting to empty string');
          data.property_details.rentAmount = '';
        }
        
        data.property_details.securityDeposit = data.property_details.securityDeposit || '';
        data.property_details.rentNegotiable = data.property_details.rentNegotiable || false;
        
        // Explicitly mark as rental property
        data.property_details.isSaleProperty = false;
        data.property_details.propertyPriceType = 'rental';
      }
      
      // Log property details for debugging
      console.log('Final property details after processing:', {
        listingType: data.property_details.listingType,
        isSaleProperty: data.property_details.isSaleProperty,
        propertyPriceType: data.property_details.propertyPriceType,
        expectedPrice: data.property_details.expectedPrice,
        maintenanceCost: data.property_details.maintenanceCost,
        kitchenType: data.property_details.kitchenType
      });
      
      // Ensure required properties exist
      if (!data.property_details.propertyType) {
        // Try to derive from title if available
        if (data.title && data.title.includes(' in ')) {
          const parts = data.title.split(' in ');
          if (parts[0].includes(' ')) {
            data.property_details.propertyType = parts[0].split(' ').slice(1).join(' ');
          }
        }
      }
      
      // Set defaults for any missing fields that are required
      data.property_details.listingType = data.property_details.listingType || (isSaleProperty ? 'sale' : 'rent');
      
      console.log('=========== DEBUG: LOADING PROPERTY END ===========');
      return {
        ...data,
        images
      };
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },

  // Create a new property
  async createProperty(propertyData: FormData, userId: string, status: 'draft' | 'published' = 'draft'): Promise<Property> {
    try {
      console.log('=========== DEBUG: CREATE PROPERTY START ===========');
      console.log('Creating property with status:', status);
      
      // Ensure flatPlotNo field is included in the property details
      console.log('flatPlotNo value:', propertyData.flatPlotNo);
      
      // Determine if this is a sale property
      const isSaleProperty = 
        propertyData.listingType?.toLowerCase() === 'sale' || 
        propertyData.listingType?.toLowerCase() === 'sell';
      
      console.log('Creating property as sale type:', isSaleProperty);
      console.log('Sale-specific fields:', {
        expectedPrice: propertyData.expectedPrice,
        maintenanceCost: propertyData.maintenanceCost,
        kitchenType: propertyData.kitchenType
      });
      
      // Create a safe version of property data with required fields guaranteed
      const safePropertyData = {
        ...propertyData,
        flatPlotNo: propertyData.flatPlotNo || '',
        // Explicitly mark as sale or rental property
        isSaleProperty: isSaleProperty,
        propertyPriceType: isSaleProperty ? 'sale' : 'rental',
        // Ensure sale-specific fields exist
        expectedPrice: isSaleProperty ? (propertyData.expectedPrice || '') : '',
        maintenanceCost: isSaleProperty ? (propertyData.maintenanceCost || '') : '',
        kitchenType: isSaleProperty ? (propertyData.kitchenType || '') : ''
      };
      
      // Determine price field based on property type
      const price = isSaleProperty
        ? parseFloat(safePropertyData.expectedPrice) || 0
        : parseFloat(safePropertyData.rentAmount) || 0;
      
      console.log('Using price value:', price, 'from', isSaleProperty ? 'expectedPrice' : 'rentAmount');
      
      const dbPropertyData = {
        owner_id: userId,
        title: safePropertyData.title || `${safePropertyData.bhkType} ${safePropertyData.propertyType} in ${safePropertyData.locality}`,
        description: safePropertyData.description || '',
        price: price,
        bedrooms: safePropertyData.bhkType ? parseInt(safePropertyData.bhkType.split(' ')[0]) : 0,
        bathrooms: safePropertyData.bathrooms ? parseInt(safePropertyData.bathrooms) : 0,
        square_feet: safePropertyData.builtUpArea ? parseFloat(safePropertyData.builtUpArea) : null,
        address: safePropertyData.address || '',
        city: safePropertyData.locality,
        state: 'Telangana',
        zip_code: safePropertyData.pinCode || '',
        status,
        // IMPORTANT: Make sure sale-specific fields are included at top level
        property_details: {
          ...safePropertyData,
          expectedPrice: safePropertyData.expectedPrice,
          maintenanceCost: safePropertyData.maintenanceCost,
          kitchenType: safePropertyData.kitchenType
        },
        tags: status === 'published' ? ['public'] : []
      };
      
      console.log('Property details payload for DB:', JSON.stringify(dbPropertyData.property_details, null, 2));
      
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPropertyData])
        .select()
        .single();

      if (error) throw error;
      
      // Verify what was saved
      const { data: savedProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, price')
        .eq('id', data.id)
        .single();
        
      if (!fetchError) {
        console.log('Verify saved property:', {
          price: savedProperty.price,
          expectedPrice: savedProperty.property_details.expectedPrice,
          maintenanceCost: savedProperty.property_details.maintenanceCost,
          kitchenType: savedProperty.property_details.kitchenType
        });
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log('=========== DEBUG: CREATE PROPERTY END ===========');
      return {
        ...data,
        images: []
      };
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  },

  // Update an existing property
  async updateProperty(
    propertyId: string,
    propertyData: FormData,
    userId: string,
    status?: 'draft' | 'published'
  ): Promise<Property> {
    try {
      console.log('=========== DEBUG: UPDATE PROPERTY START ===========');
      console.log('Updating property:', propertyId);
      console.log('flatPlotNo value:', propertyData.flatPlotNo);
      
      // Determine if this is a sale property
      const isSaleProperty = 
        propertyData.listingType?.toLowerCase() === 'sale' || 
        propertyData.listingType?.toLowerCase() === 'sell';
      
      console.log('Updating property as sale type:', isSaleProperty);
      console.log('Sale property fields:', {
        expectedPrice: propertyData.expectedPrice,
        maintenanceCost: propertyData.maintenanceCost,
        kitchenType: propertyData.kitchenType
      });
      
      // Create a safe version of property data with required fields guaranteed
      const safePropertyData = {
        ...propertyData,
        flatPlotNo: propertyData.flatPlotNo || '',
        // Explicitly mark as sale or rental property
        isSaleProperty: isSaleProperty,
        propertyPriceType: isSaleProperty ? 'sale' : 'rental',
        // Explicitly include sale-specific fields
        expectedPrice: isSaleProperty ? (propertyData.expectedPrice || '') : '',
        maintenanceCost: isSaleProperty ? (propertyData.maintenanceCost || '') : '',
        kitchenType: isSaleProperty ? (propertyData.kitchenType || '') : '',
        priceNegotiable: isSaleProperty ? (propertyData.priceNegotiable || false) : false
      };
      
      // Determine price field based on property type
      const price = isSaleProperty
        ? parseFloat(safePropertyData.expectedPrice) || 0
        : parseFloat(safePropertyData.rentAmount) || 0;
      
      console.log('Using price value:', price, 'from', isSaleProperty ? 'expectedPrice' : 'rentAmount');
      
      const updateData: any = {
        title: safePropertyData.title || `${safePropertyData.bhkType} ${safePropertyData.propertyType} in ${safePropertyData.locality}`,
        description: safePropertyData.description || '',
        price: price,
        bedrooms: safePropertyData.bhkType ? parseInt(safePropertyData.bhkType.split(' ')[0]) : 0,
        bathrooms: safePropertyData.bathrooms ? parseInt(safePropertyData.bathrooms) : 0,
        square_feet: safePropertyData.builtUpArea ? parseFloat(safePropertyData.builtUpArea) : null,
        address: safePropertyData.address || '',
        city: safePropertyData.locality,
        state: 'Telangana',
        zip_code: safePropertyData.pinCode || '',
        // IMPORTANT: Make sure sale-specific fields are included at top level
        property_details: {
          ...safePropertyData,
          expectedPrice: safePropertyData.expectedPrice,
          maintenanceCost: safePropertyData.maintenanceCost,
          kitchenType: safePropertyData.kitchenType,
          priceNegotiable: safePropertyData.priceNegotiable
        },
      };

      // Only update status if provided
      if (status) {
        updateData.status = status;
        updateData.tags = status === 'published' ? ['public'] : [];
      }
      
      console.log('Property details payload for DB:', JSON.stringify(updateData.property_details, null, 2));

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .eq('owner_id', userId) // Security check
        .select(`
          *,
          property_images(*)
        `)
        .single();

      if (error) throw error;
      
      // Verify what was updated
      const { data: updatedProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, price')
        .eq('id', propertyId)
        .single();
        
      if (!fetchError) {
        console.log('Verify updated property:', {
          price: updatedProperty.price,
          expectedPrice: updatedProperty.property_details.expectedPrice,
          maintenanceCost: updatedProperty.property_details.maintenanceCost,
          kitchenType: updatedProperty.property_details.kitchenType
        });
      }
      
      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            type: img.is_primary ? 'primary' : 'additional',
          }))
        : [];
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log('=========== DEBUG: UPDATE PROPERTY END ===========');
      return {
        ...data,
        images
      };
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  },

  // Update property status
  async updatePropertyStatus(
    propertyId: string,
    status: 'draft' | 'published',
    userId: string
  ): Promise<void> {
    try {
      console.log(`Updating property ${propertyId} status to ${status}`);
      
      const updateData = {
        status,
        tags: status === 'published' ? ['public'] : []
      };
      
      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .eq('owner_id', userId); // Security check
      
      if (error) throw error;
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
    } catch (error) {
      console.error('Error in updatePropertyStatus:', error);
      throw error;
    }
  },

  // Delete a property
  async deleteProperty(propertyId: string, userId: string): Promise<void> {
    try {
      console.log('=========== DEBUG: DELETE PROPERTY START ===========');
      console.log(`Deleting property ${propertyId} for user ${userId}`);
      
      // First, delete all property images (this handles the foreign key constraint)
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);
      
      if (imagesError) {
        console.error('Error deleting property images:', imagesError);
        throw imagesError;
      }
      
      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', userId); // Security check
      
      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log(`Property ${propertyId} successfully deleted`);
      console.log('=========== DEBUG: DELETE PROPERTY END ===========');
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  }
};