// src/modules/seeker/components/PropertyDetails/FeaturesAmenitiesSection.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 21:30 IST
// Purpose: Enhanced Features & Amenities section with better formatting and visual appeal

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
  Building
} from 'lucide-react';

interface FeaturesAmenitiesSectionProps {
  featuresData?: any; // Accept any structure since the data can be nested in different ways
}

const FeaturesAmenitiesSection: React.FC<FeaturesAmenitiesSectionProps> = ({ featuresData }) => {
  // Format a property value safely with fallback
  const formatPropertyValue = (value: any, defaultValue: string = '-'): string => {
    if (value === null || value === undefined) return defaultValue;
    if (value === '') return defaultValue;
    if (value === 0 && defaultValue !== '0') return defaultValue;
    return String(value);
  };

  // Format boolean values
  const formatBoolean = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === 'yes') return 'Yes';
      if (lower === 'false' || lower === 'no') return 'No';
    }
    return formatPropertyValue(value);
  };

  // Icon mapping for different amenity types
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('internet') || amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) {
      return <Wifi className="w-4 h-4 text-blue-500" />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('car')) {
      return <Car className="w-4 h-4 text-gray-600" />;
    }
    if (amenityLower.includes('security') || amenityLower.includes('guard')) {
      return <Shield className="w-4 h-4 text-green-600" />;
    }
    if (amenityLower.includes('power') || amenityLower.includes('electricity') || amenityLower.includes('backup')) {
      return <Zap className="w-4 h-4 text-yellow-500" />;
    }
    if (amenityLower.includes('water') || amenityLower.includes('pipeline') || amenityLower.includes('harvesting')) {
      return <Droplets className="w-4 h-4 text-blue-400" />;
    }
    if (amenityLower.includes('air') || amenityLower.includes('ac') || amenityLower.includes('conditioner')) {
      return <Wind className="w-4 h-4 text-cyan-500" />;
    }
    if (amenityLower.includes('lift') || amenityLower.includes('elevator')) {
      return <Building className="w-4 h-4 text-gray-500" />;
    }
    if (amenityLower.includes('coffee') || amenityLower.includes('tea') || amenityLower.includes('kitchen') || amenityLower.includes('pantry')) {
      return <Coffee className="w-4 h-4 text-brown-500" />;
    }
    if (amenityLower.includes('printer') || amenityLower.includes('scanner') || amenityLower.includes('copier')) {
      return <Printer className="w-4 h-4 text-gray-700" />;
    }
    if (amenityLower.includes('phone') || amenityLower.includes('booth')) {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
    if (amenityLower.includes('reception') || amenityLower.includes('front desk')) {
      return <Users className="w-4 h-4 text-purple-500" />;
    }
    if (amenityLower.includes('24/7') || amenityLower.includes('access')) {
      return <Clock className="w-4 h-4 text-orange-500" />;
    }
    
    // Default icon
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  // Extract and organize features data
  const extractData = () => {
    if (!featuresData) return null;

    // Handle different data structures
    const data = featuresData;

    // Extract amenities from various possible locations
    let amenities: string[] = [];
    
    if (data.amenities && Array.isArray(data.amenities)) {
      amenities = data.amenities;
    } else if (typeof data.amenities === 'string') {
      // If amenities is a comma-separated string
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
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
          <p className="text-muted-foreground">No features or amenities information available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format field labels to be more readable
  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  // Render amenities in a visual grid
  const renderAmenities = (amenities: string[]) => {
    if (!amenities || amenities.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        <h4 className="text-md font-medium mb-3 text-gray-800">Amenities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {getAmenityIcon(amenity)}
              <span className="text-sm font-medium text-gray-700">{amenity}</span>
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
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium mb-3 text-gray-800">Additional Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-500">
                {formatFieldLabel(key)}
              </span>
              <span className="text-gray-900 font-medium">
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : typeof value === 'boolean' ? (
                  <span className={`inline-flex items-center gap-1 ${value ? 'text-green-600' : 'text-red-600'}`}>
                    {value ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 text-center">✗</span>}
                    {formatBoolean(value)}
                  </span>
                ) : (
                  formatPropertyValue(value)
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">Features & Amenities</h3>
        
        {/* Amenities Section */}
        {renderAmenities(data.amenities)}
        
        {/* Other Features Section */}
        {renderOtherFeatures(data.otherFeatures)}
      </CardContent>
    </Card>
  );
};

export default FeaturesAmenitiesSection;