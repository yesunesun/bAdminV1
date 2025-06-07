// src/pages/GharHomepage.tsx
// Version: 1.1.0
// Last Modified: 07-06-2025 16:45 IST
// Purpose: Fixed TypeScript parsing errors and JSX syntax issues

import React, { useState, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Grid, 
  Map, 
  Filter, 
  Heart,
  ChevronDown,
  Home,
  User,
  Menu,
  X,
  Star,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  ArrowRight
} from 'lucide-react';

// Mock data for properties
const mockProperties = [
  {
    id: '1',
    title: '3 BHK Luxury Apartment',
    price: 8500000,
    location: 'Banjara Hills, Hyderabad',
    type: 'Apartment',
    category: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    area: 1850,
    image: '/apartment.jpg',
    rating: 4.8,
    coordinates: { lat: 17.4126, lng: 78.4482 }
  },
  {
    id: '2',
    title: 'Modern Office Space',
    price: 12000000,
    location: 'HITEC City, Hyderabad',
    type: 'Office',
    category: 'Commercial',
    bedrooms: 0,
    bathrooms: 4,
    area: 2500,
    image: '/apartment.jpg',
    rating: 4.6,
    coordinates: { lat: 17.4435, lng: 78.3772 }
  },
  {
    id: '3',
    title: 'Agricultural Land',
    price: 3500000,
    location: 'Medak, Telangana',
    type: 'Agricultural',
    category: 'Land',
    bedrooms: 0,
    bathrooms: 0,
    area: 5000,
    image: '/apartment.jpg',
    rating: 4.2,
    coordinates: { lat: 17.7172, lng: 78.2752 }
  },
  {
    id: '4',
    title: '2 BHK Ready to Move',
    price: 4500000,
    location: 'Kondapur, Hyderabad',
    type: 'Apartment',
    category: 'Residential',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: '/apartment.jpg',
    rating: 4.5,
    coordinates: { lat: 17.4647, lng: 78.3671 }
  },
  {
    id: '5',
    title: 'Commercial Showroom',
    price: 15000000,
    location: 'Abids, Hyderabad',
    type: 'Showroom',
    category: 'Commercial',
    bedrooms: 0,
    bathrooms: 2,
    area: 1800,
    image: '/apartment.jpg',
    rating: 4.3,
    coordinates: { lat: 17.3850, lng: 78.4867 }
  },
  {
    id: '6',
    title: 'Residential Plot',
    price: 6500000,
    location: 'Shamshabad, Hyderabad',
    type: 'Residential',
    category: 'Land',
    bedrooms: 0,
    bathrooms: 0,
    area: 3000,
    image: '/apartment.jpg',
    rating: 4.1,
    coordinates: { lat: 17.2403, lng: 78.4294 }
  }
];

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  rating: number;
  coordinates: { lat: number; lng: number };
}

const GharHomepage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Buy');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('All Residential');
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const categories = ['Buy', 'Rent', 'New Launch', 'PG / Co-living', 'Commercial', 'Plots/Land', 'Projects'];
  const propertyTypes = ['All Residential', 'Apartment', 'Villa', 'Plot', 'Office', 'Showroom', 'Warehouse'];

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const filteredProperties = mockProperties.filter((property: Property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Buy' || 
                           (selectedCategory === 'Commercial' && property.category === 'Commercial') ||
                           (selectedCategory === 'Plots/Land' && property.category === 'Land');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">Ghar</div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors">For Buyers</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">For Tenants</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">For Owners</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">For Dealers</a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Post Property
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded">FREE</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-foreground hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </button>
                <button 
                  className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-4 space-y-3">
              <a href="#" className="block text-foreground hover:text-primary transition-colors">For Buyers</a>
              <a href="#" className="block text-foreground hover:text-primary transition-colors">For Tenants</a>
              <a href="#" className="block text-foreground hover:text-primary transition-colors">For Owners</a>
              <a href="#" className="block text-foreground hover:text-primary transition-colors">For Dealers</a>
              <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Post Property FREE
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Find Your Dream <span className="text-primary">Home</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the perfect property from thousands of listings across India&apos;s top cities
            </p>
          </div>

          {/* Search Widget */}
          <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            {/* Category Tabs */}
            <div className="flex flex-wrap border-b border-border">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedCategory === category
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {category}
                  {category === 'New Launch' && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Property Type */}
                <div className="relative">
                  <select 
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-foreground"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Location Search */}
                <div className="relative md:col-span-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                  />
                </div>

                {/* Search Button */}
                <button className="flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {filteredProperties.length} Properties Found
              </h2>
              <p className="text-muted-foreground">in Hyderabad and nearby areas</p>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </button>
              </div>

              {/* Filters */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {isFiltersOpen && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full p-2 border border-border rounded text-foreground bg-background"
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full p-2 border border-border rounded text-foreground bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                  <select className="w-full p-2 border border-border rounded text-foreground bg-background">
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Area (sq ft)</label>
                  <select className="w-full p-2 border border-border rounded text-foreground bg-background">
                    <option value="">Any</option>
                    <option value="1000">Less than 1000</option>
                    <option value="1000-2000">1000 - 2000</option>
                    <option value="2000-3000">2000 - 3000</option>
                    <option value="3000">More than 3000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: Property) => (
                <div key={property.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                      {property.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
                      <div className="flex items-center ml-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-muted-foreground ml-1">{property.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </p>

                    {/* Property Features */}
                    <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          {property.bedrooms}
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          {property.bathrooms}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        {property.area} sq ft
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-primary">
                        {formatPrice(property.price)}
                      </div>
                      <button className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Map View */
            <div className="h-[600px] bg-muted rounded-xl overflow-hidden relative">
              <div 
                ref={mapRef}
                className="w-full h-full flex items-center justify-center text-muted-foreground"
              >
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Interactive Map View</p>
                  <p className="text-sm">Map integration would be implemented here</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Showing {filteredProperties.length} properties in the area
                  </div>
                </div>
              </div>
              
              {/* Map Properties Panel */}
              <div className="absolute top-4 left-4 w-80 max-h-96 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Properties in View</h3>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {filteredProperties.slice(0, 3).map((property: Property) => (
                    <div key={property.id} className="p-4 border-b border-border last:border-b-0 hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{property.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                          <p className="text-sm font-semibold text-primary">{formatPrice(property.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProperties.length > 3 && (
                    <div className="p-4 text-center">
                      <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                        View {filteredProperties.length - 3} more properties
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="text-2xl font-bold text-primary">Ghar</div>
              <p className="text-muted-foreground text-sm">
                Your trusted partner in finding the perfect home. Connecting buyers, sellers, and renters across India.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="p-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                  <Facebook className="h-4 w-4 text-foreground" />
                </a>
                <a href="#" className="p-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                  <Twitter className="h-4 w-4 text-foreground" />
                </a>
                <a href="#" className="p-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                  <Instagram className="h-4 w-4 text-foreground" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Properties for Sale</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Properties for Rent</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">New Projects</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">PG/Co-living</a>
              </div>
            </div>

            {/* Popular Cities */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Popular Cities</h3>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Hyderabad</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Bangalore</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Mumbai</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Delhi</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+91 99999 99999</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">info@ghar.com</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">www.ghar.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Ghar. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GharHomepage;

// End of file