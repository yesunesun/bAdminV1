// src/modules/properties/components/HeroSection.tsx
// Version: 1.0.0
// Last Modified: 02-04-2025 14:55 IST
// Purpose: Moved from PropertyMapHome to properties module

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { propertyTypeOptions } from '../services/propertyMapService';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPropertyType: string;
  handlePropertyTypeChange: (type: string) => void;
  toggleMoreFilters: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPropertyType,
  handlePropertyTypeChange,
  toggleMoreFilters
}) => {
  return (
    <section className="relative bg-gradient-to-b from-primary/90 to-primary/70 text-primary-foreground">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-7xl">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Property in India
          </h1>
          <p className="text-lg sm:text-xl opacity-90 mb-8">
            Browse thousands of properties for sale and rent across India
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow relative">
                <Input
                  type="text"
                  placeholder="Search by location, property name..."
                  className="w-full h-12 pl-10 pr-4 rounded-md border-0 text-foreground bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              </div>
              
              <Button 
                className="h-12 px-6 whitespace-nowrap bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={toggleMoreFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Property Type Quick Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {propertyTypeOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedPropertyType === option.id ? "secondary" : "outline"}
              className={`
                h-10 px-4 rounded-full 
                ${selectedPropertyType === option.id 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'}
              `}
              onClick={() => handlePropertyTypeChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        {/* List Your Property CTA */}
        <div className="mt-8 text-center">
          <Link to="/properties/list">
            <Button variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              List Your Property
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;