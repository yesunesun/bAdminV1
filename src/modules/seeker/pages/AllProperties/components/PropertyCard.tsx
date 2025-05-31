// src/modules/seeker/pages/AllProperties/components/PropertyCard.tsx
// Version: 7.2.0
// Last Modified: 01-06-2025 20:00 IST
// Purpose: Fixed BHK and area extraction to handle search results format correctly

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
import { Trash2, Pencil, ShieldAlert, Info, User, Mail, Hash, Copy, Check } from 'lucide-react';
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
  const displayTitle = property.property_details?.flow?.title || property.title || 'Untitled Property';

  // Get property details for display
  const propertyDetails = property.property_details || {};

  // Copy function with visual feedback
  const handleCopy = async (value: string, label: string, fieldId: string) => {
    if (!value || value.trim() === '') {
      toast({
        title: "Copy failed",
        description: "No value to copy",
        variant: "destructive"
      });
      return;
    }

    try {
      // Modern browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      // Success feedback
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);

      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });

    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try selecting and copying manually.",
        variant: "destructive"
      });
    }
  };

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
      
      // Generate the new title
      console.log('Fix Title: Calling generatePropertyTitle...');
      const newTitle = generatePropertyTitle(property);
      console.log('Fix Title: Generated new title:', newTitle);
      
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

      // First, let's verify the property exists and check current user permissions
      const { data: existsData, error: existsError } = await supabase
        .from('properties_v2')
        .select('id, owner_id, property_details')
        .eq('id', property.id)
        .single();
      
      if (existsError) {
        console.error('Fix Title: Error checking property existence:', existsError);
        throw new Error(`Property check failed: ${existsError.message}`);
      }
      
      // Check if user has permission to update
      const userIsOwner = existsData?.owner_id === user.id;
      const userCanUpdate = userIsOwner || isAdmin;
      
      if (!userCanUpdate) {
        throw new Error(`Permission denied. User is owner: ${userIsOwner}, User is admin: ${isAdmin}`);
      }
      
      // Direct update
      let updateResult;
      
      if (isAdmin) {
        updateResult = await supabase
          .from('properties_v2')
          .update({ 
            property_details: updatedPropertyDetails,
            updated_at: new Date().toISOString()
          })
          .eq('id', property.id)
          .select();
      } else if (existsData?.owner_id === user.id) {
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
      
      const { error, data } = updateResult;
      
      if (error) {
        console.error('Fix Title: Database update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('Fix Title: No rows were updated! This suggests a permissions or RLS policy issue.');
        throw new Error('Database update failed - no rows were affected. This may be due to Row Level Security policies.');
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
  
  // Function to delete property - Simplified working solution without non-existent functions
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
      console.log('=== DELETE PROPERTY DEBUG START ===');
      console.log('Attempting to delete property:', propertyId);
      console.log('User ID:', user.id);
      console.log('Is Admin:', isAdmin);
      
      // First check if the property exists and get owner info
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties_v2')
        .select('owner_id, property_details')
        .eq('id', propertyId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching property:', fetchError);
        throw new Error(`Property not found: ${fetchError.message}`);
      }
      
      console.log('Property found - Owner ID:', propertyData.owner_id);
      
      // Check permissions: user must be property owner or admin
      const isOwner = propertyData.owner_id === user.id;
      console.log('User is owner:', isOwner);
      console.log('User is admin:', isAdmin);
      
      if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to delete this property');
      }
      
      console.log('Starting deletion process...');
      
      // Delete related records first (these usually work fine)
      const deletionSteps = [
        { table: 'property_likes', field: 'property_id', name: 'Property Likes' },
        { table: 'properties_v2_likes', field: 'property_id', name: 'V2 Property Likes' },
        { table: 'v2_favorites', field: 'property_id', name: 'V2 Favorites' },
        { table: 'property_visits', field: 'property_id', name: 'Property Visits' },
        { table: 'owner_notifications', field: 'property_id', name: 'Owner Notifications' },
        { table: 'property_images', field: 'property_id', name: 'Property Images' },
        { table: 'temp_property_listing', field: 'id', name: 'Temp Property Listing' }
      ];
      
      console.log('Deleting related records...');
      for (const step of deletionSteps) {
        try {
          const { error, count } = await supabase
            .from(step.table)
            .delete()
            .eq(step.field, propertyId);
          
          if (error) {
            console.warn(`Warning: Could not delete from ${step.name}:`, error.message);
          } else {
            console.log(`✅ ${step.name} deleted successfully (${count || 0} records)`);
          }
        } catch (err) {
          console.warn(`Warning: ${step.name} deletion failed:`, err);
        }
      }
      
      // Now delete the main property record
      console.log('Deleting main property record...');
      
      let deleteResult;
      
      if (isAdmin) {
        console.log('Admin deletion: Attempting to delete any property...');
        // For admins, try to delete without owner constraint
        deleteResult = await supabase
          .from('properties_v2')
          .delete()
          .eq('id', propertyId)
          .select('id'); // Select minimal data to confirm deletion
      } else {
        console.log('Owner deletion: Attempting to delete own property...');
        // For owners, only delete if they own it
        deleteResult = await supabase
          .from('properties_v2')
          .delete()
          .eq('id', propertyId)
          .eq('owner_id', user.id)
          .select('id'); // Select minimal data to confirm deletion
      }
      
      const { error: deleteError, data: deleteData } = deleteResult;
      
      console.log('Delete result error:', deleteError);
      console.log('Delete result data:', deleteData);
      console.log('Number of records deleted:', deleteData ? deleteData.length : 0);
      
      if (deleteError) {
        console.error('Error deleting property:', deleteError);
        console.error('Delete error details:', {
          code: deleteError.code,
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint
        });
        
        // Provide specific error messages based on error type
        if (deleteError.code === '42501') {
          throw new Error('Permission denied: Admin users need additional database permissions to delete properties owned by other users.');
        } else if (deleteError.message.includes('permission') || deleteError.message.includes('policy')) {
          throw new Error(`Database security policy error: ${deleteError.message}`);
        } else {
          throw new Error(`Database error: ${deleteError.message}`);
        }
      }
      
      // Check if any rows were actually deleted
      const deletedCount = deleteData ? deleteData.length : 0;
      if (deletedCount === 0) {
        console.error('No rows were deleted - this indicates an RLS policy issue');
        
        if (isAdmin && !isOwner) {
          throw new Error('Admin deletion failed: The database Row Level Security policies do not allow admins to delete properties owned by other users. This needs to be configured at the database level.');
        } else {
          throw new Error('Property deletion failed: No rows were affected. This may be due to database security policies or the property may not exist.');
        }
      }
      
      console.log('✅ Property deleted successfully!');
      console.log(`Deleted ${deletedCount} property record(s)`);
      
      toast({
        title: "Property deleted successfully",
        description: isAdmin 
          ? `Property removed by admin (${deletedCount} record deleted)`
          : "Your property has been removed successfully",
      });
      
      // Notify parent component to refresh the list
      if (onPropertyDeleted) {
        onPropertyDeleted();
      }
      
    } catch (err) {
      console.error('=== DELETE PROPERTY ERROR ===');
      console.error('Delete error:', err);
      
      let errorMessage = "Failed to delete property";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Show user-friendly error message
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      console.log('=== DELETE PROPERTY DEBUG END ===');
    }
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (property.id) {
      deleteProperty(property.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // ====== FIXED: Extract basic property info with dual-format support ======
  let bedrooms = '';
  let bathrooms = '';
  let area = '';
  let price = property.price || 0;

  // 🔧 FIXED: Check if we have direct property fields from search results (NEW FORMAT)
  if (property.bedrooms && property.bedrooms > 0) {
    // NEW FORMAT: Direct bedrooms field from search results
    bedrooms = `${property.bedrooms} BHK`;
    console.log('🏠 Using NEW FORMAT bedrooms:', bedrooms);
  }

  if (property.bathrooms && property.bathrooms > 0) {
    // NEW FORMAT: Direct bathrooms field from search results
    bathrooms = `${property.bathrooms} Bath`;
    console.log('🚿 Using NEW FORMAT bathrooms:', bathrooms);
  }

  if (property.square_feet && property.square_feet > 0) {
    // NEW FORMAT: Direct area field from search results
    area = `${property.square_feet} sq.ft`;
    console.log('📐 Using NEW FORMAT area (square_feet):', area);
  } else if (property.area && property.area > 0) {
    // SEARCH RESULTS FORMAT: area field from database function
    area = `${property.area} sq.ft`;
    console.log('📐 Using SEARCH FORMAT area:', area);
  }

  // 🔧 FALLBACK: If no direct fields, extract from steps (OLD FORMAT)
  if (!bedrooms || !bathrooms || !area) {
    console.log('🔄 Falling back to OLD FORMAT step parsing...');
    
    if (propertyDetails.steps) {
      for (const [stepId, stepData] of Object.entries(propertyDetails.steps)) {
        if (stepData && typeof stepData === 'object') {
          const data = stepData as any;
          
          // Extract bedroom info from steps
          if (data.bhkType && !bedrooms) {
            bedrooms = data.bhkType;
            console.log('🏠 Using OLD FORMAT bhkType:', bedrooms);
          } else if (data.bedrooms && !bedrooms) {
            bedrooms = `${data.bedrooms} BHK`;
            console.log('🏠 Using OLD FORMAT bedrooms:', bedrooms);
          }
          
          // Extract bathroom info from steps
          if (data.bathrooms && !bathrooms) {
            bathrooms = `${data.bathrooms} Bath`;
            console.log('🚿 Using OLD FORMAT bathrooms:', bathrooms);
          }
          
          // Extract area info from steps
          if (data.builtUpArea && !area) {
            const unit = data.builtUpAreaUnit === 'sqft' ? 'sq.ft' : 
                        data.builtUpAreaUnit === 'sqyd' ? 'sq.yd' : 
                        data.builtUpAreaUnit || 'sq.ft';
            area = `${data.builtUpArea} ${unit}`;
            console.log('📐 Using OLD FORMAT builtUpArea:', area);
          } else if (data.squareFootage && !area) {
            area = `${data.squareFootage} sq.ft`;
            console.log('📐 Using OLD FORMAT squareFootage:', area);
          }
          
          // Extract price info (rent/sale) from steps
          if (data.rentAmount && price === 0) {
            price = data.rentAmount;
            console.log('💰 Using OLD FORMAT rentAmount:', price);
          } else if (data.expectedPrice && price === 0) {
            price = data.expectedPrice;
            console.log('💰 Using OLD FORMAT expectedPrice:', price);
          }
        }
      }
    }
  }

  // 🔧 FINAL FALLBACK: Set default values if still empty
  if (!bedrooms) bedrooms = 'N/A';
  if (!bathrooms) bathrooms = 'N/A';
  if (!area) area = 'N/A';

  console.log('📊 FINAL VALUES:', { bedrooms, bathrooms, area, price });

  // Get address from multiple sources
  let address = property.address || '';
  let city = property.city || '';
  let state = property.state || '';

  // Fallback to extracting from location steps if direct fields are empty
  if ((!address || !city || !state) && propertyDetails.steps) {
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
                
                {/* Property ID - Prominent Display with Copy Button */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Property ID</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(property.id, 'Property ID', 'property_id')}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                      title="Copy Property ID"
                    >
                      {copiedField === 'property_id' ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </Button>
                  </div>
                  <div className="font-mono text-sm text-blue-700 dark:text-blue-300 break-all select-all">
                    {property.id}
                  </div>
                </div>
                
                {/* Property Type and Listing Type - Clean Display */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                    {propertyType}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                    {listingType}
                  </Badge>
                </div>
                
                {/* Owner Information - Enhanced with Copy Buttons */}
                {property.profiles && (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">Property Owner</span>
                    </div>
                    
                    {/* Owner Email with Copy Button */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 truncate select-all">
                            {property.profiles.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(property.profiles.email, 'Owner Email', 'owner_email')}
                        className="h-8 w-8 p-0 ml-2 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Copy Owner Email"
                      >
                        {copiedField === 'owner_email' ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Owner ID with Copy Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Owner ID</div>
                        <div className="font-mono text-sm text-gray-600 dark:text-gray-400 break-all select-all">
                          {property.profiles.id}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(property.profiles.id, 'Owner ID', 'owner_id')}
                        className="h-8 w-8 p-0 ml-2 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Copy Owner ID"
                      >
                        {copiedField === 'owner_id' ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </Button>
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
              {bedrooms && bedrooms !== 'N/A' && (
                <div>
                  <span className="font-medium">Type:</span>
                  <div>{bedrooms}</div>
                </div>
              )}
              {bathrooms && bathrooms !== 'N/A' && (
                <div>
                  <span className="font-medium">Bathrooms:</span>
                  <div>{bathrooms}</div>
                </div>
              )}
              {area && area !== 'N/A' && (
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