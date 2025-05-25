// src/modules/seeker/pages/AllProperties/components/PropertyCard.tsx
// Version: 6.0.0
// Last Modified: 25-05-2025 17:35 IST
// Purpose: Fixed Property Type/Listing Type display, delete functionality, and owner information

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { formatPrice } from '@/modules/seeker/services/seekerService';
import { 
  getPropertyFlow, 
  getFlowLabel, 
  getPropertyTypeFromFlow, 
  getListingTypeFromFlow 
} from '../utils/propertyUtils';
import { getPropertyVersion } from '../services/propertyVersionService';
import { generatePropertyTitle } from '@/modules/seeker/utils/propertyTitleUtils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Trash2, Pencil, ShieldAlert, Info, User, Mail } from 'lucide-react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyCardProps {
  property: PropertyType;
  onPropertyDeleted?: () => void;
  onPropertyUpdated?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onPropertyDeleted,
  onPropertyUpdated
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFixingTitle, setIsFixingTitle] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get property flow type and derived information
  const propertyFlow = getPropertyFlow(property);
  const flowLabel = getFlowLabel(propertyFlow);
  const propertyType = getPropertyTypeFromFlow(propertyFlow);
  const listingType = getListingTypeFromFlow(propertyFlow);
  
  // Get property version using our service
  const propertyVersion = getPropertyVersion(property.property_details);

  // Get display title from new data structure
  const displayTitle = property.property_details?.flow?.title || 'Untitled Property';

  // Get property details for display
  const propertyDetails = property.property_details || {};

  // Check if current user is an admin - with proper error handling
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select(`
            role_id,
            admin_roles!inner (
              role_type
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.warn('Admin status check failed (user likely not admin):', error.message);
          setIsAdmin(false);
          return;
        }
        
        if (data && data.admin_roles) {
          const roleType = data.admin_roles.role_type;
          const hasAdminRole = roleType === 'admin' || 
            roleType === 'super_admin' || 
            roleType === 'property_moderator';
          
          setIsAdmin(hasAdminRole);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.warn('Error checking admin status (user likely not admin):', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);

  // Function to fix property title using existing utility
  const handleFixTitle = async () => {
    console.log('=== FIX TITLE DEBUG START ===');
    console.log('Fix Title: Button clicked for property:', property.id);
    console.log('Fix Title: Property flow type:', propertyFlow);
    console.log('Fix Title: Property type:', propertyType);
    console.log('Fix Title: Listing type:', listingType);
    
    if (!property.id || !user?.id) {
      console.error('Fix Title: FAILED - Missing property ID or user ID');
      toast({
        title: "Error",
        description: "Unable to fix title: missing required information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsFixingTitle(true);
      
      // Log current title
      const currentTitle = property.property_details?.flow?.title || 'No current title';
      console.log('Fix Title: Current title:', currentTitle);
      
      // Log the property structure being passed to generatePropertyTitle
      console.log('Fix Title: Property structure being passed to generatePropertyTitle:');
      console.log('Fix Title: - property.id:', property.id);
      console.log('Fix Title: - property.property_details:', property.property_details);
      console.log('Fix Title: - property.property_details.flow:', property.property_details?.flow);
      console.log('Fix Title: - property.property_details.steps:', property.property_details?.steps ? Object.keys(property.property_details.steps) : 'no steps');
      
      // Generate the new title
      console.log('Fix Title: Calling generatePropertyTitle...');
      const newTitle = generatePropertyTitle(property);
      console.log('Fix Title: Generated new title:', newTitle);
      console.log('Fix Title: Generated title type:', typeof newTitle);
      console.log('Fix Title: Title changed?', currentTitle !== newTitle);
      
      if (!newTitle || newTitle.trim() === '') {
        console.error('Fix Title: FAILED - Generated title is empty');
        throw new Error('Generated title is empty');
      }
      
      if (currentTitle === newTitle) {
        console.warn('Fix Title: WARNING - New title is same as current title');
        toast({
          title: "Title already correct",
          description: `Current title: "${currentTitle}"`,
        });
        return;
      }
      
      // Prepare the update
      const currentPropertyDetails = property.property_details || {};
      const currentFlow = currentPropertyDetails.flow || {};
      
      const updatedPropertyDetails = {
        ...currentPropertyDetails,
        flow: {
          ...currentFlow,
          title: newTitle
        }
      };

      console.log('Fix Title: Updating database...');
      console.log('Fix Title: Old title in database:', currentFlow.title);
      console.log('Fix Title: New title for database:', newTitle);
      console.log('Fix Title: Property ID:', property.id);
      console.log('Fix Title: Updated property_details structure:', updatedPropertyDetails);
      
      // First, let's verify the property exists and check current user permissions
      console.log('Fix Title: Checking if property exists and user permissions...');
      const { data: existsData, error: existsError } = await supabase
        .from('properties_v2')
        .select('id, owner_id, property_details')
        .eq('id', property.id)
        .single();
      
      if (existsError) {
        console.error('Fix Title: Error checking property existence:', existsError);
        throw new Error(`Property check failed: ${existsError.message}`);
      }
      
      console.log('Fix Title: Property exists check - ID:', existsData?.id);
      console.log('Fix Title: Property owner_id:', existsData?.owner_id);
      console.log('Fix Title: Current user ID:', user.id);
      console.log('Fix Title: User is owner?', existsData?.owner_id === user.id);
      console.log('Fix Title: User is admin?', isAdmin);
      console.log('Fix Title: Current title in DB:', existsData?.property_details?.flow?.title);
      
      // Check if user has permission to update
      const userIsOwner = existsData?.owner_id === user.id;
      const userCanUpdate = userIsOwner || isAdmin;
      
      console.log('Fix Title: User can update?', userCanUpdate);
      
      if (!userCanUpdate) {
        throw new Error(`Permission denied. User is owner: ${userIsOwner}, User is admin: ${isAdmin}`);
      }
      
      // Now attempt the update - try database function first since RLS is causing issues
      console.log('Fix Title: Attempting database update using function...');
      
      try {
        const { data: functionResult, error: functionError } = await supabase.rpc('update_property_title', {
          property_id_param: property.id,
          new_title_param: newTitle
        });
        
        console.log('Fix Title: Function result:', functionResult);
        console.log('Fix Title: Function error:', functionError);
        
        if (functionError) {
          console.error('Fix Title: Database function failed:', functionError);
          throw new Error(`Database function failed: ${functionError.message}`);
        }
        
        if (functionResult?.success) {
          console.log('Fix Title: ✅ Database function succeeded!');
          
          toast({
            title: "Title updated successfully",
            description: `Old: "${currentFlow.title}" → New: "${newTitle}"`,
          });
          
          if (onPropertyUpdated) {
            onPropertyUpdated();
          }
          return; // Success - exit early
        } else {
          console.error('Fix Title: Database function returned failure:', functionResult);
          throw new Error(`Database function failed: ${functionResult?.error || 'Unknown error'}`);
        }
        
      } catch (functionError) {
        console.warn('Fix Title: Database function not available or failed, trying direct update:', functionError);
        
        // Fallback to direct update
        console.log('Fix Title: Attempting direct database update...');
        
        let updateResult;
        
        if (isAdmin) {
          console.log('Fix Title: User is admin - attempting admin update...');
          updateResult = await supabase
            .from('properties_v2')
            .update({ 
              property_details: updatedPropertyDetails,
              updated_at: new Date().toISOString()
            })
            .eq('id', property.id)
            .select();
        } else if (existsData?.owner_id === user.id) {
          console.log('Fix Title: User is owner - attempting owner update...');
          updateResult = await supabase
            .from('properties_v2')
            .update({ 
              property_details: updatedPropertyDetails,
              updated_at: new Date().toISOString()
            })
            .eq('id', property.id)
            .eq('owner_id', user.id)
            .select();
        } else {
          throw new Error('User has no permission to update this property');
        }
        
        const { error, data, status, statusText } = updateResult;
        
        console.log('Fix Title: Update response status:', status);
        console.log('Fix Title: Update response statusText:', statusText);
        console.log('Fix Title: Update response error:', error);
        console.log('Fix Title: Update response data:', data);
        
        if (error) {
          console.error('Fix Title: Database update error:', error);
          console.error('Fix Title: Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('Fix Title: Database update completed');
        console.log('Fix Title: Returned data from update:', data);
        console.log('Fix Title: Number of rows updated:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.error('Fix Title: No rows were updated! This suggests a permissions or RLS policy issue.');
          throw new Error('Database update failed - no rows were affected. This may be due to Row Level Security policies.');
        }
        
        // Verify the title was saved correctly
        if (data && data[0] && data[0].property_details?.flow?.title) {
          console.log('Fix Title: VERIFIED - Title saved correctly in database:', data[0].property_details.flow.title);
        } else {
          console.warn('Fix Title: WARNING - Could not verify title was saved correctly');
          console.log('Fix Title: Returned data structure:', data);
        }
      }
      
      // Additional verification - fetch the property again to double-check
      console.log('Fix Title: Double-checking by fetching property again...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', property.id)
        .single();
      
      if (verifyError) {
        console.error('Fix Title: Error during verification fetch:', verifyError);
      } else {
        console.log('Fix Title: VERIFICATION FETCH - Current title in database:', verifyData?.property_details?.flow?.title);
        if (verifyData?.property_details?.flow?.title === newTitle) {
          console.log('Fix Title: ✅ VERIFICATION PASSED - Title correctly saved');
        } else {
          console.error('Fix Title: ❌ VERIFICATION FAILED - Title not saved correctly');
          console.log('Fix Title: Expected:', newTitle);
          console.log('Fix Title: Actually in DB:', verifyData?.property_details?.flow?.title);
        }
      }
      
      toast({
        title: "Title updated successfully",
        description: `Old: "${currentTitle}" → New: "${newTitle}"`,
      });
      
      if (onPropertyUpdated) {
        onPropertyUpdated();
      }
      
    } catch (error) {
      console.error('=== FIX TITLE ERROR ===');
      console.error('Fix Title: ERROR:', error);
      toast({
        title: "Failed to update title",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsFixingTitle(false);
      console.log('=== FIX TITLE DEBUG END ===');
    }
  };
  
  // Function to delete property - Fixed implementation
  const deleteProperty = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete properties",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log('Attempting to delete property:', propertyId);
      
      // First check if the property exists and get owner info
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties_v2')
        .select('owner_id, property_details')
        .eq('id', propertyId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching property:', fetchError);
        throw new Error('Property not found or access denied');
      }
      
      // Check permissions: user must be property owner or admin
      const isOwner = propertyData.owner_id === user.id;
      
      if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to delete this property');
      }
      
      // Delete property images first (if any)
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);
      
      if (imagesError) {
        console.warn('Error deleting property images:', imagesError);
        // Don't fail the whole operation if image deletion fails
      }
      
      // Delete the property from properties_v2
      const { error: deleteError } = await supabase
        .from('properties_v2')
        .delete()
        .eq('id', propertyId);
      
      if (deleteError) {
        console.error('Error deleting property:', deleteError);
        throw deleteError;
      }
      
      toast({
        title: "Property deleted successfully",
        description: "The property has been removed from the database",
      });
      
      // Notify parent component to refresh the list
      if (onPropertyDeleted) {
        onPropertyDeleted();
      }
      
    } catch (err) {
      console.error('Error deleting property:', err);
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete property",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (property.id) {
      deleteProperty(property.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Extract basic property info from steps for display
  let bedrooms = '';
  let bathrooms = '';
  let area = '';
  let price = property.price || 0;

  // Extract data from steps based on flow type
  if (propertyDetails.steps) {
    for (const [stepId, stepData] of Object.entries(propertyDetails.steps)) {
      if (stepData && typeof stepData === 'object') {
        const data = stepData as any;
        
        // Extract bedroom info
        if (data.bhkType && !bedrooms) {
          bedrooms = data.bhkType;
        }
        
        // Extract bathroom info
        if (data.bathrooms && !bathrooms) {
          bathrooms = `${data.bathrooms} Bath`;
        }
        
        // Extract area info
        if (data.builtUpArea && !area) {
          const unit = data.builtUpAreaUnit === 'sqft' ? 'sq.ft' : 
                      data.builtUpAreaUnit === 'sqyd' ? 'sq.yd' : 
                      data.builtUpAreaUnit || 'sq.ft';
          area = `${data.builtUpArea} ${unit}`;
        }
        
        // Extract price info (rent/sale)
        if (data.rentAmount && price === 0) {
          price = data.rentAmount;
        } else if (data.expectedPrice && price === 0) {
          price = data.expectedPrice;
        }
      }
    }
  }

  // Get address from location step
  let address = property.address || '';
  let city = property.city || '';
  let state = property.state || '';

  if (propertyDetails.steps) {
    for (const [stepId, stepData] of Object.entries(propertyDetails.steps)) {
      if (stepId.includes('location') && stepData && typeof stepData === 'object') {
        const locationData = stepData as any;
        if (locationData.address && !address) address = locationData.address;
        if (locationData.city && !city) city = locationData.city;
        if (locationData.state && !state) state = locationData.state;
        break;
      }
    }
  }
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700 relative">
          <img
            src={property.property_images && property.property_images.length > 0 
              ? property.property_images[0].url 
              : '/noimage.png'}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          
          {/* Main Flow Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
              {flowLabel}
            </Badge>
          </div>
          
          {/* Version Badge */}
          <div className="absolute bottom-2 right-2">
            <Badge 
              className="bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1"
              title="Data Structure Version"
            >
              <Info className="h-3 w-3" />
              v{propertyVersion}
            </Badge>
          </div>
          
          {/* Admin Badge */}
          {isAdmin && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Admin
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-semibold line-clamp-1 mb-1">{displayTitle}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-2">
                  {address}, {city}, {state}
                </p>
                
                {/* Property Type and Listing Type - Clean Display */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                    {propertyType}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                    {listingType}
                  </Badge>
                </div>
                
                {/* Owner Information - Prominent Display */}
                {property.profiles && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">Owner:</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{property.profiles.email}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: <span className="font-mono">{property.profiles.id}</span>
                    </div>
                  </div>
                )}
                
                {/* Technical Details - Collapsed */}
                {isAdmin && (
                  <details className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      Technical Details
                    </summary>
                    <div className="mt-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                      <p>Property ID: <span className="font-mono select-all">{property.id}</span></p>
                      <p>Flow: <span className="font-medium text-blue-600 dark:text-blue-400">{propertyFlow}</span></p>
                      <p>Version: <span className="font-medium">{propertyVersion}</span></p>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 pb-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2 text-sm">
              <div>
                <span className="font-medium">Price:</span>
                <div className="text-lg font-bold text-green-600">{formatPrice(price)}</div>
              </div>
              {bedrooms && (
                <div>
                  <span className="font-medium">Type:</span>
                  <div>{bedrooms}</div>
                </div>
              )}
              {bathrooms && (
                <div>
                  <span className="font-medium">Bathrooms:</span>
                  <div>{bathrooms}</div>
                </div>
              )}
              {area && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-medium">Area:</span>
                  <div>{area}</div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="p-0 pt-3 flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isAdmin ? "Admin Delete" : "Delete"}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleFixTitle}
              disabled={isFixingTitle}
              className="flex items-center gap-1"
            >
              {isFixingTitle ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fixing...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Fix Title
                </>
              )}
            </Button>
            
            <Link to={`/seeker/property/${property.id}`} className="ml-auto">
              <Button size="sm">View Details</Button>
            </Link>
          </CardFooter>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <h3 className="font-medium">{displayTitle}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {address}, {city}, {state}
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{propertyType}</Badge>
              <Badge variant="outline">{listingType}</Badge>
            </div>
            {property.profiles && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm font-medium text-blue-600">
                  Owner: {property.profiles.email}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {property.profiles.id}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PropertyCard;