// src/modules/moderator/components/PropertyDetailModal.tsx
// Version: 2.0.0
// Last Modified: 25-02-2025 21:30 IST
// Purpose: Enhanced property detail modal with image removal functionality

import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Property } from '@/components/property/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onPropertyUpdated?: () => void;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}

export function PropertyDetailModal({ property, onClose, onPropertyUpdated, onApprove, onReject }: PropertyDetailModalProps) {
  const [isRemovingImage, setIsRemovingImage] = useState<string | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Filter out removed images
  const availableImages = property.images?.filter(img => !removedImageIds.includes(img.id)) || [];
  
  // Check if property is in pending state (draft)
  const isPending = property.status === 'draft';

  const handleRemoveImage = async (imageId: string) => {
    try {
      setIsRemovingImage(imageId);
      
      // Delete from property_images table
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);
        
      if (error) throw error;
      
      // Update local state to reflect the removal
      setRemovedImageIds(prev => [...prev, imageId]);
      
      // Notify parent component about the update
      if (onPropertyUpdated) {
        onPropertyUpdated();
      }
      
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Failed to remove image. Please try again.');
    } finally {
      setIsRemovingImage(null);
    }
  };
  
  // Handle approve action
  const handleApprove = async () => {
    if (!onApprove) return;
    
    try {
      setIsProcessing('approve');
      await onApprove(property.id);
      onClose(); // Close modal after successful approval
    } catch (err) {
      console.error('Error approving property:', err);
      alert('Failed to approve property. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };
  
  // Open reject reason modal
  const handleRejectClick = () => {
    setRejectReasonModalOpen(true);
  };
  
  // Handle reject confirmation
  const confirmReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    
    try {
      setIsProcessing('reject');
      await onReject(property.id, rejectReason);
      setRejectReasonModalOpen(false);
      setRejectReason('');
      onClose(); // Close modal after successful rejection
    } catch (err) {
      console.error('Error rejecting property:', err);
      alert('Failed to reject property. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{property.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Property Images */}
          {availableImages.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Property Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {availableImages.map((image) => (
                  <div key={image.id} className="relative group rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={image.url} 
                      alt={`Property view`} 
                      className="w-full h-64 sm:h-72 object-cover"
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all duration-200 flex items-center justify-center"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={isRemovingImage === image.id}
                      aria-label="Remove image"
                    >
                      {isRemovingImage === image.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Moderation Action Buttons */}
              {isPending && onApprove && onReject && (
                <div className="mt-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Button 
                    variant="success" 
                    onClick={handleApprove}
                    disabled={isProcessing !== null}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 text-lg font-medium flex-1"
                    size="lg"
                  >
                    {isProcessing === 'approve' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      'Approve Property'
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleRejectClick}
                    disabled={isProcessing !== null}
                    className="py-3 px-6 text-lg font-medium flex-1 shadow-md"
                    size="lg"
                  >
                    {isProcessing === 'reject' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      'Reject Property'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="py-3 px-6 text-lg font-medium border-2 border-gray-300 hover:bg-gray-100 flex-1"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">No images available for this property</p>
              
              {/* Moderation Action Buttons for properties without images */}
              {isPending && onApprove && onReject && (
                <div className="mt-6 flex flex-wrap gap-4 p-4">
                  <Button 
                    variant="success" 
                    onClick={handleApprove}
                    disabled={isProcessing !== null}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 text-lg font-medium flex-1"
                    size="lg"
                  >
                    {isProcessing === 'approve' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      'Approve Property'
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleRejectClick}
                    disabled={isProcessing !== null}
                    className="py-3 px-6 text-lg font-medium flex-1 shadow-md"
                    size="lg"
                  >
                    {isProcessing === 'reject' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      'Reject Property'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="py-3 px-6 text-lg font-medium border-2 border-gray-300 hover:bg-gray-100 flex-1"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{property.property_details?.propertyType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">₹{property.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-medium">{property.square_feet ? `${property.square_feet} sq.ft.` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{property.owner_email || 'No Email Available'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Location Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{property.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{property.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{property.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zip Code</p>
                  <p className="font-medium">{property.zip_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Listed</p>
                  <p className="font-medium">
                    {property.created_at 
                      ? new Date(property.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) + ' at ' + new Date(property.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                {property.status === 'published' && property.updated_at && (
                  <div>
                    <p className="text-sm text-gray-500">Date Published</p>
                    <p className="font-medium">
                      {new Date(property.updated_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) + ' at ' + new Date(property.updated_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Description</h3>
            <p className="text-gray-700">{property.description || 'No description provided'}</p>
          </div>
          
          {/* Additional Details */}
          {property.property_details && Object.keys(property.property_details).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Additional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(property.property_details)
                  .filter(([key]) => !['propertyType', 'bhkType', 'locality', 'rentAmount', 'rentalType'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Only show if not in pending state or approval handlers aren't provided */}
        {(!isPending || !onApprove || !onReject) && (
          <div className="border-t p-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="py-2 px-4 text-base font-medium border-2 border-gray-300 hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        )}
        
        {/* Reject Reason Modal */}
        {rejectReasonModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Rejection Reason</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please provide a reason for rejecting this property..."
              />
              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectReasonModalOpen(false);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmReject}
                  disabled={!rejectReason.trim() || isProcessing !== null}
                >
                  Reject Property
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}