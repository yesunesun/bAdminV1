// src/components/ImageUpload.tsx
// Version: 2.0.0
// Last Modified: 30-04-2025 19:45 IST
// Purpose: Enhanced image upload with removal callback and better error handling

import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
 propertyId: string;
 onUploadComplete?: (imageUrl: string) => void;
 onImageRemoved?: () => void;
 onError?: (errorMessage: string) => void;
}

export default function ImageUpload({ 
 propertyId, 
 onUploadComplete, 
 onImageRemoved, 
 onError 
}: ImageUploadProps) {
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState('');
 const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string }[]>([]);
 const [dragActive, setDragActive] = useState(false);

 useEffect(() => {
   const fetchExistingImages = async () => {
     if (!propertyId) return;

     try {
       const { data: imagesData, error: imagesError } = await supabase
         .from('property_images')
         .select('id, url, is_primary, display_order')
         .eq('property_id', propertyId)
         .order('display_order', { ascending: true });

       if (imagesError) throw imagesError;
       
       console.log('Fetched property images:', imagesData?.length || 0);
       setUploadedImages(imagesData || []);
     } catch (err) {
       console.error('Error fetching images:', err);
       setError('Failed to load existing images');
       if (onError) {
         onError('Failed to load existing images');
       }
     }
   };

   fetchExistingImages();
 }, [propertyId, onError]);

 const handleDrag = (e: React.DragEvent) => {
   e.preventDefault();
   e.stopPropagation();
   if (e.type === "dragenter" || e.type === "dragover") {
     setDragActive(true);
   } else if (e.type === "dragleave") {
     setDragActive(false);
   }
 };

 const handleDrop = (e: React.DragEvent) => {
   e.preventDefault();
   e.stopPropagation();
   setDragActive(false);
   
   const files = Array.from(e.dataTransfer.files);
   handleFiles(files);
 };

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
   const files = event.target.files ? Array.from(event.target.files) : [];
   handleFiles(files);
   
   // Reset the input value so the same file can be selected again if needed
   if (event.target) {
     event.target.value = '';
   }
 };

 const handleFiles = async (files: File[]) => {
   if (!propertyId) {
     const errorMsg = 'Property ID is required for uploading images';
     setError(errorMsg);
     if (onError) onError(errorMsg);
     return;
   }

   if (files.length === 0) {
     return; // No files selected, just return silently
   }

   const imageFiles = files.filter(file => file.type.startsWith('image/'));
   if (imageFiles.length === 0) {
     const errorMsg = 'Please select only image files.';
     setError(errorMsg);
     if (onError) onError(errorMsg);
     return;
   }

   // Check file sizes (limit to 5MB per file)
   const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
   if (oversizedFiles.length > 0) {
     const errorMsg = 'Some files exceed the 5MB size limit.';
     setError(errorMsg);
     if (onError) onError(errorMsg);
     return;
   }

   for (const file of imageFiles) {
     await uploadFile(file);
   }
 };

 const uploadFile = async (file: File) => {
   if (!propertyId) return;

   try {
     setError('');
     setUploading(true);

     // Log file details for debugging
     console.log('Preparing to upload file:', { 
       name: file.name, 
       size: file.size, 
       type: file.type,
       lastModified: new Date(file.lastModified).toISOString()
     });

     // Generate a unique filename to avoid collisions
     const timestamp = new Date().getTime();
     const randomId = Math.random().toString(36).substring(2, 10);
     const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
     const fileName = `${propertyId}/${timestamp}-${randomId}.${fileExt}`;

     console.log('Uploading file with name:', fileName);

     // Attempt to upload to Supabase Storage
     const { data: uploadData, error: uploadError } = await supabase.storage
       .from('property-images')
       .upload(fileName, file, {
         cacheControl: '3600',
         upsert: false
       });

     if (uploadError) {
       console.error('Supabase storage upload error:', uploadError);
       throw new Error(`Upload failed: ${uploadError.message}`);
     }

     console.log('Upload successful:', uploadData);

     // Get the public URL for the uploaded file
     const { data: { publicUrl } } = supabase.storage
       .from('property-images')
       .getPublicUrl(fileName);

     console.log('Public URL generated:', publicUrl);

     // Get the next display order
     let nextDisplayOrder = 1;
     if (uploadedImages.length > 0) {
       const maxOrder = Math.max(...uploadedImages.map(img => img.display_order || 0));
       nextDisplayOrder = maxOrder + 1;
     }

     // Store the image reference in the database
     const { error: dbError, data: imageRecord } = await supabase
       .from('property_images')
       .insert([
         {
           property_id: propertyId,
           url: publicUrl,
           is_primary: uploadedImages.length === 0, // Set as primary if it's the first image
           display_order: nextDisplayOrder
         }
       ])
       .select()
       .single();

     if (dbError) {
       console.error('Database insert error:', dbError);
       throw new Error(`Database update failed: ${dbError.message}`);
     }

     console.log('Database record created:', imageRecord);

     // Update local state with the new image
     setUploadedImages(prev => [...prev, imageRecord]);
     
     // Callback to parent component
     if (onUploadComplete) {
       onUploadComplete(publicUrl);
     }
   } catch (err) {
     console.error('Error uploading image:', err);
     const errorMessage = err instanceof Error 
       ? err.message 
       : 'Failed to upload image. Please try again.';
     
     setError(errorMessage);
     if (onError) onError(errorMessage);
   } finally {
     setUploading(false);
   }
 };

 const handleRemoveImage = async (imageId: string) => {
   try {
     console.log('Attempting to remove image with ID:', imageId);
     
     const { error } = await supabase
       .from('property_images')
       .delete()
       .eq('id', imageId);

     if (error) {
       console.error('Error deleting image from database:', error);
       throw error;
     }

     // NOTE: We're not deleting the actual file from storage to keep it simple
     // In a production app, you might want to also remove the file from storage

     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
     console.log('Image successfully removed');
     
     // Call the onImageRemoved callback if provided
     if (onImageRemoved) {
       onImageRemoved();
     }
   } catch (err) {
     console.error('Error removing image:', err);
     const errorMessage = 'Failed to remove image. Please try again.';
     setError(errorMessage);
     if (onError) onError(errorMessage);
   }
 };

 const handleSetPrimaryImage = async (imageId: string) => {
   try {
     console.log('Setting image as primary:', imageId);
     
     // First, find the image to make sure it exists
     const imageToPromote = uploadedImages.find(img => img.id === imageId);
     if (!imageToPromote) {
       throw new Error('Image not found');
     }
     
     // Start a transaction using Supabase's batched updates
     // 1. Clear is_primary from all images for this property
     const { error: clearError } = await supabase
       .from('property_images')
       .update({ is_primary: false })
       .eq('property_id', propertyId);
       
     if (clearError) {
       console.error('Error clearing primary flags:', clearError);
       throw clearError;
     }
     
     // 2. Set the selected image as primary
     const { error: setError } = await supabase
       .from('property_images')
       .update({ is_primary: true })
       .eq('id', imageId);
       
     if (setError) {
       console.error('Error setting primary image:', setError);
       throw setError;
     }
     
     // Update local state
     const updatedImages = uploadedImages.map(img => ({
       ...img,
       is_primary: img.id === imageId
     }));
     
     setUploadedImages(updatedImages);
     
     console.log('Primary image updated successfully');
     
     // Notify of the change
     if (onImageRemoved) {
       // We're using the same callback since it triggers a refresh
       onImageRemoved();
     }
     
   } catch (err) {
     console.error('Error setting primary image:', err);
     const errorMessage = 'Failed to set primary image. Please try again.';
     setError(errorMessage);
     if (onError) onError(errorMessage);
   }
 };

 return (
   <div className="space-y-6">
     {error && (
       <div className="flex items-center text-sm text-red-600 bg-red-50 rounded-lg p-4">
         <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
         <div className="flex-1">
           <p className="font-medium">Upload Error</p>
           <p>{error}</p>
         </div>
         <button 
           onClick={() => setError('')}
           className="ml-auto text-red-500 hover:text-red-700"
         >
           <X className="h-4 w-4" />
         </button>
       </div>
     )}

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
             Or click to browse. Supports PNG, JPG, GIF up to 5MB each
           </p>
         </div>
       </div>
     </div>

     {uploadedImages.length > 0 && (
       <div>
         <h3 className="text-sm font-medium text-slate-700 mb-3">
           Current Images ({uploadedImages.length})
         </h3>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {uploadedImages.map((image) => (
             <div
               key={image.id}
               className={`relative group aspect-video rounded-lg overflow-hidden border ${
                 image.is_primary ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
               }`}
             >
               <img
                 src={image.url}
                 alt="Property"
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.currentTarget.src = '/noimage.png';
                 }}
               />
               <div className="absolute top-2 right-2 flex space-x-1">
                 {!image.is_primary && (
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
               {image.is_primary && (
                 <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                   Main Photo
                 </div>
               )}
             </div>
           ))}
         </div>
       </div>
     )}

     {uploadedImages.length === 0 && !uploading && (
       <div className="text-center py-12 border rounded-lg">
         <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
         <h3 className="mt-2 text-sm font-medium text-slate-900">No uploaded images</h3>
         <p className="mt-1 text-sm text-slate-500">
           Upload images to showcase your property
         </p>
       </div>
     )}

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
 );
}