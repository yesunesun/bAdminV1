// src/modules/seeker/components/PropertyDetails/SimilarProperties.tsx
// Version: 3.0.0
// Last Modified: 27-01-2025 11:30 IST
// Purpose: Enhanced similar properties component with improved design system and Indian formatting

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ArrowRight,
  Home,
  TrendingUp,
  Star
} from 'lucide-react';
import { 
  spacing, 
  typography, 
  animations,
  cn 
} from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/utils';

interface SimilarProperty {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  rating?: number;
  imageUrl?: string;
}

interface SimilarPropertiesProps {
  properties: SimilarProperty[];
  className?: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ 
  properties,
  className
}) => {
  // Format price with Indian notation
  const formatPrice = (price: number) => {
    return formatIndianCurrency(price, { showSymbol: true, compact: true });
  };

  // Generate property stats text
  const getPropertyStats = (property: SimilarProperty) => {
    const stats = [];
    if (property.bedrooms) stats.push(`${property.bedrooms} bed`);
    if (property.bathrooms) stats.push(`${property.bathrooms} bath`);
    if (property.square_feet) stats.push(`${property.square_feet} sqft`);
    return stats.join(' • ');
  };

  if (!properties || properties.length === 0) {
    return (
      <Card className={cn("border-border/50 shadow-sm", className)}>
        <CardContent className={spacing.cardPadding}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted/50">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className={typography.h3}>Similar Properties</h3>
          </div>
          <div className="text-center py-6">
            <Home className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No similar properties found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 shadow-lg", className)}>
      <CardContent className={spacing.cardPadding}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className={typography.h3}>Similar Properties</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended based on your preferences
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {properties.length} found
          </div>
        </div>
        
        {/* Properties List */}
        <div className={spacing.contentYSmall}>
          {properties.map((property) => (
            <Link 
              key={property.id} 
              to={`/properties/${property.id}`} 
              className={cn(
                "block p-4 border border-border/50 rounded-xl bg-gradient-to-br from-card to-card/50",
                "hover:border-primary/30 hover:shadow-md transition-all duration-200 group",
                animations.hoverLift
              )}
            >
              <div className="flex gap-4">
                {/* Property Image Placeholder */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center overflow-hidden">
                  {property.imageUrl ? (
                    <img 
                      src={property.imageUrl} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="h-6 w-6 text-primary/60" />
                  )}
                </div>
                
                {/* Property Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={cn(
                      typography.body, 
                      "font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                    )}>
                      {property.title}
                    </h4>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {[property.city, property.state].filter(Boolean).join(', ')}
                    </span>
                    {property.rating && (
                      <div className="ml-auto flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-muted-foreground">{property.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={cn(typography.priceSmall, "text-primary font-bold")}>
                      {formatPrice(property.price)}
                    </span>
                    {getPropertyStats(property) && (
                      <span className="text-xs text-muted-foreground">
                        {getPropertyStats(property)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* View More Button */}
        <div className="text-center mt-6 pt-4 border-t border-border/50">
          <Link to="/properties">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "font-medium group border-primary/30 hover:bg-primary hover:text-primary-foreground",
                animations.hoverScale
              )}
            >
              <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Explore All Properties
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs font-medium text-green-800">
                Verified Properties
              </p>
              <p className="text-xs text-green-700 mt-1">
                All recommendations are from verified property owners
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarProperties;