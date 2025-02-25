// src/modules/moderator/components/property-approval/RejectReasonModal.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 20:30 IST
// Purpose: Modal for providing rejection reason when rejecting a property

import React from 'react';
import { Button } from '@/components/ui/button';

interface RejectReasonModalProps {
  isOpen: boolean;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function RejectReasonModal({
  isOpen,
  rejectReason,
  setRejectReason,
  onCancel,
  onConfirm
}: RejectReasonModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Rejection Reason</h3>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Please provide a reason for rejecting this property..."
          aria-label="Rejection reason"
        />
        <div className="mt-4 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectReason.trim()}
          >
            Reject Property
          </Button>
        </div>
      </div>
    </div>
  );
}