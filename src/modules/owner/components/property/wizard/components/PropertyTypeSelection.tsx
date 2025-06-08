// src/modules/owner/components/property/wizard/components/PropertyTypeSelection.tsx
// Version: 4.1.1
// Last Modified: 31-01-2025 14:50 IST
// Purpose: Fixed JSX syntax error - corrected closing tag

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Building2, Home, Trees, Shield, Clock, Users, ArrowRight, Briefcase, UserPlus } from 'lucide-react';
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

// Grouped quick links for all 8 property flows
const quickLinksGroups = [
  {
    groupTitle: 'Residential Properties',
    groupIcon: Home,
    groupColor: 'border-blue-200 bg-blue-50',
    links: [
      {
        id: 'residential-rent',
        category: 'residential',
        listingType: 'Rent',
        title: 'Rent Property',
        description: 'House, Apartment, Villa',
        icon: Home,
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600'
      },
      {
        id: 'residential-sale',
        category: 'residential',
        listingType: 'Sale',
        title: 'Sell Property',
        description: 'House, Apartment, Villa',
        icon: Home,
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600'
      },
      {
        id: 'residential-pg',
        category: 'residential',
        listingType: 'PG/Hostel',
        title: 'PG/Hostel',
        description: 'Paying Guest & Hostels',
        icon: Users,
        color: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600'
      },
      {
        id: 'residential-flatmates',
        category: 'residential',
        listingType: 'Flatmates',
        title: 'Find Flatmates',
        description: 'Shared Accommodation',
        icon: UserPlus,
        color: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600'
      }
    ]
  },
  {
    groupTitle: 'Commercial Properties',
    groupIcon: Building2,
    groupColor: 'border-purple-200 bg-purple-50',
    links: [
      {
        id: 'commercial-rent',
        category: 'commercial',
        listingType: 'Rent',
        title: 'Rent Commercial',
        description: 'Office, Shop, Warehouse',
        icon: Building2,
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600'
      },
      {
        id: 'commercial-sale',
        category: 'commercial',
        listingType: 'Sale',
        title: 'Sell Commercial',
        description: 'Office, Shop, Building',
        icon: Building2,
        color: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600'
      },
      {
        id: 'commercial-coworking',
        category: 'commercial',
        listingType: 'Co-working',
        title: 'Co-working Space',
        description: 'Shared Office, Desk Space',
        icon: Briefcase,
        color: 'bg-cyan-500',
        hoverColor: 'hover:bg-cyan-600'
      }
    ]
  },
  {
    groupTitle: 'Land & Plots',
    groupIcon: Trees,
    groupColor: 'border-emerald-200 bg-emerald-50',
    links: [
      {
        id: 'land-sale',
        category: 'land',
        listingType: 'Sale',
        title: 'Sell Land/Plot',
        description: 'Residential & Commercial',
        icon: Trees,
        color: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600'
      }
    ]
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
  const [showManualSelection, setShowManualSelection] = useState<boolean>(false);
  const selectedCategoryData = propertyCategories.find(cat => cat.id === selectedCategory);

  // Update local state when props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialAdType) setSelectedListingType(initialAdType);
  }, [initialCategory, initialAdType]);

  // Handle quick link selection
  const handleQuickLinkClick = (category: string, listingType: string) => {
    console.log('PropertyTypeSelection - Quick Link clicked', {
      category,
      listingType,
      selectedCity
    });
    
    // Use FlowContext to set the flow and navigate
    setFlow(category, listingType);
    
    // Call the onNext callback if provided (for compatibility)
    if (onNext) {
      onNext(category, listingType, selectedCity);
    }
  };

  // Handle manual form submission using FlowContext
  const handleManualSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('PropertyTypeSelection - Manual submit', {
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            List Your Property in Telangana
          </h1>
          <p className="text-slate-600 mb-4">
            Choose your property type below to get started quickly
          </p>
          <div className="flex justify-end">
            <div className="flex items-center">
              <span className="text-slate-600 mr-2">Looking for a property?</span>
              <a href="/browse" className="text-teal-600 hover:text-teal-700 font-medium">
                Browse Properties
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links Section - Grouped */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Quick Start - Choose Your Property Type
            </h2>
            <p className="text-slate-600">
              Click on any option below to start listing immediately
            </p>
          </div>

          {quickLinksGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className={cn("bg-white shadow-md border-2", group.groupColor)}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <group.groupIcon className="w-6 h-6 mr-3 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-800">{group.groupTitle}</h3>
                </div>
                
                <div className={cn(
                  "grid gap-4",
                  group.links.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                  group.links.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
                  "grid-cols-1"
                )}>
                  {group.links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleQuickLinkClick(link.category, link.listingType)}
                      className={cn(
                        "group relative p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg",
                        link.color,
                        link.hoverColor
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center mb-2">
                            <link.icon className="w-5 h-5 mr-2" />
                            <h4 className="font-semibold text-sm">{link.title}</h4>
                          </div>
                          <p className="text-xs text-white/90">{link.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manual Selection Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowManualSelection(!showManualSelection)}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm underline"
          >
            {showManualSelection ? 'Hide Manual Selection' : 'Need more options? Choose manually'}
          </button>
        </div>

        {/* Manual Selection Section - Collapsible */}
        {showManualSelection && (
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
                    onClick={handleManualSubmit}
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
        )}

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