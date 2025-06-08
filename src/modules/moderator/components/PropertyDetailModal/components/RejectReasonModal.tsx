// src/modules/moderator/components/PropertyDetailModal/components/RejectReasonModal.tsx
// Version: 1.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Modal for entering property rejection reason

import React from 'react';
import { Button } from '@/components/ui/button';

interface RejectReasonModalProps {
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function RejectReasonModal({
  rejectReason,
  setRejectReason,
  onCancel,
  onConfirm,
  isProcessing
}: RejectReasonModalProps) {
  return (
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
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectReason.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Rejecting...
              </>
            ) : (
              'Reject Property'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}