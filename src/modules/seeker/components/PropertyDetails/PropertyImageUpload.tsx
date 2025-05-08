// src/modules/seeker/components/PropertyDetails/PropertyImageUpload.tsx
// Version: 7.0.0
// Last Modified: 08-05-2025 23:30 IST
// Purpose: Store images directly in property JSON object

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { PropertyDetails } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PropertyImageUploadProps {
  property: PropertyDetails;
  onImageUploaded: () => void;
}

interface PropertyImage {
  id: string;
  dataUrl: string;
  isPrimary: boolean;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({ property, onImageUploaded }) => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imagesChanged, setImagesChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Maximum of 10 images allowed
  const MAX_IMAGES = 10;
  // Maximum size of 2MB to keep JSON size reasonable
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  
  // Load images from property JSON object
  useEffect(() => {
    if (!property) return;
    
    try {
      // Get images from property_details
      const propertyDetails = property.property_details || {};
      const imageArray = propertyDetails.images || [];
      
      console.log('Found images in property details:', imageArray.length);
      setImages(imageArray);
      
    } catch (err) {
      console.error('Error loading images from property details:', err);
    }
  }, [property]);

  // Check authorization
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user || !property) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // User is authorized if they are the property owner
      const isOwner = property.owner_id === user.id;
      
      // Check if admin
      let isAdmin = false;
      try {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        isAdmin = !!adminData;
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
      
      setIsAuthorized(isOwner || isAdmin);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [user, property]);

  // Handle dialog close and changes
  useEffect(() => {
    if (imagesChanged && !uploadDialogOpen) {
      console.log('Dialog closed with image changes - triggering refresh');
      onImageUploaded();
      setImagesChanged(false);
      setSuccessMessage('');
    }
  }, [uploadDialogOpen, imagesChanged, onImageUploaded]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    handleFiles(files);
    
    // Reset the input value so the same file can be selected again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  // Convert file to base64
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process selected files
  const handleFiles = async (files: File[]) => {
    if (!property?.id) {
      setErrorMessage('Property ID is required for uploading images');
      return;
    }

    if (files.length === 0) {
      return; // No files selected, just return silently
    }

    // Check if adding these files would exceed the max count
    if (images.length + files.length > MAX_IMAGES) {
      setErrorMessage(`You can upload a maximum of ${MAX_IMAGES} images. Please delete some images first.`);
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setErrorMessage('Please select only image files.');
      return;
    }

    // Check file sizes (limit to max file size)
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrorMessage(`Some files exceed the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit.`);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    
    for (const file of imageFiles) {
      try {
        await uploadImage(file);
      } catch (err) {
        console.error('Error uploading file:', err);
        setErrorMessage('Failed to upload one or more images. Please try again.');
        break;
      }
    }
  };

  // Upload a single image
  const uploadImage = async (file: File) => {
    if (!property?.id) return;

    try {
      setUploading(true);

      // Convert the file to base64 data URL
      const dataUrl = await fileToDataUrl(file);
      
      // Create a unique ID for the image
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Determine if this should be the primary image
      const isPrimary = images.length === 0;
      
      // Add the new image to our local state
      const newImage = { 
        id: imageId, 
        dataUrl, 
        isPrimary 
      };
      
      // If this is the first image, make it primary
      // Otherwise, update existing images to be non-primary
      let updatedImages: PropertyImage[];
      if (isPrimary) {
        updatedImages = [...images.map(img => ({ ...img, isPrimary: false })), newImage];
      } else {
        updatedImages = [...images, newImage];
      }
      
      // Save back to the database
      await saveImagesToProperty(updatedImages);
      
      // Update local state
      setImages(updatedImages);
      setSuccessMessage('Image uploaded successfully');
      setImagesChanged(true);
      
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Remove an image
  const handleRemoveImage = async (imageId: string) => {
    try {
      const updatedImages = images.filter(img => img.id !== imageId);
      
      // If we removed the primary image, set the first remaining image as primary
      if (updatedImages.length > 0 && images.find(img => img.id === imageId)?.isPrimary) {
        updatedImages[0].isPrimary = true;
      }
      
      // Save to database
      await saveImagesToProperty(updatedImages);
      
      // Update local state
      setImages(updatedImages);
      setSuccessMessage('Image removed successfully');
      setImagesChanged(true);
      
    } catch (err) {
      console.error('Error removing image:', err);
      setErrorMessage('Failed to remove image. Please try again.');
    }
  };

  // Set primary image
  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      // Find the image and make sure it exists
      const imageIndex = images.findIndex(img => img.id === imageId);
      if (imageIndex === -1) {
        throw new Error('Image not found');
      }
      
      // Update all images to be non-primary, then set the selected one to primary
      const updatedImages = images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }));
      
      // Save to database
      await saveImagesToProperty(updatedImages);
      
      // Update local state
      setImages(updatedImages);
      setSuccessMessage('Main photo updated');
      setImagesChanged(true);
      
    } catch (err) {
      console.error('Error setting primary image:', err);
      setErrorMessage('Failed to set primary image. Please try again.');
    }
  };

  // Save images array to property details JSON
  const saveImagesToProperty = async (imageArray: PropertyImage[]) => {
    try {
      // Get current property details
      const propertyDetails = property.property_details || {};
      
      // Update images in property details
      const updatedDetails = {
        ...propertyDetails,
        images: imageArray
      };
      
      // Update property in database
      const { error } = await supabase
        .from('properties_v2')
        .update({ 
          property_details: updatedDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id);
        
      if (error) {
        console.error('Error updating property:', error);
        throw new Error(`Failed to save images: ${error.message}`);
      }
      
    } catch (err) {
      console.error('Error saving images to property:', err);
      throw err;
    }
  };

  // Check if we've reached the maximum number of images
  const imageCount = images.length;
  const canAddMoreImages = imageCount < MAX_IMAGES;
  const remainingImages = MAX_IMAGES - imageCount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
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
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Property Images</DialogTitle>
            <DialogDescription>
              Upload and manage images for your property listing
            </DialogDescription>
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
          
          {successMessage && (
            <div className="flex items-center p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
              <span>{successMessage}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs text-green-700"
                onClick={() => setSuccessMessage('')}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <div>
            {canAddMoreImages && (
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">
                  You can upload {remainingImages} more image{remainingImages !== 1 ? 's' : ''}.
                </p>
                
                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-8 transition-all",
                      "hover:border-slate-300 hover:bg-slate-50",
                      dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200",
                    )}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                    
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700">
                          {uploading ? 'Uploading...' : 'Drag and drop your images here'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Or click to browse. Supports PNG, JPG, GIF up to 2MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {uploading && (
                  <div className="text-center py-4">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Uploading image... Please wait</p>
                  </div>
                )}
              </div>
            )}
            
            {!canAddMoreImages && (
              <div className="p-4 mb-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                <p>Maximum of 10 images reached. Please delete some images to upload more.</p>
              </div>
            )}
            
            {/* Current Images */}
            {images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  Current Images ({images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group aspect-video rounded-lg overflow-hidden border ${
                        image.isPrimary ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={image.dataUrl}
                        alt="Property"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/noimage.png';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!image.isPrimary && (
                          <button
                            onClick={() => handleSetPrimaryImage(image.id)}
                            className="p-1.5 rounded-full bg-white/80 text-slate-600 hover:text-primary-600 hover:bg-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Set as main photo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="p-1.5 rounded-full bg-white/80 text-red-600 hover:text-red-800 hover:bg-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {image.isPrimary && (
                        <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          Main Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {images.length === 0 && !uploading && (
              <div className="text-center py-12 border rounded-lg">
                <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No uploaded images</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload images to showcase your property
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setUploadDialogOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyImageUpload;