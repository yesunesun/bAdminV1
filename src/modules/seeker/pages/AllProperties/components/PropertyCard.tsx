// src/modules/seeker/pages/AllProperties/components/PropertyCard.tsx
// Version: 4.3.0
// Last Modified: 14-04-2025 22:15 IST
// Purpose: Fixed property deletion functionality by correcting propertyService import

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { formatPrice } from '@/modules/seeker/services/seekerService';
import { getPropertyFlow, getFlowLabel } from '../utils/propertyUtils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Trash2, AlertTriangle, Pencil, ShieldAlert } from 'lucide-react';
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

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role_id, admin_roles(role_type)')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          // Check if user has admin role
          const roleType = data.admin_roles?.role_type;
          const hasAdminRole = roleType === 'admin' || 
            roleType === 'super_admin' || 
            roleType === 'property_moderator';
          
          setIsAdmin(hasAdminRole);
          console.log('User admin status:', hasAdminRole, 'Role type:', roleType);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);

  // Generate a formatted property title
  const generateFormattedTitle = (property: PropertyType): string => {
    const details = property.property_details || {};
    
    // Extract needed information
    const bhkType = details.bhkType || (property.bedrooms ? `${property.bedrooms} BHK` : '');
    const propertyType = details.propertyType || 'Property';
    const listingType = details.listingType?.toLowerCase() || '';
    const locality = details.locality || property.city || '';
    
    // Determine if this is for sale or rent
    const isForSale = 
      listingType === 'sale' || 
      listingType === 'sell' ||
      details.isSaleProperty === true;
    
    const forText = isForSale ? 'for Sale' : 'for Rent';
    
    // Construct the title
    return `${bhkType} ${propertyType} ${forText} in ${locality}`;
  };
  
  // Function to fix property title
  const handleFixTitle = async () => {
    if (!property.id || !user?.id) return;
    
    try {
      setIsFixingTitle(true);
      
      // Generate the new formatted title
      const newTitle = generateFormattedTitle(property);
      
      // Update the property in the database
      const { error } = await supabase
        .from('properties')
        .update({ title: newTitle })
        .eq('id', property.id);
      
      if (error) {
        throw error;
      }
      
      // Show success toast
      toast({
        title: "Title updated",
        description: `Title changed to "${newTitle}"`,
      });
      
      // Refresh the property list
      if (onPropertyUpdated) {
        onPropertyUpdated();
      }
    } catch (error) {
      console.error('Error updating property title:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the property title",
        variant: "destructive"
      });
    } finally {
      setIsFixingTitle(false);
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
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700 relative">
          <img
            src={property.property_images && property.property_images.length > 0 
              ? property.property_images[0].url 
              : '/noimage.png'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {/* Property Flow Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {flowLabel}
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
                <h2 className="text-xl font-semibold line-clamp-1">{property.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">
                  {property.address}, {property.city}, {property.state}
                </p>
                {/* Property ID Display */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ID: <span className="font-mono select-all">{property.id}</span>
                </p>
                {/* Property Flow Display */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Flow: <span className="font-medium text-blue-600 dark:text-blue-400">{propertyFlow}</span>
                </p>
                {property.profiles && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Owner: {property.profiles.email}
                  </p>
                )}
              </div>
              <Badge className="ml-2">
                {property.property_details?.propertyType || 'Property'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 pb-2">
            <div className="grid grid-cols-3 gap-2 my-2 text-sm">
              <div>
                <span className="font-medium">Price:</span> {formatPrice(property.price)}
              </div>
              {property.bedrooms && (
                <div>
                  <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <span className="font-medium">Bathrooms:</span> {property.bathrooms}
                </div>
              )}
              {property.square_feet && (
                <div>
                  <span className="font-medium">Area:</span> {property.square_feet} sq.ft
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
      
      {/* Delete Confirmation Dialog - Same as in Properties.tsx */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <h3 className="font-medium">{property.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {property.address}, {property.city}, {property.state}
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