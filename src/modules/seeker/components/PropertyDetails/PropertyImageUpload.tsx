// src/modules/seeker/components/PropertyDetails/PropertyImageUpload.tsx
// Version: 10.0.0
// Last Modified: 27-05-2025 10:15 IST
// Purpose: Enhanced with video upload capability in the same interface

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ImageIcon, Upload, AlertCircle, Video, Play, Trash2, CheckCircle } from 'lucide-react';
import { PropertyDetails, PropertyVideo } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useVideoUploadSimple as useVideoUpload, validateVideoFile } from '../../hooks/useVideoUploadSimple';
import { propertyVideoStorage } from '@/lib/supabase';
import PropertyVideoPlayer from './PropertyVideoPlayer';

interface PropertyImageUploadProps {
  property: PropertyDetails;
  onImageUploaded: () => void;
  onVideoUploaded?: () => void;
}

interface PropertyImage {
  id: string;
  fileName: string;
  isPrimary: boolean;
}

// Constants
const STORAGE_BUCKET = 'property-images-v2';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({ 
  property, 
  onImageUploaded, 
  onVideoUploaded 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imagesChanged, setImagesChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  
  // Video upload states
  const [activeTab, setActiveTab] = useState<'images' | 'video'>('images');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [confirmDeleteVideoOpen, setConfirmDeleteVideoOpen] = useState(false);
  const [replaceVideoConfirmOpen, setReplaceVideoConfirmOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Maximum of 10 images allowed
  const MAX_IMAGES = 10;
  // Maximum size of 5MB for storage upload
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Check permissions
  const isOwner = user?.id === property.owner_id;
  const isAdmin = user?.user_metadata?.is_admin || user?.user_metadata?.role === 'admin';
  const canUpload = isOwner || isAdmin;

  // Video upload hook
  const {
    isUploading: isUploadingVideo,
    uploadProgress,
    error: uploadError,
    videoUrl,
    fileName,
    thumbnailUrl,
    uploadVideo,
    deleteVideo,
    clearError,
    generateThumbnail
  } = useVideoUpload(
    property.id,
    (videoData) => {
      console.log('Video upload completed:', videoData);
      toast({
        title: "Video Uploaded Successfully",
        description: `Your property video has been uploaded (${formatFileSize(videoData.fileSize)})`,
        variant: "default"
      });
      
      // Clear selected file and preview
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      
      if (onVideoUploaded) {
        onVideoUploaded();
      }
    },
    (error) => {
      console.error('Video upload failed:', error);
      toast({
        title: "Video Upload Failed",
        description: error,
        variant: "destructive"
      });
    },
    () => {
      console.log('Video deleted successfully');
      toast({
        title: "Video Deleted",
        description: "Property video has been removed successfully",
        variant: "default"
      });
      
      if (onVideoUploaded) {
        onVideoUploaded();
      }
    }
  );
  
  // Load images from property JSON object
  useEffect(() => {
    if (!property) return;
    
    try {
      // Get images from property_details
      const propertyDetails = property.property_details || {};
      
      // Check if we have images in the new format (fileName based)
      if (propertyDetails.imageFiles && Array.isArray(propertyDetails.imageFiles)) {
        console.log('[PropertyImageUpload] Found images in property details (fileName format):', propertyDetails.imageFiles.length);
        setImages(propertyDetails.imageFiles);
        
        // Generate signed URLs for all images
        generateSignedUrls(propertyDetails.imageFiles);
        return;
      }
      
      // Legacy format: Check for dataUrl images
      if (propertyDetails.images && Array.isArray(propertyDetails.images)) {
        console.log('[PropertyImageUpload] Found legacy images in property details (dataUrl format):', propertyDetails.images.length);
        // Convert from old format to new format
        const convertedImages = propertyDetails.images.map((img: any, index: number) => ({
          id: img.id || `img-${index}`,
          fileName: img.id || `legacy-${index}`, // This is just a placeholder for legacy images
          isPrimary: !!img.isPrimary
        }));
        setImages(convertedImages);
        
        // Cache the dataUrls
        const urlMap: Record<string, string> = {};
        propertyDetails.images.forEach((img: any) => {
          if (img.id && img.dataUrl) {
            urlMap[img.id] = img.dataUrl;
          }
        });
        setImageUrls(urlMap);
      } else {
        console.log('[PropertyImageUpload] No images found in property details');
        setImages([]);
      }
    } catch (err) {
      console.error('[PropertyImageUpload] Error loading images from property details:', err);
      setImages([]);
    }
  }, [property]);

  // Generate signed URLs for all images
  const generateSignedUrls = async (imageFiles: PropertyImage[]) => {
    if (!property?.id || !imageFiles || imageFiles.length === 0) return;
    
    const urlMap: Record<string, string> = {};
    
    for (const img of imageFiles) {
      if (!img.fileName || img.fileName.startsWith('legacy-') || img.fileName.startsWith('img-')) {
        continue;
      }
      
      try {
        const { data, error } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(`${property.id}/${img.fileName}`, 3600);
          
        if (error) {
          console.error(`[PropertyImageUpload] Error generating signed URL for ${img.fileName}:`, error);
          continue;
        }
        
        urlMap[img.id] = data.signedUrl;
        console.log(`[PropertyImageUpload] Generated signed URL for ${img.fileName}`);
      } catch (err) {
        console.error(`[PropertyImageUpload] Error generating signed URL:`, err);
      }
    }
    
    setImageUrls(urlMap);
  };

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
        console.error('[PropertyImageUpload] Error checking admin status:', err);
      }
      
      setIsAuthorized(isOwner || isAdmin);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [user, property]);

  // Handle dialog close and changes
  useEffect(() => {
    if (imagesChanged && !uploadDialogOpen) {
      console.log('[PropertyImageUpload] Dialog closed with image changes - triggering refresh');
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
    
    if (activeTab === 'images') {
      handleFiles(files);
    } else {
      // Handle video files
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      if (videoFiles.length > 0) {
        handleVideoFileSelection(videoFiles[0]);
      }
    }
  };

  // Handle file selection for images
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    handleFiles(files);
    
    // Reset the input value so the same file can be selected again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle video file selection
  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleVideoFileSelection(files[0]);
    }
    
    // Reset input value for repeated selection of same file
    if (event.target) {
      event.target.value = '';
    }
  };

  // Process selected image files
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
    setUploading(true);
    
    try {
      for (const file of imageFiles) {
        await uploadImage(file);
      }
      setSuccessMessage(`Successfully uploaded ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('[PropertyImageUpload] Error uploading files:', err);
      setErrorMessage('Failed to upload one or more images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Process selected video file
  const handleVideoFileSelection = async (file: File) => {
    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid Video File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setSelectedVideoFile(file);
    
    // Generate preview URL
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    
    // Generate thumbnail for preview
    try {
      const thumbnail = await propertyVideoStorage.generateThumbnail(file);
      console.log('Generated thumbnail:', thumbnail ? 'success' : 'failed');
    } catch (error) {
      console.warn('Thumbnail generation failed:', error);
    }
  };

  // Upload a single image to Supabase storage
  const uploadImage = async (file: File) => {
    if (!property?.id) return;

    try {
      // Generate a unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Full path where the file will be stored
      const filePath = `${property.id}/${fileName}`;
      
      console.log(`[PropertyImageUpload] Uploading file to ${STORAGE_BUCKET}/${filePath}`);
      
      // Upload file directly to Supabase storage
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600', // 1 hour cache
          upsert: true
        });
        
      if (error) {
        console.error('[PropertyImageUpload] Storage upload error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Upload failed: No data returned');
      }
      
      console.log(`[PropertyImageUpload] Image uploaded successfully. Path: ${filePath}`);
      
      // Create a unique ID for the image
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Determine if this should be the primary image
      const isPrimary = images.length === 0;
      
      // Generate a signed URL for the uploaded image
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600);
        
      if (urlError) {
        console.error('[PropertyImageUpload] Error generating signed URL:', urlError);
      } else {
        // Store the signed URL in our cache
        setImageUrls(prev => ({
          ...prev,
          [imageId]: urlData.signedUrl
        }));
      }
      
      // Add the new image to our local state
      const newImage = { 
        id: imageId, 
        fileName: fileName, 
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
      setImagesChanged(true);
      
    } catch (err) {
      console.error('[PropertyImageUpload] Upload error:', err);
      throw err;
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
      console.error('[PropertyImageUpload] Error removing image:', err);
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
      console.error('[PropertyImageUpload] Error setting primary image:', err);
      setErrorMessage('Failed to set primary image. Please try again.');
    }
  };

  // Save images array to property details JSON
  const saveImagesToProperty = async (imageArray: PropertyImage[]) => {
    try {
      // Get current property details
      const propertyDetails = property.property_details || {};
      
      // Update images in property details with new format (imageFiles)
      const updatedDetails = {
        ...propertyDetails,
        imageFiles: imageArray
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
        console.error('[PropertyImageUpload] Error updating property:', error);
        throw new Error(`Failed to save images: ${error.message}`);
      }
      
    } catch (err) {
      console.error('[PropertyImageUpload] Error saving images to property:', err);
      throw err;
    }
  };

  // Get image URL for display
  const getImageUrl = (image: PropertyImage): string => {
    // First check if we have a cached signed URL
    if (image.id && imageUrls[image.id]) {
      return imageUrls[image.id];
    }
    
    // Check for legacy cases and incompatible formats
    if (!property?.id || !image.fileName || image.fileName.startsWith('legacy-') || image.fileName.startsWith('img-')) {
      return '/noimage.png';
    }
    
    // If we don't have a cached URL yet, show a placeholder temporarily 
    // and the useEffect will update it later when signed URLs are generated
    return '/noimage.png';
  };

  // Video upload handlers
  const handleVideoUploadClick = () => {
    if (!selectedVideoFile) return;
    
    // If there's already a video, show replace confirmation
    if (property.property_video) {
      setReplaceVideoConfirmOpen(true);
    } else {
      startVideoUpload();
    }
  };

  const startVideoUpload = async () => {
    if (!selectedVideoFile) return;
    
    setReplaceVideoConfirmOpen(false);
    await uploadVideo(selectedVideoFile);
  };

  const handleDeleteVideoClick = () => {
    setConfirmDeleteVideoOpen(true);
  };

  const confirmVideoDelete = async () => {
    setConfirmDeleteVideoOpen(false);
    await deleteVideo();
  };

  const clearVideoSelection = () => {
    setSelectedVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    clearError();
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
          <h3 className="text-lg font-medium">Property Media</h3>
          <p className="text-muted-foreground text-sm">
            Manage images and video for this property ({imageCount}/10 images{property.property_video ? ', 1 video' : ''})
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

      {/* Enhanced Upload Dialog with Tabs */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Property Media</DialogTitle>
            <DialogDescription>
              Upload and manage images and videos for your property listing
            </DialogDescription>
          </DialogHeader>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'images'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon className="h-4 w-4 inline-block mr-2" />
              Images ({imageCount})
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'video'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Video className="h-4 w-4 inline-block mr-2" />
              Video {property.property_video ? '(1)' : '(0)'}
            </button>
          </div>
          
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

          {/* Images Tab Content */}
          {activeTab === 'images' && (
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
                        ref={fileInputRef}
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
                            Or click to browse. Supports PNG, JPG, GIF up to 5MB each
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
                    {images.map((image) => {
                      // Get the image URL
                      const imageUrl = getImageUrl(image);
                      
                      return (
                        <div
                          key={image.id}
                          className={`relative group aspect-video rounded-lg overflow-hidden border ${
                            image.isPrimary ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
                          }`}
                        >
                          
                          <img
                            src={imageUrl}
                            alt="Property"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(`[PropertyImageUpload] Image load error for ${image.fileName}`);
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
                      );
                    })}
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
          )}

          {/* Video Tab Content */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Error Display for Video */}
              {uploadError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-700 font-medium">Video Upload Error</p>
                      <p className="text-red-600 text-sm">{uploadError}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Video Display */}
              {property.property_video && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Current Property Video
                      </h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteVideoClick}
                        disabled={isUploadingVideo}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      File: {property.property_video.fileName} • Size: {formatFileSize(property.property_video.fileSize)}
                    </p>
                  </div>
                  
                  <PropertyVideoPlayer
                    video={property.property_video}
                    showControls={true}
                  />
                </div>
              )}

              {/* Video Upload Section */}
              <div>
                <h4 className="font-medium mb-2">
                  {property.property_video ? 'Replace Video' : 'Upload Property Video'}
                </h4>
                {property.property_video && (
                  <p className="text-sm text-orange-600 mb-4">
                    Uploading a new video will replace the existing one.
                  </p>
                )}

                {/* Video File Selection Area */}
                {!selectedVideoFile && (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                      dragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/webm"
                      onChange={handleVideoFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingVideo}
                    />
                    
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          {dragActive ? 'Drop video file here' : 'Upload Property Video'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag and drop your video file here, or click to browse
                        </p>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Supported formats: MP4, MOV, AVI, WebM</p>
                          <p>Maximum size: 2GB</p>
                          <p>One video per property</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Video File Preview */}
                {selectedVideoFile && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-2">Selected Video</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500">File Name:</span>
                              <p className="text-gray-900 truncate">{selectedVideoFile.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">File Size:</span>
                              <p className="text-gray-900">{formatFileSize(selectedVideoFile.size)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Type:</span>
                              <p className="text-gray-900">{selectedVideoFile.type}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Status:</span>
                              <p className="text-green-600 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valid
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearVideoSelection}
                          className="text-gray-500 hover:text-gray-700"
                          disabled={isUploadingVideo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Video Preview */}
                      {videoPreviewUrl && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                          <video
                            src={videoPreviewUrl}
                            className="w-full h-full object-contain"
                            controls
                            preload="metadata"
                            poster={thumbnailUrl || undefined}
                          >
                            Your browser does not support video preview.
                          </video>
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handleVideoUploadClick}
                          disabled={isUploadingVideo}
                          className="flex items-center space-x-2"
                        >
                          {isUploadingVideo ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>{property.property_video ? 'Replace Video' : 'Upload Video'}</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={isUploadingVideo}
                        >
                          Choose Different File
                        </Button>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploadingVideo && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Upload Progress</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Please keep this page open while uploading...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* No Video State */}
                {!property.property_video && !selectedVideoFile && !isUploadingVideo && (
                  <div className="text-center py-8 border rounded-lg">
                    <Video className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No video uploaded</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a video to showcase your property
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setUploadDialogOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteVideoOpen} onOpenChange={setConfirmDeleteVideoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteVideoOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmVideoDelete}
              >
                Delete Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Replace Confirmation Dialog */}
      <Dialog open={replaceVideoConfirmOpen} onOpenChange={setReplaceVideoConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Existing Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              This property already has a video. Uploading a new video will replace the existing one.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setReplaceVideoConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={startVideoUpload}
              >
                Replace Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyImageUpload;