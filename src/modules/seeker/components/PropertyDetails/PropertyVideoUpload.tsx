// src/modules/seeker/components/PropertyDetails/PropertyVideoUpload.tsx
// Version: 1.0.0
// Last Modified: 26-05-2025 17:30 IST
// Purpose: Production-ready video upload component with permissions and validation

import React, { useState, useRef } from 'react';
import { Upload, Video, Trash2, AlertCircle, CheckCircle, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import { propertyVideoStorage } from '@/lib/supabase';
import { PropertyVideo } from '../../hooks/usePropertyDetails';
import PropertyVideoPlayer from './PropertyVideoPlayer';

interface PropertyVideoUploadProps {
  propertyId: string;
  ownerId: string;
  currentVideo?: PropertyVideo | null;
  onVideoUploaded?: () => void;
  onVideoDeleted?: () => void;
  onError?: (error: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function PropertyVideoUpload({
  propertyId,
  ownerId,
  currentVideo,
  onVideoUploaded,
  onVideoDeleted,
  onError
}: PropertyVideoUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);

  // Check permissions
  const isOwner = user?.id === ownerId;
  const isAdmin = user?.user_metadata?.is_admin || user?.user_metadata?.role === 'admin';
  const canUpload = isOwner || isAdmin;

  // Video upload hook
  const {
    isUploading,
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
    propertyId,
    (videoData) => {
      console.log('Video upload completed:', videoData);
      toast({
        title: "Video Uploaded Successfully",
        description: `Your property video has been uploaded (${formatFileSize(videoData.fileSize)})`,
        variant: "default"
      });
      
      // Clear selected file and preview
      setSelectedFile(null);
      setPreviewUrl(null);
      
      if (onVideoUploaded) {
        onVideoUploaded();
      }
    },
    (error) => {
      console.error('Video upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error,
        variant: "destructive"
      });
      
      if (onError) {
        onError(error);
      }
    },
    () => {
      console.log('Video deleted successfully');
      toast({
        title: "Video Deleted",
        description: "Property video has been removed successfully",
        variant: "default"
      });
      
      if (onVideoDeleted) {
        onVideoDeleted();
      }
    }
  );

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
    
    // Reset input value for repeated selection of same file
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleFileSelection = async (file: File) => {
    // Validate file
    const validation = propertyVideoStorage.validateVideoFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Generate preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Generate thumbnail for preview
    try {
      const thumbnail = await generateThumbnail(file);
      console.log('Generated thumbnail:', thumbnail ? 'success' : 'failed');
    } catch (error) {
      console.warn('Thumbnail generation failed:', error);
    }
  };

  const handleUploadClick = () => {
    if (!selectedFile) return;
    
    // If there's already a video, show replace confirmation
    if (currentVideo) {
      setReplaceConfirmOpen(true);
    } else {
      startUpload();
    }
  };

  const startUpload = async () => {
    if (!selectedFile) return;
    
    setReplaceConfirmOpen(false);
    await uploadVideo(selectedFile);
  };

  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setConfirmDeleteOpen(false);
    await deleteVideo();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    clearError();
  };

  // Don't show upload interface if user doesn't have permission
  if (!canUpload) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Current Video Display */}
      {currentVideo && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Property Video
              </h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Video
              </Button>
            </div>
          </div>
          
          <PropertyVideoPlayer
            video={currentVideo}
            showControls={true}
          />
        </Card>
      )}

      {/* Upload Interface */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {currentVideo ? 'Replace Video' : 'Add Property Video'}
          </h3>
          {currentVideo && (
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Uploading will replace existing video
            </span>
          )}
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Upload Error</p>
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

        {/* File Selection Area */}
        {!selectedFile && (
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
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={propertyVideoStorage.ALLOWED_FORMATS.join(',')}
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
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

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Video</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">File Name:</span>
                      <p className="text-gray-900 truncate">{selectedFile.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">File Size:</span>
                      <p className="text-gray-900">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Type:</span>
                      <p className="text-gray-900">{selectedFile.type}</p>
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
                  onClick={clearSelection}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Video Preview */}
              {previewUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                  <video
                    src={previewUrl}
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
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{currentVideo ? 'Replace Video' : 'Upload Video'}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Choose Different File
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
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
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace Confirmation Dialog */}
      <Dialog open={replaceConfirmOpen} onOpenChange={setReplaceConfirmOpen}>
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
                onClick={() => setReplaceConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={startUpload}
              >
                Replace Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}