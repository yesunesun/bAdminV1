// src/modules/owner/components/property/PropertyCard.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 17:00 IST
// Purpose: Card component for displaying property listings

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, IndianRupee, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Property } from './types';

interface PropertyCardProps {
  property: Property;
  completionStatus: {
    isComplete: boolean;
    missingFields: string[];
    hasImages: boolean;
  };
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: 'draft' | 'published') => void;
  isUpdating: boolean;
}

export function PropertyCard({ 
  property, 
  completionStatus, 
  onDelete, 
  onTogglePublish,
  isUpdating
}: PropertyCardProps) {
  const { isComplete, missingFields, hasImages } = completionStatus;
  const isDraft = property.status === 'draft';
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0].url 
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow transition-all hover:shadow-md">
      {/* Status Badge */}
      <div className={cn(
        "absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium",
        isDraft 
          ? "bg-amber-100 text-amber-800" 
          : "bg-green-100 text-green-800"
      )}>
        {property.status}
      </div>
      
      {/* Property Image */}
      <div className="relative h-40 overflow-hidden">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Home className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-primary">
            {property.title}
          </h3>
        </Link>
        
        <div className="mb-2 flex items-center text-sm text-gray-500">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {property.address}, {property.city}
          </span>
        </div>
        
        <div className="mb-3 flex items-center font-semibold text-primary">
          <IndianRupee className="mr-1 h-4 w-4" />
          <span>
            {property.price.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Completion Status for Draft Properties */}
        {isDraft && (
          <div className={cn(
            "mb-3 rounded-md p-2 text-xs",
            isComplete 
              ? "bg-green-50 text-green-700" 
              : "bg-amber-50 text-amber-700"
          )}>
            {isComplete ? (
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                <span>Ready to publish</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  <span>Incomplete listing</span>
                </div>
                <ul className="mt-1 ml-4 list-disc">
                  {!hasImages && <li>Add at least one image</li>}
                  {missingFields.slice(0, 2).map(field => (
                    <li key={field}>Add {field.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                  ))}
                  {missingFields.length > 2 && <li>...and {missingFields.length - 2} more fields</li>}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Link 
            to={`/properties/${property.id}/edit`}
            className="flex-1 rounded-md border bg-white px-3 py-1.5 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Edit
          </Link>
          
          <button
            onClick={() => onTogglePublish(property.id, property.status)}
            disabled={isDraft && !isComplete || isUpdating}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium shadow-sm",
              isDraft
                ? isComplete 
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200",
              isUpdating && "cursor-wait opacity-75"
            )}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                Updating...
              </span>
            ) : isDraft ? "Publish" : "Unpublish"}
          </button>
          
          <button
            onClick={() => onDelete(property.id)}
            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}