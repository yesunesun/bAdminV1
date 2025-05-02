// src/modules/owner/services/propertyService.ts
// Version: 5.1.0
// Last Modified: 02-05-2025 18:15 IST
// Purpose: Fixed database schema mismatch when saving properties

import { supabase } from '@/lib/supabase';
import { Property, FormData, FormDataV1, FormDataV2 } from '../components/property/PropertyFormTypes';
import { 
  detectDataVersion, 
  DATA_VERSION_V1, 
  DATA_VERSION_V2, 
  CURRENT_DATA_VERSION,
  convertV1ToV2,
  convertV2ToV1 
} from '../components/property/wizard/utils/propertyDataAdapter';

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
        
        // Detect data version to handle backward compatibility
        const dataVersion = detectDataVersion(property.property_details);
        console.log(`Property ${property.id} has data version: ${dataVersion}`);
        
        // Add version information if missing
        if (dataVersion === 'legacy') {
          console.log(`Adding version information to legacy property ${property.id}`);
          property.property_details._version = DATA_VERSION_V1;
        }
        
        // If needed, normalize data structure to the current version
        let normalizedDetails = property.property_details;
        
        if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
          console.log(`Converting property ${property.id} from V1 to V2`);
          normalizedDetails = convertV1ToV2(property.property_details);
        } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
          console.log(`Converting property ${property.id} from V2 to V1`);
          normalizedDetails = convertV2ToV1(property.property_details);
        }
        
        return {
          ...property,
          property_details: normalizedDetails,
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
      
      // Detect data version to handle backward compatibility
      const dataVersion = detectDataVersion(data.property_details);
      console.log(`Property ${data.id} has data version: ${dataVersion}`);
      
      // Add version information if missing
      if (dataVersion === 'legacy') {
        console.log(`Adding version information to legacy property ${data.id}`);
        data.property_details._version = DATA_VERSION_V1;
      }
      
      // Normalize data structure to the current version if needed
      let normalizedDetails = data.property_details;
      
      if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        console.log(`Converting property ${data.id} from V1 to V2`);
        normalizedDetails = convertV1ToV2(data.property_details);
      } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
        console.log(`Converting property ${data.id} from V2 to V1`);
        normalizedDetails = convertV2ToV1(data.property_details);
      }
      
      console.log('=========== DEBUG: LOADING PROPERTY END ===========');
      return {
        ...data,
        property_details: normalizedDetails,
        images
      };
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },

  // Create a new property - Always use current version
  async createProperty(propertyData: FormData, userId: string, status: 'draft' | 'published' = 'draft'): Promise<Property> {
    try {
      console.log('=========== DEBUG: CREATE PROPERTY START ===========');
      console.log('Creating property with status:', status);
      
      // Detect data version
      const dataVersion = detectDataVersion(propertyData);
      console.log(`Form data version: ${dataVersion}`);
      
      // Convert to current version if needed
      let processedData = propertyData;
      
      if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        console.log('Converting form data from V1 to V2');
        processedData = convertV1ToV2(propertyData as FormDataV1);
      } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
        console.log('Converting form data from V2 to V1');
        processedData = convertV2ToV1(propertyData as FormDataV2);
      }
      
      // Ensure version information is set
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        (processedData as FormDataV2)._version = CURRENT_DATA_VERSION;
      } else {
        (processedData as FormDataV1)._version = CURRENT_DATA_VERSION;
      }
      
      // Determine price based on data version and property type
      let price = 0;
      
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        const v2Data = processedData as FormDataV2;
        if (v2Data.flow?.listingType === 'sale' && v2Data.sale) {
          price = v2Data.sale.expectedPrice || 0;
        } else if (v2Data.rental) {
          price = v2Data.rental.rentAmount || 0;
        }
      } else {
        const v1Data = processedData as FormDataV1;
        const isSaleProperty = v1Data.isSaleProperty || 
                              v1Data.listingType?.toLowerCase() === 'sale' || 
                              v1Data.propertyPriceType === 'sale';
        
        price = isSaleProperty 
          ? parseFloat(v1Data.expectedPrice || '0') 
          : parseFloat(v1Data.rentAmount || '0');
      }
      
      // Create the database record - removing location as it's not in the schema
      const dbPropertyData = {
        owner_id: userId,
        title: CURRENT_DATA_VERSION === DATA_VERSION_V2 
          ? (processedData as FormDataV2).basicDetails?.title || 'New Property'
          : (processedData as FormDataV1).title || 'New Property',
        description: CURRENT_DATA_VERSION === DATA_VERSION_V2 
          ? (processedData as FormDataV2).features?.description || ''
          : (processedData as FormDataV1).description || '',
        price: price,
        bedrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? ((processedData as FormDataV2).basicDetails?.bhkType 
             ? parseInt((processedData as FormDataV2).basicDetails.bhkType.split(' ')[0]) 
             : 0)
          : ((processedData as FormDataV1).bhkType 
             ? parseInt((processedData as FormDataV1).bhkType.split(' ')[0]) 
             : 0),
        bathrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails?.bathrooms || 0
          : ((processedData as FormDataV1).bathrooms 
             ? parseInt((processedData as FormDataV1).bathrooms) 
             : 0),
        square_feet: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails?.builtUpArea || 0
          : ((processedData as FormDataV1).builtUpArea 
             ? parseFloat((processedData as FormDataV1).builtUpArea) 
             : 0),
        address: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.address || ''
          : (processedData as FormDataV1).address || '',
        city: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.city || ''
          : (processedData as FormDataV1).city || (processedData as FormDataV1).locality || '',
        state: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.state || 'Telangana'
          : (processedData as FormDataV1).state || 'Telangana',
        zip_code: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.pinCode || ''
          : (processedData as FormDataV1).pinCode || '',
        status,
        property_details: processedData,
        tags: status === 'published' ? ['public'] : []
      };

      console.log('Property database payload:', dbPropertyData);
      
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPropertyData])
        .select();

      if (error) {
        console.error("Database error creating property:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after property creation");
      }
      
      console.log('Property created successfully, returned data:', data[0]);
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log('=========== DEBUG: CREATE PROPERTY END ===========');
      return {
        ...data[0],
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
      
      // Detect data version
      const dataVersion = detectDataVersion(propertyData);
      console.log(`Form data version: ${dataVersion}`);
      
      // Convert to current version if needed
      let processedData = propertyData;
      
      if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        console.log('Converting form data from V1 to V2');
        processedData = convertV1ToV2(propertyData as FormDataV1);
      } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
        console.log('Converting form data from V2 to V1');
        processedData = convertV2ToV1(propertyData as FormDataV2);
      }
      
      // Ensure version information is set
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        (processedData as FormDataV2)._version = CURRENT_DATA_VERSION;
      } else {
        (processedData as FormDataV1)._version = CURRENT_DATA_VERSION;
      }
      
      // Determine price based on data version and property type
      let price = 0;
      
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        const v2Data = processedData as FormDataV2;
        if (v2Data.flow?.listingType === 'sale' && v2Data.sale) {
          price = v2Data.sale.expectedPrice || 0;
        } else if (v2Data.rental) {
          price = v2Data.rental.rentAmount || 0;
        }
      } else {
        const v1Data = processedData as FormDataV1;
        const isSaleProperty = v1Data.isSaleProperty || 
                              v1Data.listingType?.toLowerCase() === 'sale' || 
                              v1Data.propertyPriceType === 'sale';
        
        price = isSaleProperty 
          ? parseFloat(v1Data.expectedPrice || '0') 
          : parseFloat(v1Data.rentAmount || '0');
      }
      
      // Create the update object - removing location as it's not in the schema
      const updateData: any = {
        title: CURRENT_DATA_VERSION === DATA_VERSION_V2 
          ? (processedData as FormDataV2).basicDetails?.title || 'Updated Property'
          : (processedData as FormDataV1).title || 'Updated Property',
        description: CURRENT_DATA_VERSION === DATA_VERSION_V2 
          ? (processedData as FormDataV2).features?.description || ''
          : (processedData as FormDataV1).description || '',
        price: price,
        bedrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? ((processedData as FormDataV2).basicDetails?.bhkType 
             ? parseInt((processedData as FormDataV2).basicDetails.bhkType.split(' ')[0]) 
             : 0)
          : ((processedData as FormDataV1).bhkType 
             ? parseInt((processedData as FormDataV1).bhkType.split(' ')[0]) 
             : 0),
        bathrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails?.bathrooms || 0
          : ((processedData as FormDataV1).bathrooms 
             ? parseInt((processedData as FormDataV1).bathrooms) 
             : 0),
        square_feet: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails?.builtUpArea || 0
          : ((processedData as FormDataV1).builtUpArea 
             ? parseFloat((processedData as FormDataV1).builtUpArea) 
             : 0),
        address: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.address || ''
          : (processedData as FormDataV1).address || '',
        city: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.city || ''
          : (processedData as FormDataV1).city || (processedData as FormDataV1).locality || '',
        state: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.state || 'Telangana'
          : (processedData as FormDataV1).state || 'Telangana',
        zip_code: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location?.pinCode || ''
          : (processedData as FormDataV1).pinCode || '',
        property_details: processedData,
        updated_at: new Date().toISOString()
      };

      // Only update status if provided
      if (status) {
        updateData.status = status;
        updateData.tags = status === 'published' ? ['public'] : [];
      }
      
      console.log('Property update payload:', updateData);

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

      if (error) {
        console.error("Database error updating property:", error);
        throw error;
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

  // The rest of the functions remain the same
  async updatePropertyStatus(
    propertyId: string,
    status: 'draft' | 'published',
    userId: string
  ): Promise<void> {
    try {
      console.log(`Updating property ${propertyId} status to ${status}`);
      
      // Get current property data to ensure version info exists
      const { data: currentProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', propertyId)
        .single();
        
      if (!fetchError && currentProperty) {
        // Detect data version
        const dataVersion = detectDataVersion(currentProperty.property_details);
        
        // If data is not in current version, convert it
        let processedData = currentProperty.property_details;
        
        if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
          console.log('Converting property data from V1 to V2');
          processedData = convertV1ToV2(currentProperty.property_details as FormDataV1);
        } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
          console.log('Converting property data from V2 to V1');
          processedData = convertV2ToV1(currentProperty.property_details as FormDataV2);
        }
        
        // Add version info
        if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
          (processedData as FormDataV2)._version = CURRENT_DATA_VERSION;
        } else {
          (processedData as FormDataV1)._version = CURRENT_DATA_VERSION;
        }
        
        // Update property with version info and status
        const updateData = {
          status,
          tags: status === 'published' ? ['public'] : [],
          property_details: processedData
        };
        
        const { error } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .eq('owner_id', userId);
        
        if (error) throw error;
      } else {
        // Fallback if can't get current property
        const updateData = {
          status,
          tags: status === 'published' ? ['public'] : []
        };
        
        const { error } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .eq('owner_id', userId);
        
        if (error) throw error;
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
    } catch (error) {
      console.error('Error in updatePropertyStatus:', error);
      throw error;
    }
  },

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
        .eq('owner_id', userId); // Security check - owner can only delete their own properties
      
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
  },

  async adminDeleteProperty(propertyId: string): Promise<void> {
    try {
      console.log('=========== DEBUG: ADMIN DELETE PROPERTY START ===========');
      console.log(`Admin deleting property ${propertyId}`);
      
      // First, delete all property images (this handles the foreign key constraint)
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);
      
      if (imagesError) {
        console.error('Error deleting property images:', imagesError);
        throw imagesError;
      }
      
      // Then delete the property without the owner_id check
      // The database policy will ensure only admins can do this
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        console.error('Error in admin property deletion:', error);
        throw error;
      }
      
      // Clear all user caches since we don't know which user owned this property
      propertiesCache.clear();
      
      console.log(`Property ${propertyId} successfully deleted by admin`);
      console.log('=========== DEBUG: ADMIN DELETE PROPERTY END ===========');
    } catch (error) {
      console.error('Error in adminDeleteProperty:', error);
      throw error;
    }
  },

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role_id, admin_roles(role_type)')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) return false;
      
      // Check if user has admin role
      const roleType = data.admin_roles?.role_type;
      return roleType === 'admin' || 
             roleType === 'super_admin' || 
             roleType === 'property_moderator';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};