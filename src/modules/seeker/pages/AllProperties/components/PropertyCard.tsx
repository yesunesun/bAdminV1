// src/modules/seeker/pages/AllProperties/components/PropertyCard.tsx
// Version: 5.0.0
// Last Modified: 25-05-2025 16:15 IST
// Purpose: Updated to use new data structure exclusively and existing title utility

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { formatPrice } from '@/modules/seeker/services/seekerService';
import { getPropertyFlow, getFlowLabel } from '../utils/propertyUtils';
import { getPropertyVersion } from '../services/propertyVersionService';
import { generatePropertyTitle } from '@/modules/seeker/utils/propertyTitleUtils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Trash2, Pencil, ShieldAlert, Info } from 'lucide-react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { propertyService } from '@/modules/owner/services/propertyService';

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
  
  // Get property flow type
  const propertyFlow = getPropertyFlow(property);
  const flowLabel = getFlowLabel(propertyFlow);
  
  // Extract property type and listing type from the flow
  const flowParts = propertyFlow.split('_');
  const flowPropertyType = flowParts[0] || 'UNKNOWN';
  const flowListingType = flowParts[1] || 'UNKNOWN';
  
  // Get property version using our service
  const propertyVersion = getPropertyVersion(property.property_details);

  // Get display title from new data structure
  const displayTitle = property.property_details?.flow?.title || 'Untitled Property';

  // Get property details for display
  const propertyDetails = property.property_details || {};
  const flowCategory = propertyDetails.flow?.category || 'Unknown';
  const flowListingTypeFromData = propertyDetails.flow?.listingType || 'Unknown';

  // Check if current user is an admin - with proper error handling
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // Try the admin check with better error handling
        const { data, error } = await supabase
          .from('admin_users')
          .select(`
            role_id,
            admin_roles!inner (
              role_type
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle no results gracefully
        
        if (error) {
          console.warn('Admin status check failed (user likely not admin):', error.message);
          setIsAdmin(false);
          return;
        }
        
        if (data && data.admin_roles) {
          // Check if user has admin role
          const roleType = data.admin_roles.role_type;
          const hasAdminRole = roleType === 'admin' || 
            roleType === 'super_admin' || 
            roleType === 'property_moderator';
          
          setIsAdmin(hasAdminRole);
          console.log('User admin status:', hasAdminRole, 'Role type:', roleType);
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
    console.log('Fix Title: Button clicked');
    console.log('Fix Title: Property ID:', property.id);
    console.log('Fix Title: User ID:', user?.id);
    console.log('Fix Title: Full property object:', property);
    
    if (!property.id || !user?.id) {
      console.error('Fix Title: FAILED - Missing property ID or user ID');
      console.log('Fix Title: Property ID exists:', !!property.id);
      console.log('Fix Title: User ID exists:', !!user?.id);
      toast({
        title: "Error",
        description: "Unable to fix title: missing required information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsFixingTitle(true);
      console.log('Fix Title: Starting title generation process...');
      
      // Debug the property structure before title generation
      console.log('Fix Title: Property.property_details:', property.property_details);
      console.log('Fix Title: Property.property_details type:', typeof property.property_details);
      
      if (property.property_details) {
        console.log('Fix Title: Property.property_details.flow:', property.property_details.flow);
        console.log('Fix Title: Property.property_details.steps:', property.property_details.steps);
        console.log('Fix Title: Current title in flow:', property.property_details.flow?.title);
      } else {
        console.log('Fix Title: WARNING - No property_details found');
      }
      
      // Generate the new title using existing utility
      console.log('Fix Title: Calling generatePropertyTitle utility...');
      const newTitle = generatePropertyTitle(property);
      console.log('Fix Title: Generated new title:', newTitle);
      console.log('Fix Title: Generated title type:', typeof newTitle);
      console.log('Fix Title: Generated title length:', newTitle?.length);
      
      if (!newTitle || newTitle.trim() === '') {
        console.error('Fix Title: FAILED - Generated title is empty or invalid');
        throw new Error('Generated title is empty');
      }
      
      // Prepare updated property_details
      console.log('Fix Title: Preparing database update...');
      const currentPropertyDetails = property.property_details || {};
      const currentFlow = currentPropertyDetails.flow || {};
      
      console.log('Fix Title: Current property_details:', currentPropertyDetails);
      console.log('Fix Title: Current flow:', currentFlow);
      
      const updatedPropertyDetails = {
        ...currentPropertyDetails,
        flow: {
          ...currentFlow,
          title: newTitle
        }
      };

      console.log('Fix Title: Updated property_details to save:', updatedPropertyDetails);
      console.log('Fix Title: New title in updated object:', updatedPropertyDetails.flow.title);

      // Update properties_v2 table
      console.log('Fix Title: Executing database update...');
      console.log('Fix Title: Updating property ID:', property.id);
      console.log('Fix Title: Update payload:', {
        property_details: updatedPropertyDetails,
        updated_at: new Date().toISOString()
      });
      
      const { data, error, status, statusText } = await supabase
        .from('properties_v2')
        .update({ 
          property_details: updatedPropertyDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id)
        .select();
      
      console.log('Fix Title: Database response status:', status);
      console.log('Fix Title: Database response statusText:', statusText);
      console.log('Fix Title: Database response data:', data);
      console.log('Fix Title: Database response error:', error);
      
      if (error) {
        console.error('Fix Title: DATABASE ERROR:', error);
        console.error('Fix Title: Error code:', error.code);
        console.error('Fix Title: Error message:', error.message);
        console.error('Fix Title: Error details:', error.details);
        console.error('Fix Title: Error hint:', error.hint);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('Fix Title: WARNING - No data returned from update (might still be successful)');
      } else {
        console.log('Fix Title: SUCCESS - Database updated successfully');
        console.log('Fix Title: Updated record count:', data.length);
        console.log('Fix Title: Updated record data:', data[0]);
        
        // Verify the title was actually saved
        if (data[0]?.property_details?.flow?.title) {
          console.log('Fix Title: VERIFIED - Title saved in database:', data[0].property_details.flow.title);
        } else {
          console.warn('Fix Title: WARNING - Title not found in returned data');
        }
      }
      
      // Show success toast
      console.log('Fix Title: Showing success toast...');
      toast({
        title: "Title updated successfully",
        description: `New title: "${newTitle}"`,
      });
      
      // Refresh the property list
      if (onPropertyUpdated) {
        console.log('Fix Title: Calling onPropertyUpdated callback...');
        onPropertyUpdated();
      } else {
        console.log('Fix Title: No onPropertyUpdated callback provided');
      }
      
      console.log('Fix Title: Process completed successfully');
      
    } catch (error) {
      console.error('=== FIX TITLE ERROR ===');
      console.error('Fix Title: ERROR occurred:', error);
      console.error('Fix Title: Error type:', typeof error);
      console.error('Fix Title: Error constructor:', error.constructor.name);
      
      if (error instanceof Error) {
        console.error('Fix Title: Error message:', error.message);
        console.error('Fix Title: Error stack:', error.stack);
      }
      
      toast({
        title: "Failed to update title",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      console.log('Fix Title: Cleaning up - setting isFixingTitle to false');
      setIsFixingTitle(false);
      console.log('=== FIX TITLE DEBUG END ===');
    }
  };
  
  // Function to delete property
  const deleteProperty = async (propertyId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      console.log('Deleting property:', propertyId);
      
      // Check if user is admin and use appropriate delete method
      if (isAdmin) {
        // Use admin delete method if user is admin
        await propertyService.adminDeleteProperty(propertyId);
      } else {
        // Use regular delete method for property owners
        await propertyService.deleteProperty(propertyId, user.id);
      }
      
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted",
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
          {/* Property Flow Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {flowLabel}
            </Badge>
          </div>
          
          {/* Version Badge */}
          <div className="absolute bottom-2 right-2">
            <Badge 
              className={`flex items-center gap-1 ${isAdmin ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              title="Data Structure Version"
            >
              <Info className="h-3 w-3" />
              v{propertyVersion}
            </Badge>
          </div>
          
          {/* Admin Badge */}
          {isAdmin && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Admin
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold line-clamp-1">{displayTitle}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">
                  {address}, {city}, {state}
                </p>
                {/* Property ID Display */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ID: <span className="font-mono select-all">{property.id}</span>
                </p>
                {/* Property Flow Display - Complete flow string */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Flow: <span className="font-medium text-blue-600 dark:text-blue-400">{propertyFlow}</span>
                </p>
                {/* Version Display */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Version: <span className={`font-medium ${isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {propertyVersion}
                  </span>
                </p>
                {/* Property Type Tag */}
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:text-blue-400">
                    Type: {flowPropertyType}
                  </Badge>
                  {/* Listing Type Tag */}
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600 dark:text-green-400">
                    Listing: {flowListingType}
                  </Badge>
                </div>
                {property.profiles && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Owner: {property.profiles.email}
                  </p>
                )}
              </div>
              <Badge className="ml-2">
                {flowCategory}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 pb-2">
            <div className="grid grid-cols-3 gap-2 my-2 text-sm">
              <div>
                <span className="font-medium">Price:</span> {formatPrice(price)}
              </div>
              {bedrooms && (
                <div>
                  <span className="font-medium">Type:</span> {bedrooms}
                </div>
              )}
              {bathrooms && (
                <div>
                  <span className="font-medium">Bathrooms:</span> {bathrooms}
                </div>
              )}
              {area && (
                <div>
                  <span className="font-medium">Area:</span> {area}
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
            >
              <Trash2 className="h-4 w-4" />
              {isAdmin ? "Admin Delete" : "Delete"}
            </Button>
            
            {/* Fix Title button - appears unconditionally for all properties */}
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
            {property.profiles && (
              <p className="text-sm text-blue-600 font-medium mt-1">
                Owner: {property.profiles.email}
              </p>
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