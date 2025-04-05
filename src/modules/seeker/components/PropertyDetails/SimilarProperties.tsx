// src/modules/seeker/components/PropertyDetails/SimilarProperties.tsx
// Version: 2.0.0
// Last Modified: 06-04-2025 11:30 IST
// Purpose: Modernized the component with better font sizing and consistent styling

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for similar properties
interface SimilarProperty {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
}

interface SimilarPropertiesProps {
  properties: SimilarProperty[];
  className?: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ 
  properties,
  className
}) => {
  // Format price with Indian notation (₹)
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  return (
    <Card className={cn("border-border/40 shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">
            Similar Properties
            <span className="text-xs text-muted-foreground ml-2 font-normal">(Recommended)</span>
          </h3>
        </div>
        <div className="space-y-3" data-testid="similar-properties">
          {properties.map((property) => (
            <Link 
              key={property.id} 
              to={`/properties/${property.id}`} 
              className="p-3 border border-muted rounded-md bg-card hover:bg-accent/5 transition-colors block"
            >
              <h4 className="font-medium text-sm">{property.title}</h4>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{[property.city, property.state].filter(Boolean).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-primary text-sm">{formatPrice(property.price)}</span>
                <div className="text-xs text-muted-foreground">
                  {property.bedrooms && `${property.bedrooms} bed`} 
                  {property.bathrooms && ` • ${property.bathrooms} bath`} 
                  {property.square_feet && ` • ${property.square_feet} sqft`}
                </div>
              </div>
            </Link>
          ))}
          
          <div className="text-center mt-4">
            <Link 
              to="/properties" 
              className="text-xs text-primary hover:underline font-medium"
            >
              View more properties
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarProperties;