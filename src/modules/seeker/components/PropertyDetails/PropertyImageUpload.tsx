// src/modules/seeker/components/PropertyDetails/PropertyImageUpload.tsx
// Version: 1.2.0
// Last Modified: 30-04-2025 13:30 IST
// Purpose: Image upload component with upload-specific error handling

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { PlusIcon, ImageIcon, AlertCircle } from 'lucide-react';
import { PropertyDetails } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';

interface PropertyImageUploadProps {
  property: PropertyDetails;
  onImageUploaded?: () => void;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({ property, onImageUploaded }) => {
  const { user } = useAuth();
  const [showUploader, setShowUploader] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
        
        // Log for debugging
        console.log('Authorization check:', { 
          userId: user.id, 
          ownerId: property.owner_id, 
          isOwner, 
          isAdmin: hasAdminRole, 
          isAuthorized: isOwner || hasAdminRole 
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

  // Check if we've reached the maximum number of images (10)
  const imageCount = property.property_images?.length || 0;
  const canAddMoreImages = imageCount < 10;
  
  // Handle image upload completion
  const handleUploadComplete = (imageUrl: string) => {
    console.log('Upload completed successfully:', imageUrl);
    if (onImageUploaded) {
      onImageUploaded();
    }
    // Don't hide uploader automatically so user can add multiple images
  };

  // Handle upload errors
  const handleUploadError = (error: string) => {
    console.error('Image upload error:', error);
    setErrorMessage(error);
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
    <div className="my-6 border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Property Images</h3>
          <p className="text-muted-foreground text-sm">
            {isAdmin ? "Admin access: " : ""}
            You can manage images for this property ({imageCount}/10)
          </p>
        </div>
        
        {!showUploader && (
          <Button 
            onClick={() => setShowUploader(true)}
            disabled={!canAddMoreImages}
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
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

      {showUploader ? (
        <>
          {canAddMoreImages ? (
            <div className="border rounded-lg p-4">
              <ImageUpload
                propertyId={property.id}
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>Maximum of 10 images reached. Please delete some images to upload more.</p>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploader(false);
                setErrorMessage(''); // Clear any errors when closing
              }}
            >
              Done
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-lg border-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
          {canAddMoreImages ? (
            <>
              <p className="text-center text-muted-foreground mb-1">Click "Add Images" to upload property photos</p>
              <p className="text-xs text-muted-foreground">You can upload {10 - imageCount} more images</p>
            </>
          ) : (
            <p className="text-center text-muted-foreground">Maximum of 10 images reached</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload;