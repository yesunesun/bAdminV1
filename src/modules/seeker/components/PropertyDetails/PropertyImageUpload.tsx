// src/modules/seeker/components/PropertyDetails/PropertyImageUpload.tsx
// Version: 2.3.0
// Last Modified: 30-04-2025 19:20 IST
// Purpose: Renamed button, enables it always, and added refresh for image removals

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { PlusIcon, X, ImageIcon } from 'lucide-react';
import { PropertyDetails } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';

interface PropertyImageUploadProps {
  property: PropertyDetails;
  onImageUploaded: () => void;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({ property, onImageUploaded }) => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [imagesChanged, setImagesChanged] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user || !property) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is owner
        const isOwner = property.owner_id === user.id;
        
        // Check if user is admin (check admin_users table)
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (adminError) {
          console.error('Admin check error:', adminError);
        }
          
        const hasAdminRole = !!adminData;
        
        setIsAdmin(hasAdminRole);
        setIsAuthorized(isOwner || hasAdminRole);
        
        console.log('Authorization check:', { 
          userId: user.id, 
          ownerId: property.owner_id, 
          isOwner, 
          isAdmin: hasAdminRole
        });
        
      } catch (error) {
        console.error("Error checking user permissions:", error);
        setErrorMessage("Couldn't verify permissions");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [user, property]);

  // This effect handles the refresh after dialog closes
  useEffect(() => {
    if (imagesChanged && !uploadDialogOpen) {
      console.log('Dialog closed with image changes - triggering refresh');
      onImageUploaded();
      setImagesChanged(false);
      setUploadedCount(0);
      setRemovedCount(0);
    }
  }, [uploadDialogOpen, imagesChanged, onImageUploaded]);

  // Check if we've reached the maximum number of images (10)
  const imageCount = property.property_images?.length || 0;
  const canAddMoreImages = imageCount < 10;
  const remainingImages = 10 - imageCount;
  
  // Handle image upload completion
  const handleUploadComplete = (imageUrl: string) => {
    console.log('Upload completed successfully:', imageUrl);
    setUploadedCount(prev => prev + 1);
    setImagesChanged(true);
  };

  // Handle image removal
  const handleImageRemoved = () => {
    console.log('Image removed successfully');
    setRemovedCount(prev => prev + 1);
    setImagesChanged(true);
  };

  // Handle upload errors
  const handleUploadError = (error: string) => {
    console.error('Image upload error:', error);
    setErrorMessage(error);
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && imagesChanged) {
      console.log(`Dialog closing with changes (${uploadedCount} uploads, ${removedCount} removals) - flagging for refresh`);
    }
    
    setUploadDialogOpen(open);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <span className="animate-pulse">Checking permissions...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't show anything if not authorized
  }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between p-5 border rounded-lg">
        <div>
          <h3 className="text-lg font-medium">Property Images</h3>
          <p className="text-muted-foreground text-sm">
            You can manage images for this property ({imageCount}/10)
          </p>
        </div>
        
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="flex items-center"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add/Remove Images
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Manage Property Images</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          {errorMessage && (
            <div className="flex items-center p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              <span>{errorMessage}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs text-red-700"
                onClick={() => setErrorMessage('')}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          {uploadedCount > 0 && (
            <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
              <span>Successfully uploaded {uploadedCount} image{uploadedCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {removedCount > 0 && (
            <div className="p-3 mb-4 text-sm text-blue-600 bg-blue-50 rounded-lg border border-blue-200">
              <span>Successfully removed {removedCount} image{removedCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          <div>
            {canAddMoreImages && (
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">
                  You can upload {remainingImages} more image{remainingImages !== 1 ? 's' : ''}.
                </p>
                <div className="p-4 border rounded-lg">
                  <ImageUpload
                    propertyId={property.id}
                    onUploadComplete={handleUploadComplete}
                    onImageRemoved={handleImageRemoved}
                    onError={handleUploadError}
                  />
                </div>
              </div>
            )}
            
            {!canAddMoreImages && (
              <div className="p-4 mb-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                <p>Maximum of 10 images reached. Please delete some images to upload more.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                // This will trigger handleDialogClose
                setUploadDialogOpen(false);
                setErrorMessage('');
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyImageUpload;