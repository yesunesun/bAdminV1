// src/modules/seeker/components/PropertyDetails/GalleryDebug.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 11:45 IST
// Purpose: Debug component to troubleshoot gallery image issues

import React from 'react';
import { Card } from '@/components/ui/card';
import { PropertyImage, PropertyVideo } from '../../hooks/usePropertyDetails';

interface GalleryDebugProps {
  images: PropertyImage[];
  video?: PropertyVideo | null;
  propertyDetails?: any;
}

const GalleryDebug: React.FC<GalleryDebugProps> = ({ images, video, propertyDetails }) => {
  return (
    <Card className="p-4 mb-4 border-orange-200 bg-orange-50">
      <h3 className="font-semibold text-orange-800 mb-3">Gallery Debug Info</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Images passed to gallery:</span>
          <p className="text-gray-900">{images?.length || 0} images</p>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Video passed to gallery:</span>
          <p className="text-gray-900">{video ? 'Yes' : 'No'}</p>
          {video && (
            <p className="text-xs text-gray-600">Video URL: {video.url?.substring(0, 50)}...</p>
          )}
        </div>
        
        {images && images.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">First image details:</span>
            <div className="pl-4 space-y-1 text-xs">
              <p>ID: {images[0].id}</p>
              <p>URL: {images[0].url ? images[0].url.substring(0, 50) + '...' : 'None'}</p>
              <p>DataURL: {images[0].dataUrl ? 'Present (' + images[0].dataUrl.length + ' chars)' : 'None'}</p>
              <p>FileName: {images[0].fileName || 'None'}</p>
              <p>Primary: {images[0].isPrimary ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
        
        <div>
          <span className="font-medium text-gray-700">Property Details Structure:</span>
          <div className="pl-4 space-y-1 text-xs">
            <p>Has property_details: {propertyDetails ? 'Yes' : 'No'}</p>
            {propertyDetails && (
              <>
                <p>Has imageFiles: {propertyDetails.imageFiles ? `Yes (${propertyDetails.imageFiles.length})` : 'No'}</p>
                <p>Has images: {propertyDetails.images ? `Yes (${propertyDetails.images.length})` : 'No'}</p>
                <p>Has media: {propertyDetails.media ? 'Yes' : 'No'}</p>
                {propertyDetails.media && (
                  <p>Has media.photos: {propertyDetails.media.photos ? 'Yes' : 'No'}</p>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Test Images Display */}
        {images && images.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Image Test Display:</span>
            <div className="flex gap-2 mt-2">
              {images.slice(0, 3).map((img, idx) => {
                const imageUrl = img.dataUrl || img.url;
                return (
                  <div key={idx} className="w-16 h-16 border border-gray-300 rounded overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`Test ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`[GalleryDebug] Image ${idx} failed to load:`, imageUrl);
                          e.currentTarget.src = '/noimage.png';
                        }}
                        onLoad={() => {
                          console.log(`[GalleryDebug] Image ${idx} loaded successfully`);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                        No URL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GalleryDebug;