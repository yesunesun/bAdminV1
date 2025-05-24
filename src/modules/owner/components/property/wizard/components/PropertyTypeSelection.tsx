// src/modules/owner/components/property/wizard/components/PropertyTypeSelection.tsx
// Version: 3.0.0
// Last Modified: 25-05-2025 21:15 IST
// Purpose: Updated to use FlowContext for centralized flow management

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Building2, Home, Trees, Shield, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HowItWorks } from '../../../property/HowItWorks';
import { useFlow } from '@/contexts/FlowContext';

// Updated property categories to include all the new property types
const propertyCategories = [
  {
    id: 'residential',
    title: 'Residential',
    icon: Home,
    listingTypes: ['Rent', 'Sale', 'PG/Hostel', 'Flatmates']
  },
  {
    id: 'commercial',
    title: 'Commercial',
    icon: Building2,
    listingTypes: ['Rent', 'Sale', 'Co-working']
  },
  {
    id: 'land',
    title: 'Land/Plot',
    icon: Trees,
    listingTypes: ['Sale']
  }
];

interface PropertyTypeSelectionProps {
  onNext: (category: string, listingType: string, city: string) => void;
  selectedCategory?: string;
  selectedAdType?: string;
}

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your property details are protected with bank-grade security"
  },
  {
    icon: Clock,
    title: "Quick Listing",
    description: "List your property in minutes with our simple process"
  },
  {
    icon: Users,
    title: "Verified Users",
    description: "Connect with genuine buyers and tenants"
  }
];

export default function PropertyTypeSelection({ 
  onNext, 
  selectedCategory: initialCategory,
  selectedAdType: initialAdType 
}: PropertyTypeSelectionProps) {
  const { setFlow } = useFlow();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedListingType, setSelectedListingType] = useState<string>(initialAdType || '');
  const [selectedCity] = useState<string>('Hyderabad'); // Default city
  const selectedCategoryData = propertyCategories.find(cat => cat.id === selectedCategory);

  // Update local state when props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialAdType) setSelectedListingType(initialAdType);
  }, [initialCategory, initialAdType]);

  // Handle form submission using FlowContext
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('PropertyTypeSelection - handleSubmit', {
      selectedCategory,
      selectedListingType,
      selectedCity
    });
    
    if (selectedCategory && selectedListingType) {
      // Use FlowContext to set the flow and navigate
      setFlow(selectedCategory, selectedListingType);
      
      // Call the onNext callback if provided (for compatibility)
      if (onNext) {
        onNext(selectedCategory, selectedListingType, selectedCity);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-12">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            List Your Property in Hyderabad
          </h1>
          <div className="flex justify-end">
            <div className="flex items-center">
              <span className="text-slate-600 mr-2">Looking for a property?</span>
              <a href="/properties" className="text-teal-600 hover:text-teal-700 font-medium">
                Browse Properties
              </a>
            </div>
          </div>
        </div>

        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-medium text-slate-800 mb-6">
                  Start Your Property Journey
                </h2>
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-teal-50 rounded-lg">
                        <feature.icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{feature.title}</h3>
                        <p className="text-sm text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-slate-600 font-medium">Property Type</p>
                  <div className="grid grid-cols-3 gap-3">
                    {propertyCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedListingType('');
                        }}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border transition-all",
                          selectedCategory === category.id
                            ? "border-teal-600 bg-teal-50 text-teal-600"
                            : "border-slate-200 hover:border-teal-200 text-slate-600"
                        )}
                      >
                        <category.icon className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{category.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCategory && (
                  <div>
                    <p className="mb-3 text-slate-600 font-medium">Listing Type</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedCategoryData?.listingTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedListingType(type)}
                          className={cn(
                            "py-3 px-4 rounded-lg border text-center transition-all",
                            selectedListingType === type
                              ? "border-teal-600 bg-teal-50 text-teal-600"
                              : "border-slate-200 hover:border-teal-200 text-slate-600"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={!selectedCategory || !selectedListingType}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-white font-medium transition-all",
                    selectedCategory && selectedListingType
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-slate-300 cursor-not-allowed"
                  )}
                >
                  Create Your Listing
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works section */}
        <div className="py-12">
          <HowItWorks 
            onStartListing={scrollToTop} 
            selectedCategory={selectedCategory} 
            selectedType={selectedListingType}
          />
        </div>
      </div>
    </div>
  );
}