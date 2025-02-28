// src/modules/owner/components/property/PropertyCard.tsx
// Version: 3.1.0
// Last Modified: 28-02-2025 16:45 IST
// Purpose: Modern themed property card with icon-only buttons

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  IndianRupee, 
  MapPin, 
  Loader2, 
  Pencil, 
  Trash2, 
  Globe, 
  Archive,
  Eye
} from 'lucide-react';
import { Property } from './types';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const { isComplete } = completionStatus;
  const isDraft = property.status === 'draft';
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0].url 
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md border border-border/30">
      {/* Status Badge */}
      <div className={cn(
        "absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-medium",
        isDraft 
          ? "bg-accent text-accent-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        {property.status}
      </div>
      
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-card-foreground hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-4 w-4 text-primary/70" />
          <span className="line-clamp-1">
            {property.address}, {property.city}
          </span>
        </div>
        
        <div className="mb-4 flex items-center font-semibold text-lg text-primary">
          <IndianRupee className="mr-1 h-5 w-5" />
          <span>
            {property.price.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Actions - Icon-only buttons */}
        <div className="flex justify-between">
          {/* View Button */}
          <Link 
            to={`/properties/${property.id}`}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            title="View Property"
          >
            <Eye className="h-5 w-5" />
          </Link>
          
          {/* Edit Button */}
          <Link 
            to={`/properties/${property.id}/edit`}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border hover:bg-muted/50 text-card-foreground transition-colors"
            title="Edit Property"
          >
            <Pencil className="h-4.5 w-4.5" />
          </Link>
          
          {/* Publish/Unpublish Button */}
          <button
            onClick={() => onTogglePublish(property.id, property.status)}
            disabled={isDraft && !isComplete || isUpdating}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-full transition-colors",
              isDraft
                ? isComplete 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground/50"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
              isUpdating && "cursor-wait opacity-75"
            )}
            title={isDraft ? "Publish Property" : "Unpublish Property"}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isDraft ? (
              <Globe className="h-5 w-5" />
            ) : (
              <Archive className="h-5 w-5" />
            )}
          </button>
          
          {/* Delete Button */}
          <button
            onClick={() => onDelete(property.id)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border hover:bg-destructive/10 hover:border-destructive/30 text-destructive transition-colors"
            title="Delete Property"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}