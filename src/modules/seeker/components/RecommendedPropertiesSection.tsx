// src/modules/seeker/components/RecommendedPropertiesSection.tsx
// Version: 1.0.0
// Created: 13-07-2025
// Purpose: Showcase recommended and premium properties in dedicated sections

import React, { useState } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { EnhancedProperty } from '../services/recommendationService';
import PropertyItem from './PropertyItem';
import { 
  Star, 
  Crown, 
  Zap, 
  TrendingUp, 
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecommendedPropertiesSectionProps {
  recommendedProperties: PropertyType[];
  premiumProperties: PropertyType[];
  sponsoredProperties: PropertyType[];
  userPreferences?: any;
  onPropertySelect?: (property: PropertyType) => void;
  onPropertyHover?: (propertyId: string, isHovering: boolean) => void;
  hoveredProperty?: string | null;
}

const RecommendedPropertiesSection: React.FC<RecommendedPropertiesSectionProps> = ({
  recommendedProperties,
  premiumProperties,
  sponsoredProperties,
  userPreferences,
  onPropertySelect = () => {},
  onPropertyHover = () => {},
  hoveredProperty = null
}) => {
  
  const [activeTab, setActiveTab] = useState<'recommended' | 'premium' | 'sponsored'>('recommended');
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Handle share action
  const handleShare = (e: React.MouseEvent, property: PropertyType) => {
    e.preventDefault();
    e.stopPropagation();
    
    const propertyLink = `${window.location.origin}/seeker/property/${property.id}`;
    const propertyTitle = property.title;
    
    if (navigator.share) {
      navigator.share({
        title: propertyTitle,
        text: `Check out this property: ${propertyTitle}`,
        url: propertyLink,
      }).catch(err => console.error('Error sharing property:', err));
    } else {
      navigator.clipboard.writeText(propertyLink);
    }
  };

  // Get current properties based on active tab
  const getCurrentProperties = () => {
    switch (activeTab) {
      case 'recommended':
        return recommendedProperties;
      case 'premium':
        return premiumProperties;
      case 'sponsored':
        return sponsoredProperties;
      default:
        return recommendedProperties;
    }
  };

  const currentProperties = getCurrentProperties();

  // Handle scroll for horizontal property list
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`properties-scroll-${activeTab}`);
    if (container) {
      const scrollAmount = 320; // Width of one property card
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'recommended' as const,
      label: 'Recommended for You',
      icon: <Star className="h-4 w-4" />,
      count: recommendedProperties.length,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Properties matching your preferences'
    },
    {
      id: 'premium' as const,
      label: 'Premium Listings',
      icon: <Crown className="h-4 w-4" />,
      count: premiumProperties.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Featured and verified properties'
    },
    {
      id: 'sponsored' as const,
      label: 'Sponsored',
      icon: <Zap className="h-4 w-4" />,
      count: sponsoredProperties.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Promoted property listings'
    }
  ];

  if (recommendedProperties.length === 0 && premiumProperties.length === 0 && sponsoredProperties.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-6 border-b border-border/30 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Discover Properties</h2>
              <p className="text-sm text-muted-foreground">Personalized recommendations and featured listings</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Eye className="h-3 w-3" />
              <span>{currentProperties.length} properties</span>
            </div>
            {userPreferences && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Heart className="h-3 w-3" />
                <span>Based on your activity</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm
                ${activeTab === tab.id 
                  ? `${tab.bgColor} ${tab.color} shadow-sm border border-current/20` 
                  : 'text-muted-foreground hover:bg-muted/50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Content */}
      <div className="p-6">
        {currentProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              {tabs.find(t => t.id === activeTab)?.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} available
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {tabs.find(t => t.id === activeTab)?.description}. 
              Check back later for new properties.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Section Description */}
            <div className="mb-6 p-4 bg-white/60 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">
                {tabs.find(t => t.id === activeTab)?.description}
                {activeTab === 'recommended' && userPreferences && (
                  <span className="text-emerald-600 font-medium">
                    {' '}• Based on properties in {userPreferences.preferredLocations?.slice(0, 2).join(', ')} and your price range
                  </span>
                )}
              </p>
            </div>

            {/* Horizontal Scroll Controls */}
            {currentProperties.length > 3 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl"
                  onClick={() => handleScroll('left')}
                  disabled={scrollPosition <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl"
                  onClick={() => handleScroll('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Properties Horizontal Scroll */}
            <div
              id={`properties-scroll-${activeTab}`}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {currentProperties.slice(0, 10).map((property) => (
                <div
                  key={property.id}
                  className="flex-shrink-0 w-80"
                >
                  <PropertyItem
                    property={property}
                    isHovered={hoveredProperty === property.id}
                    propertyImage=""
                    onHover={onPropertyHover}
                    onSelect={onPropertySelect}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>

            {/* View All Button */}
            {currentProperties.length > 10 && (
              <div className="text-center mt-6">
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                  View All {currentProperties.length} {tabs.find(t => t.id === activeTab)?.label}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedPropertiesSection;