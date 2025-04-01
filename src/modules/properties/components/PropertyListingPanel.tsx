// src/modules/properties/components/PropertyListingPanel.tsx
// Version: 3.0.0
// Last Modified: 02-04-2025 18:15 IST
// Purpose: Simplified panel focused on property listings without filters

import React from 'react';
import { Button } from '@/components/ui/button';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';

interface PropertyListingPanelProps {
  properties: PropertyType[];
  loading: boolean;
  onFavoriteAction: (propertyId: string) => boolean;
  handlePropertyHover: (id: string, isHovered: boolean) => void;
  hoveredProperty: string | null;
  setActiveProperty: (property: PropertyType | null) => void;
}

const PropertyListingPanel: React.FC<PropertyListingPanelProps> = ({
  properties,
  loading,
  onFavoriteAction,
  handlePropertyHover,
  hoveredProperty,
  setActiveProperty
}) => {
  return (
    <div className="w-full lg:w-1/3 h-full flex flex-col bg-card overflow-hidden border-r">
      {/* Property Count Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {loading ? 'Searching...' : `${properties.length} Properties`}
          </span>
          
          <span className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : 'Click on map or list to view details'}
          </span>
        </div>
      </div>

      {/* Property Listings */}
      <div className="flex-grow overflow-y-auto p-3">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : properties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search filters to find properties
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => {
                  handlePropertyHover(property.id, true);
                  // Show on map when hovering
                  setActiveProperty(property);
                }}
                onMouseLeave={() => {
                  handlePropertyHover(property.id, false);
                  // Don't hide on map when no longer hovering
                  // setActiveProperty(null);
                }}
                className={`transition-shadow duration-200 ${
                  hoveredProperty === property.id ? 'shadow-lg ring-2 ring-primary/20 rounded-lg' : ''
                }`}
              >
                <PropertyCard 
                  property={property} 
                  onFavorite={onFavoriteAction}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t">
        <Link to="/seeker">
          <Button className="w-full">View All Properties</Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyListingPanel;