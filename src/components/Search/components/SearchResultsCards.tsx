// src/components/Search/components/SearchResultsCards.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 17:00 IST
// Purpose: Card view for search results using PropertyItem component

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SearchResult } from '../types/search.types';
import PropertyItem from '@/modules/seeker/components/PropertyItem';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { adaptSearchResultsToPropertyTypes } from '../services/searchDataAdapter';

interface SearchResultsCardsProps {
  results: SearchResult[];
  loading: boolean;
  totalCount: number;
  onViewDetails?: (propertyId: string) => void;
  onContactOwner?: (propertyId: string) => void;
}

const SearchResultsCards: React.FC<SearchResultsCardsProps> = ({
  results,
  loading,
  totalCount,
  onViewDetails,
  onContactOwner
}) => {
  // State for managing hover and favorite states
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set());

  // Convert SearchResults to PropertyType format
  const adaptedProperties = adaptSearchResultsToPropertyTypes(results);

  // Handle property hover
  const handleHover = (propertyId: string, isHovering: boolean) => {
    setHoveredProperty(isHovering ? propertyId : null);
  };

  // Handle property selection (View Details)
  const handleSelect = (property: PropertyType) => {
    console.log('Property selected:', property.id);
    if (onViewDetails) {
      onViewDetails(property.id);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (propertyId: string, isLiked: boolean): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLikedProperties(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(propertyId);
        } else {
          newSet.add(propertyId);
        }
        return newSet;
      });
      
      console.log(`Property ${propertyId} ${isLiked ? 'removed from' : 'added to'} favorites`);
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  // Handle share
  const handleShare = (e: React.MouseEvent, property: PropertyType) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Share property:', property.id);
    
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: `${window.location.origin}/seeker/property/${property.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/seeker/property/${property.id}`);
      console.log('Property link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Searching properties...</span>
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Properties Found</h3>
        <p className="text-slate-600">
          No properties match your current search criteria. Try adjusting your filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adaptedProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <PropertyItem
              property={property}
              isLiked={likedProperties.has(property.id)}
              isHovered={hoveredProperty === property.id}
              onHover={handleHover}
              onSelect={handleSelect}
              onFavoriteToggle={handleFavoriteToggle}
              onShare={handleShare}
            />
          </Card>
        ))}
      </div>

      {/* Load More Button (for future pagination) */}
      {results.length > 0 && results.length < totalCount && (
        <div className="text-center py-6">
          <Card className="p-4 bg-slate-50">
            <p className="text-sm text-slate-600 mb-3">
              Showing {results.length} of {totalCount} properties
            </p>
            <button 
              className="text-blue-600 hover:underline font-medium"
              onClick={() => console.log('Load more properties')}
            >
              Load More Properties
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchResultsCards;