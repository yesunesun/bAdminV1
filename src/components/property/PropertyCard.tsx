// src/components/property/PropertyCard.tsx
// Version: 1.2.0
// Last Modified: 2025-02-01T20:30:00+05:30 (IST)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe2, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ImageOff, 
  Trash2, 
  Pencil, 
  Eye,
  Clock,
  XCircle,
  User,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyCardProps, PropertyStatus } from './types';

export function PropertyCard({ 
  property, 
  completionStatus: { isComplete, missingFields, hasImages }, 
  onDelete,
  onTogglePublish,
  isUpdating,
  showOwnerInfo = false
}: PropertyCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusConfig = (status: PropertyStatus) => {
    const configs = {
      draft: {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: Lock,
        label: 'Draft'
      },
      pending_review: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: Clock,
        label: 'Pending Review'
      },
      rejected: {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: XCircle,
        label: 'Rejected'
      },
      published: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: Globe2,
        label: 'Published'
      }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(property.status);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = (newStatus: PropertyStatus) => {
    if (newStatus === 'rejected' && !rejectionReason) {
      setShowRejectModal(true);
    } else {
      onTogglePublish(property.id, newStatus, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  return (
    <li className="hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{property.title}</h3>
            <p className="text-sm text-gray-500">
              {property.address}, {property.city}, {property.state}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              ₹{property.price.toLocaleString('en-IN')}
            </p>
            {showOwnerInfo && property.ownerDetails && (
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1.5" />
                  {property.ownerDetails.email}
                </span>
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1.5" />
                  {property.ownerDetails.phone}
                </span>
              </div>
            )}
            {property.rejection_reason && (
              <div className="mt-2 text-sm text-red-600">
                <p className="font-medium">Rejection Reason:</p>
                <p>{property.rejection_reason}</p>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-4">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusConfig.bgColor,
              statusConfig.color
            )}>
              <StatusIcon className="h-4 w-4 mr-1.5" />
              {statusConfig.label}
            </span>
            
            {property.status === 'pending_review' && showOwnerInfo && (
              <>
                <button
                  onClick={() => handleStatusChange('published')}
                  className="inline-flex items-center p-2 border border-transparent rounded-full 
                    shadow-sm text-white bg-green-600 hover:bg-green-700"
                  title="Approve property"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="inline-flex items-center p-2 border border-transparent rounded-full 
                    shadow-sm text-white bg-red-600 hover:bg-red-700"
                  title="Reject property"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}

            {(!showOwnerInfo || property.status === 'rejected') && (
              <>
                <Link
                  to={`/properties/${property.id}/preview`}
                  className="inline-flex items-center p-2 border border-transparent rounded-full 
                    shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  title="Preview property"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  to={`/properties/${property.id}/edit`}
                  className="inline-flex items-center p-2 border border-transparent rounded-full 
                    shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  title="Edit property"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete(property.id)}
                  className="inline-flex items-center p-2 border border-transparent rounded-full 
                    shadow-sm text-white bg-red-600 hover:bg-red-700"
                  title="Delete property"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Property Completion Status */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            {!hasImages && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                bg-amber-100 text-amber-800">
                <ImageOff className="h-4 w-4 mr-1.5" />
                No Images
              </span>
            )}
            {isComplete ? (
              <span className="inline-flex items-center text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                All details complete
              </span>
            ) : (
              <div className="group relative">
                <span className="inline-flex items-center text-sm text-amber-600 cursor-help">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  Incomplete details
                </span>
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 
                  bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 z-10">
                  <p className="font-medium mb-1">Missing requirements:</p>
                  <ul className="list-disc list-inside">
                    {!hasImages && (
                      <li className="flex items-center text-amber-600">
                        <ImageOff className="h-4 w-4 mr-1.5" />
                        Property images required
                      </li>
                    )}
                    {missingFields.map(field => (
                      <li key={field} className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Reject Property</h3>
            <div className="mt-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                Reason for rejection
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                  focus:ring-indigo-500 sm:text-sm"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                  rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}