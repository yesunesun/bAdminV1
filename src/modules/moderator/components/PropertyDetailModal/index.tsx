// src/modules/moderator/components/PropertyDetailModal/index.tsx
// Version: 1.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Main property detail modal component that orchestrates the UI

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Property } from '@/components/property/PropertyFormTypes';
import { Button } from '@/components/ui/button';

import { PropertyImageGallery } from './components/PropertyImageGallery';
import { PropertyInfo } from './components/PropertyInfo';
import { RejectReasonModal } from './components/RejectReasonModal';
import { usePropertyImages } from './hooks/usePropertyImages';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onPropertyUpdated?: () => void;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}

export function PropertyDetailModal({
  property,
  onClose,
  onPropertyUpdated,
  onApprove,
  onReject
}: PropertyDetailModalProps) {
  // States for modals and actions
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Use the custom hook to manage property images
  const {
    images,
    isLoading: imagesLoading,
    deletingImageId,
    successfulImageId,
    deleteImage,
    refreshImages
  } = usePropertyImages(property.id);

  // Check if property is in pending state
  const isPending = property.status === 'draft';

  // Handle close and ensure data is refreshed
  const handleClose = () => {
    if (onPropertyUpdated) {
      onPropertyUpdated();
    }
    onClose();
  };

  // Handle approve action
  const handleApprove = async () => {
    if (!onApprove) return;
    
    try {
      setIsProcessing('approve');
      await onApprove(property.id);
      onClose();
    } catch (err) {
      console.error('Error approving property:', err);
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
      onClose();
    } catch (err) {
      console.error('Error rejecting property:', err);
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
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Property Images */}
          <PropertyImageGallery 
            images={images}
            deletingImageId={deletingImageId}
            successfulImageId={successfulImageId}
            onDeleteImage={deleteImage}
            isLoading={imagesLoading}
          />
          
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
                onClick={handleClose} 
                className="py-3 px-6 text-lg font-medium border-2 border-gray-300 hover:bg-gray-100 flex-1"
                size="lg"
              >
                Close
              </Button>
            </div>
          )}
          
          {/* Property Information */}
          <PropertyInfo property={property} />
        </div>
        
        {/* Footer - Only show if not in pending state */}
        {(!isPending || !onApprove || !onReject) && (
          <div className="border-t p-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="py-2 px-4 text-base font-medium border-2 border-gray-300 hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        )}
        
        {/* Reject Reason Modal */}
        {rejectReasonModalOpen && (
          <RejectReasonModal
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onCancel={() => {
              setRejectReasonModalOpen(false);
              setRejectReason('');
            }}
            onConfirm={confirmReject}
            isProcessing={isProcessing === 'reject'}
          />
        )}
      </div>
    </div>
  );
}