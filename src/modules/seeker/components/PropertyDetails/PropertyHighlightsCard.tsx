// src/modules/seeker/components/PropertyDetails/PropertyHighlightsCard.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 16:00 IST
// Purpose: Enhanced property highlights with Phase 1 design system and better visual hierarchy

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2,
  Star,
  Crown,
  Award,
  Zap,
  Heart,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyHighlightsCardProps {
  highlights: string[];
  className?: string;
}

const PropertyHighlightsCard: React.FC<PropertyHighlightsCardProps> = ({ highlights, className }) => {
  if (!highlights || highlights.length === 0) return null;

  // Get appropriate icon for highlight based on content
  const getHighlightIcon = (highlight: string) => {
    const highlightLower = highlight.toLowerCase();
    
    if (highlightLower.includes('premium') || highlightLower.includes('luxury') || highlightLower.includes('exclusive')) {
      return Crown;
    }
    if (highlightLower.includes('award') || highlightLower.includes('certified') || highlightLower.includes('approved')) {
      return Award;
    }
    if (highlightLower.includes('new') || highlightLower.includes('modern') || highlightLower.includes('latest')) {
      return Sparkles;
    }
    if (highlightLower.includes('rating') || highlightLower.includes('star') || highlightLower.includes('review')) {
      return Star;
    }
    if (highlightLower.includes('quick') || highlightLower.includes('fast') || highlightLower.includes('instant')) {
      return Zap;
    }
    if (highlightLower.includes('favorite') || highlightLower.includes('popular') || highlightLower.includes('loved')) {
      return Heart;
    }
    if (highlightLower.includes('prime') || highlightLower.includes('strategic') || highlightLower.includes('ideal')) {
      return Target;
    }
    
    return CheckCircle2;
  };

  // Get color scheme for highlight based on content
  const getHighlightColor = (highlight: string, index: number) => {
    const highlightLower = highlight.toLowerCase();
    
    if (highlightLower.includes('premium') || highlightLower.includes('luxury')) {
      return 'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-900';
    }
    if (highlightLower.includes('award') || highlightLower.includes('certified')) {
      return 'from-amber-50 to-amber-100/50 border-amber-200/50 text-amber-900';
    }
    if (highlightLower.includes('new') || highlightLower.includes('modern')) {
      return 'from-green-50 to-green-100/50 border-green-200/50 text-green-900';
    }
    if (highlightLower.includes('rating') || highlightLower.includes('star')) {
      return 'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-900';
    }
    if (highlightLower.includes('prime') || highlightLower.includes('strategic')) {
      return 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-900';
    }
    
    // Fallback color rotation
    const colors = [
      'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-900',
      'from-green-50 to-green-100/50 border-green-200/50 text-green-900',
      'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-900',
      'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-900'
    ];
    
    return colors[index % colors.length];
  };

  // Get icon color for highlight
  const getIconColor = (highlight: string, index: number) => {
    const highlightLower = highlight.toLowerCase();
    
    if (highlightLower.includes('premium') || highlightLower.includes('luxury')) {
      return 'text-purple-600 bg-purple-500/10';
    }
    if (highlightLower.includes('award') || highlightLower.includes('certified')) {
      return 'text-amber-600 bg-amber-500/10';
    }
    if (highlightLower.includes('new') || highlightLower.includes('modern')) {
      return 'text-green-600 bg-green-500/10';
    }
    if (highlightLower.includes('rating') || highlightLower.includes('star')) {
      return 'text-orange-600 bg-orange-500/10';
    }
    if (highlightLower.includes('prime') || highlightLower.includes('strategic')) {
      return 'text-blue-600 bg-blue-500/10';
    }
    
    // Fallback icon color rotation
    const iconColors = [
      'text-blue-600 bg-blue-500/10',
      'text-green-600 bg-green-500/10',
      'text-purple-600 bg-purple-500/10',
      'text-orange-600 bg-orange-500/10'
    ];
    
    return iconColors[index % iconColors.length];
  };
  
  return (
    <Card className={cn("overflow-hidden shadow-sm border-border/50 transition-colors duration-200", className)}>
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">Property Highlights</h2>
        </div>

        {/* Highlights List */}
        <div className="space-y-3">
          {highlights.map((highlight: string, index: number) => {
            const IconComponent = getHighlightIcon(highlight);
            const colorClasses = getHighlightColor(highlight, index);
            const iconClasses = getIconColor(highlight, index);
            
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br border transition-all hover:-translate-y-0.5 hover:shadow-md",
                  colorClasses
                )}
              >
                <div className={cn("p-2 rounded-full mt-0.5 flex-shrink-0", iconClasses)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium leading-relaxed">
                    {highlight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with count */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">
              {highlights.length} key {highlights.length === 1 ? 'highlight' : 'highlights'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHighlightsCard;