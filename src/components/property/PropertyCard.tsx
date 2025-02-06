// src/components/property/PropertyCard.tsx
// Version: 1.5.1
// Last Modified: 07-02-2025 12:30 IST

import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Lock, AlertCircle, CheckCircle2, ImageOff, Trash2, Pencil, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

// Previous interfaces remain the same...

export function PropertyCard({ 
  property, 
  completionStatus: { isComplete, missingFields, hasImages }, 
  onDelete,
  onTogglePublish,
  isUpdating
}: PropertyCardProps) {
  const publishTooltip = !isComplete 
    ? "Complete all required fields to publish" 
    : property.status === 'published' 
      ? "Click to unpublish" 
      : "Click to publish";

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-foreground mb-1">{property.title}</h3>
            <p className="text-sm text-muted-foreground">
              {property.address}, {property.city}, {property.state}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              ₹{property.price.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-4">
            <button
              onClick={() => onTogglePublish(property.id, property.status)}
              disabled={isUpdating || !isComplete}
              title={publishTooltip}
              className={cn(
                "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                property.status === 'published' ? 'bg-primary' : 'bg-muted',
                (!isComplete || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              <span className="sr-only">Toggle publish status</span>
              <span
                className={cn(
                  "pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  property.status === 'published' ? 'translate-x-6' : 'translate-x-0'
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                    property.status === 'published'
                      ? 'opacity-0 duration-100 ease-out'
                      : 'opacity-100 duration-200 ease-in'
                  )}
                >
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                    property.status === 'published'
                      ? 'opacity-100 duration-200 ease-in'
                      : 'opacity-0 duration-100 ease-out'
                  )}
                >
                  <Globe2 className="h-4 w-4 text-primary" />
                </span>
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <Link
                to={`/properties/${property.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-full text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                title="Preview property"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                to={`/properties/${property.id}/edit`}
                className="inline-flex items-center justify-center p-2 rounded-full text-accent-foreground bg-accent hover:bg-accent/90 transition-colors"
                title="Edit property"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                onClick={() => onDelete(property.id)}
                className="inline-flex items-center justify-center p-2 rounded-full text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors"
                title="Delete property"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            {!hasImages && (
              <Link
                to={`/properties/${property.id}/edit?section=images`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                <ImageOff className="h-4 w-4 mr-1.5" />
                <span>No Images</span>
                <Upload className="h-4 w-4 ml-1.5" />
              </Link>
            )}
            {isComplete ? (
              <span className="inline-flex items-center text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                All details complete
              </span>
            ) : (
              <div className="group relative">
                <span className="inline-flex items-center text-sm text-secondary-foreground cursor-help">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  Incomplete details
                </span>
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-card rounded-lg shadow-lg border border-border text-sm text-card-foreground z-10">
                  <p className="font-medium mb-1">Missing requirements:</p>
                  <ul className="list-disc list-inside">
                    {!hasImages && (
                      <li className="flex items-center text-secondary-foreground">
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
    </li>
  );
}