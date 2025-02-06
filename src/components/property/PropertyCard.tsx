// src/components/property/PropertyCard.tsx
// Version: 1.6.2
// Last Modified: 07-02-2025 16:30 IST

import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Lock, AlertCircle, CheckCircle2, ImageOff, Trash2, Pencil, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertyCard({ 
  property, 
  completionStatus: { isComplete, missingFields, hasImages }, 
  onDelete,
  onTogglePublish,
  isUpdating
}: PropertyCardProps) {
  const defaultImage = property.images?.[0]?.url;
  const isDark = defaultImage ? 'text-white' : 'text-card-foreground';

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl",
      "bg-card h-[280px] flex flex-col justify-end",
      isDark
    )}>
      {defaultImage && (
        <div className="absolute inset-0">
          <img 
            src={defaultImage} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}
      
      {/* Visibility Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => onTogglePublish(property.id, property.status)}
          disabled={isUpdating || !isComplete}
          className={cn(
            "h-8 px-3 rounded-full transition-colors text-sm font-medium",
            property.status === 'published' 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
            (!isComplete || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            {property.status === 'published' ? (
              <>
                <Globe2 className="h-4 w-4" />
                Make Private
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Make Public
              </>
            )}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="relative p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
          <p className={cn(
            "text-sm font-bold",
            defaultImage ? "text-white" : "text-foreground"
          )}>
            ₹{property.price.toLocaleString('en-IN')}
          </p>
        </div>

        <p className={cn(
          "text-sm line-clamp-1",
          defaultImage ? "text-white/90" : "text-muted-foreground"
        )}>
          {property.address}, {property.city}
        </p>

        {/* Property Details */}
        <div className={cn(
          "flex items-center gap-4 text-sm",
          defaultImage ? "text-white/90" : "text-muted-foreground"
        )}>
          <span>{property.bedrooms} BHK</span>
          <span>{property.square_feet} sq.ft</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {!isComplete && (
              <div className="group/tooltip relative">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <div className="hidden group-hover/tooltip:block absolute left-0 bottom-full mb-2 w-48 p-2 bg-popover rounded-lg shadow-lg border border-border text-sm text-popover-foreground z-20">
                  <ul className="space-y-1 text-xs">
                    {missingFields.slice(0, 3).map(field => (
                      <li key={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</li>
                    ))}
                    {missingFields.length > 3 && <li>...and {missingFields.length - 3} more</li>}
                  </ul>
                </div>
              </div>
            )}
            {!hasImages && (
              <Link
                to={`/properties/${property.id}/edit?section=images`}
                className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
                title="Add images"
              >
                <ImageOff className="h-4 w-4" />
                <Upload className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/properties/${property.id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/properties/${property.id}/edit`}
              className="p-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(property.id)}
              className="p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}