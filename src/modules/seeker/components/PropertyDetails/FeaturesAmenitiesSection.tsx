// src/modules/seeker/components/PropertyDetails/FeaturesAmenitiesSection.tsx
// Version: 2.1.0
// Last Modified: 27-01-2025 11:45 IST
// Purpose: Fixed syntax errors and import issues

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  Car, 
  Shield, 
  Zap, 
  Droplets, 
  Wind, 
  Home, 
  Users, 
  Clock, 
  Phone,
  Coffee,
  Printer,
  CheckCircle2,
  Bath,
  Hash,
  Eye,
  Building,
  Dumbbell,
  ShoppingCart,
  Gamepad2,
  Baby,
  Dog,
  TreePine,
  Camera,
  Utensils,
  Tv,
  AirVent,
  Sun,
  Lock,
  Sprout,
  Waves,
  Mountain,
  Settings,
  Sparkles,
  Star,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturesAmenitiesSectionProps {
  featuresData?: any;
}

/**
 * Comprehensive icon mapping for amenities and features
 */
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  
  // Internet & Technology
  if (amenityLower.includes('internet') || amenityLower.includes('wifi') || amenityLower.includes('wi-fi') || amenityLower.includes('broadband')) {
    return <Wifi className="w-4 h-4 text-blue-500" />;
  }
  if (amenityLower.includes('tv') || amenityLower.includes('television') || amenityLower.includes('cable')) {
    return <Tv className="w-4 h-4 text-purple-500" />;
  }
  if (amenityLower.includes('phone') || amenityLower.includes('intercom') || amenityLower.includes('booth')) {
    return <Phone className="w-4 h-4 text-green-500" />;
  }
  if (amenityLower.includes('cctv') || amenityLower.includes('camera') || amenityLower.includes('surveillance')) {
    return <Camera className="w-4 h-4 text-gray-600" />;
  }
  
  // Transportation & Parking
  if (amenityLower.includes('parking') || amenityLower.includes('car') || amenityLower.includes('garage') || amenityLower.includes('vehicle')) {
    return <Car className="w-4 h-4 text-gray-600" />;
  }
  
  // Security & Safety
  if (amenityLower.includes('security') || amenityLower.includes('guard') || amenityLower.includes('watchman')) {
    return <Shield className="w-4 h-4 text-green-600" />;
  }
  if (amenityLower.includes('gated') || amenityLower.includes('gate') || amenityLower.includes('lock')) {
    return <Lock className="w-4 h-4 text-amber-600" />;
  }
  
  // Utilities
  if (amenityLower.includes('power') || amenityLower.includes('electricity') || amenityLower.includes('backup') || amenityLower.includes('generator')) {
    return <Zap className="w-4 h-4 text-yellow-500" />;
  }
  if (amenityLower.includes('water') || amenityLower.includes('pipeline') || amenityLower.includes('harvesting') || amenityLower.includes('supply')) {
    return <Droplets className="w-4 h-4 text-blue-400" />;
  }
  if (amenityLower.includes('gas') || amenityLower.includes('lpg') || amenityLower.includes('pipeline')) {
    return <Settings className="w-4 h-4 text-orange-500" />;
  }
  
  // Climate Control
  if (amenityLower.includes('air') || amenityLower.includes('ac') || amenityLower.includes('conditioner') || amenityLower.includes('cooling')) {
    return <Wind className="w-4 h-4 text-cyan-500" />;
  }
  if (amenityLower.includes('heating') || amenityLower.includes('heater') || amenityLower.includes('warmth')) {
    return <Sun className="w-4 h-4 text-orange-400" />;
  }
  if (amenityLower.includes('ventilation') || amenityLower.includes('exhaust') || amenityLower.includes('fan')) {
    return <AirVent className="w-4 h-4 text-gray-500" />;
  }
  
  // Building Features
  if (amenityLower.includes('lift') || amenityLower.includes('elevator')) {
    return <Building className="w-4 h-4 text-gray-500" />;
  }
  if (amenityLower.includes('stair') || amenityLower.includes('steps')) {
    return <Hash className="w-4 h-4 text-gray-400" />;
  }
  
  // Kitchen & Dining
  if (amenityLower.includes('kitchen') || amenityLower.includes('cooking') || amenityLower.includes('gas') || amenityLower.includes('stove')) {
    return <Utensils className="w-4 h-4 text-red-500" />;
  }
  if (amenityLower.includes('coffee') || amenityLower.includes('tea') || amenityLower.includes('pantry') || amenityLower.includes('cafeteria')) {
    return <Coffee className="w-4 h-4 text-amber-600" />;
  }
  
  // Recreation & Fitness
  if (amenityLower.includes('gym') || amenityLower.includes('fitness') || amenityLower.includes('exercise') || amenityLower.includes('workout')) {
    return <Dumbbell className="w-4 h-4 text-red-600" />;
  }
  if (amenityLower.includes('pool') || amenityLower.includes('swimming') || amenityLower.includes('spa')) {
    return <Waves className="w-4 h-4 text-blue-500" />;
  }
  if (amenityLower.includes('game') || amenityLower.includes('play') || amenityLower.includes('recreation') || amenityLower.includes('entertainment')) {
    return <Gamepad2 className="w-4 h-4 text-purple-600" />;
  }
  if (amenityLower.includes('club') || amenityLower.includes('community') || amenityLower.includes('hall')) {
    return <Users className="w-4 h-4 text-indigo-500" />;
  }
  
  // Outdoor & Nature
  if (amenityLower.includes('garden') || amenityLower.includes('park') || amenityLower.includes('green') || amenityLower.includes('landscape')) {
    return <TreePine className="w-4 h-4 text-green-500" />;
  }
  if (amenityLower.includes('terrace') || amenityLower.includes('balcony') || amenityLower.includes('outdoor')) {
    return <Mountain className="w-4 h-4 text-green-400" />;
  }
  if (amenityLower.includes('plants') || amenityLower.includes('organic')) {
    return <Sprout className="w-4 h-4 text-green-600" />;
  }
  
  // Commercial & Professional
  if (amenityLower.includes('printer') || amenityLower.includes('scanner') || amenityLower.includes('copier') || amenityLower.includes('office')) {
    return <Printer className="w-4 h-4 text-gray-700" />;
  }
  if (amenityLower.includes('reception') || amenityLower.includes('front desk') || amenityLower.includes('concierge')) {
    return <Users className="w-4 h-4 text-purple-500" />;
  }
  if (amenityLower.includes('conference') || amenityLower.includes('meeting') || amenityLower.includes('boardroom')) {
    return <Users className="w-4 h-4 text-blue-700" />;
  }
  
  // Shopping & Services
  if (amenityLower.includes('shopping') || amenityLower.includes('mall') || amenityLower.includes('market') || amenityLower.includes('store')) {
    return <ShoppingCart className="w-4 h-4 text-orange-600" />;
  }
  if (amenityLower.includes('atm') || amenityLower.includes('bank') || amenityLower.includes('financial')) {
    return <Building className="w-4 h-4 text-green-700" />;
  }
  
  // Family & Kids
  if (amenityLower.includes('child') || amenityLower.includes('kid') || amenityLower.includes('baby') || amenityLower.includes('nursery')) {
    return <Baby className="w-4 h-4 text-pink-400" />;
  }
  if (amenityLower.includes('pet') || amenityLower.includes('dog') || amenityLower.includes('animal')) {
    return <Dog className="w-4 h-4 text-amber-500" />;
  }
  
  // Accessibility & Special Features
  if (amenityLower.includes('accessible') || amenityLower.includes('disabled') || amenityLower.includes('wheelchair')) {
    return <Eye className="w-4 h-4 text-blue-600" />;
  }
  if (amenityLower.includes('24/7') || amenityLower.includes('hours') || amenityLower.includes('access') || amenityLower.includes('available')) {
    return <Clock className="w-4 h-4 text-orange-500" />;
  }
  
  // Premium Features
  if (amenityLower.includes('premium') || amenityLower.includes('luxury') || amenityLower.includes('deluxe')) {
    return <Star className="w-4 h-4 text-yellow-500" />;
  }
  if (amenityLower.includes('smart') || amenityLower.includes('automated') || amenityLower.includes('digital')) {
    return <Smartphone className="w-4 h-4 text-indigo-600" />;
  }
  
  // Default icon for unmatched amenities
  return <CheckCircle2 className="w-4 h-4 text-green-500" />;
};

const FeaturesAmenitiesSection: React.FC<FeaturesAmenitiesSectionProps> = ({ featuresData }) => {
  // Extract and organize features data
  const extractData = () => {
    if (!featuresData) return null;

    const data = featuresData;
    let amenities: string[] = [];
    
    // Extract amenities from various possible formats
    if (data.amenities && Array.isArray(data.amenities)) {
      amenities = data.amenities.filter(Boolean);
    } else if (typeof data.amenities === 'string') {
      amenities = data.amenities.split(',').map((item: string) => item.trim()).filter(Boolean);
    }

    // Extract other feature fields
    const otherFeatures: { [key: string]: any } = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'amenities' && value !== null && value !== undefined && value !== '') {
        otherFeatures[key] = value;
      }
    });

    return {
      amenities,
      otherFeatures
    };
  };

  const data = extractData();

  // If no features data is provided, show a message
  if (!data || (data.amenities.length === 0 && Object.keys(data.otherFeatures).length === 0)) {
    return (
      <Card className="overflow-hidden shadow-sm border-border/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">Features & Amenities</h3>
          </div>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No features or amenities information available for this property.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format field label for display
  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  };

  // Format boolean values
  const formatBoolean = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === 'yes' || lower === 'available') return 'Yes';
      if (lower === 'false' || lower === 'no' || lower === 'not available') return 'No';
    }
    return String(value);
  };

  // Render amenities in a visual grid
  const renderAmenities = (amenities: string[]) => {
    if (!amenities || amenities.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="text-base md:text-lg font-medium">Available Amenities</h4>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {amenities.length} items
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {amenities.map((amenity, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30",
                "hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              )}
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/80 shadow-sm">
                {getAmenityIcon(amenity)}
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">
                {amenity}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render other features in a clean grid
  const renderOtherFeatures = (features: { [key: string]: any }) => {
    const featureEntries = Object.entries(features);
    
    if (featureEntries.length === 0) {
      return null;
    }

    return (
      <div className="pt-4 mt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h4 className="text-base md:text-lg font-medium">Additional Features</h4>
          <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
            {featureEntries.length} items
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {featureEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                {formatFieldLabel(key)}
              </span>
              <div className="font-medium text-foreground">
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : typeof value === 'boolean' ? (
                  <span className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                    value ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                  )}>
                    {value ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4 text-center">✗</span>
                    )}
                    {formatBoolean(value)}
                  </span>
                ) : (
                  <span className="text-foreground">
                    {String(value)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden shadow-sm border-border/50">
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold">Features & Amenities</h3>
        </div>
        
        {/* Amenities Section */}
        {renderAmenities(data.amenities)}
        
        {/* Other Features Section */}
        {renderOtherFeatures(data.otherFeatures)}
      </CardContent>
    </Card>
  );
};

export default FeaturesAmenitiesSection;