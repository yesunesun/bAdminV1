// src/pages/ExploreProperties.tsx
// Version: 1.0.0
// Last Modified: 02-06-2025 15:35 IST
// Purpose: Explore properties page with new card design and grid layout

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import NewPropertyCard from '@/modules/seeker/components/NewPropertyCard';
import { SearchResult } from '@/components/Search/types/search.types';
import { Search, Filter, Grid, List, MapPin, SlidersHorizontal } from 'lucide-react';

// Dummy data for initial display
const DUMMY_PROPERTIES: SearchResult[] = [
  {
    id: '1',
    title: 'Luxury 3BHK Apartment in Hitech City',
    location: 'Hitech City, Hyderabad',
    price: 45000,
    propertyType: 'residential',
    transactionType: 'rent',
    subType: 'Apartment',
    bhk: '3 BHK',
    area: 1500,
    ownerName: 'Ramesh Kumar',
    ownerPhone: '+91 9876543210',
    createdAt: '2025-01-15T10:00:00Z',
    status: 'active',
    primary_image: null,
    code: 'HC001'
  },
  {
    id: '2',
    title: 'Modern Office Space in Gachibowli',
    location: 'Gachibowli, Hyderabad',
    price: 2500000,
    propertyType: 'commercial',
    transactionType: 'buy',
    subType: 'Office',
    bhk: null,
    area: 2000,
    ownerName: 'Priya Sharma',
    ownerPhone: '+91 9876543211',
    createdAt: '2025-01-14T15:30:00Z',
    status: 'active',
    primary_image: null,
    code: 'GB002'
  },
  {
    id: '3',
    title: 'Spacious 2BHK Villa in Jubilee Hills',
    location: 'Jubilee Hills, Hyderabad',
    price: 35000,
    propertyType: 'residential',
    transactionType: 'rent',
    subType: 'Villa',
    bhk: '2 BHK',
    area: 1200,
    ownerName: 'Anil Reddy',
    ownerPhone: '+91 9876543212',
    createdAt: '2025-01-13T09:15:00Z',
    status: 'active',
    primary_image: null,
    code: 'JH003'
  },
  {
    id: '4',
    title: 'Premium 4BHK Penthouse in Banjara Hills',
    location: 'Banjara Hills, Hyderabad',
    price: 8500000,
    propertyType: 'residential',
    transactionType: 'buy',
    subType: 'Penthouse',
    bhk: '4 BHK',
    area: 3000,
    ownerName: 'Kavitha Devi',
    ownerPhone: '+91 9876543213',
    createdAt: '2025-01-12T14:45:00Z',
    status: 'active',
    primary_image: null,
    code: 'BH004'
  },
  {
    id: '5',
    title: 'Cozy 1BHK Studio in Kondapur',
    location: 'Kondapur, Hyderabad',
    price: 18000,
    propertyType: 'residential',
    transactionType: 'rent',
    subType: 'Studio',
    bhk: '1 BHK',
    area: 600,
    ownerName: 'Suresh Babu',
    ownerPhone: '+91 9876543214',
    createdAt: '2025-01-11T11:20:00Z',
    status: 'active',
    primary_image: null,
    code: 'KD005'
  },
  {
    id: '6',
    title: 'Commercial Showroom in Madhapur',
    location: 'Madhapur, Hyderabad',
    price: 75000,
    propertyType: 'commercial',
    transactionType: 'rent',
    subType: 'Showroom',
    bhk: null,
    area: 1800,
    ownerName: 'Venkat Rao',
    ownerPhone: '+91 9876543215',
    createdAt: '2025-01-10T16:00:00Z',
    status: 'active',
    primary_image: null,
    code: 'MD006'
  },
  {
    id: '7',
    title: '3BHK Independent House in Secunderabad',
    location: 'Secunderabad, Hyderabad',
    price: 5500000,
    propertyType: 'residential',
    transactionType: 'buy',
    subType: 'Independent House',
    bhk: '3 BHK',
    area: 2200,
    ownerName: 'Lakshmi Prasad',
    ownerPhone: '+91 9876543216',
    createdAt: '2025-01-09T12:30:00Z',
    status: 'active',
    primary_image: null,
    code: 'SC007'
  },
  {
    id: '8',
    title: 'Luxury 2BHK Flat in Financial District',
    location: 'Financial District, Hyderabad',
    price: 32000,
    propertyType: 'residential',
    transactionType: 'rent',
    subType: 'Apartment',
    bhk: '2 BHK',
    area: 1100,
    ownerName: 'Ravi Kumar',
    ownerPhone: '+91 9876543217',
    createdAt: '2025-01-08T08:45:00Z',
    status: 'active',
    primary_image: null,
    code: 'FD008'
  }
];

interface ExplorePropertiesProps {}

const ExploreProperties: React.FC<ExplorePropertiesProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [properties, setProperties] = useState<SearchResult[]>(DUMMY_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites for authenticated users
  useEffect(() => {
    if (user) {
      // In a real implementation, load user's favorites from the backend
      // For now, using dummy data
      setFavorites(new Set(['1', '3', '5']));
    }
  }, [user]);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setProperties(DUMMY_PROPERTIES);
      return;
    }

    const filtered = DUMMY_PROPERTIES.filter(property =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.subType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setProperties(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    let filtered = DUMMY_PROPERTIES;
    
    switch (filter) {
      case 'rent':
        filtered = DUMMY_PROPERTIES.filter(p => p.transactionType === 'rent');
        break;
      case 'buy':
        filtered = DUMMY_PROPERTIES.filter(p => p.transactionType === 'buy');
        break;
      case 'residential':
        filtered = DUMMY_PROPERTIES.filter(p => p.propertyType === 'residential');
        break;
      case 'commercial':
        filtered = DUMMY_PROPERTIES.filter(p => p.propertyType === 'commercial');
        break;
      default:
        filtered = DUMMY_PROPERTIES;
    }
    
    setProperties(filtered);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (propertyId: string, isLiked: boolean): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add properties to your favorites.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const newFavorites = new Set(favorites);
      
      if (isLiked) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      
      setFavorites(newFavorites);
      
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked ? "Property removed from your favorites." : "Property added to your favorites.",
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle share
  const handleShare = (e: React.MouseEvent, property: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: `${window.location.origin}/properties/${property.id}`
      });
    } else {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`);
      toast({
        title: "Link Copied",
        description: "Property link copied to clipboard!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Properties</h1>
              <p className="text-gray-600 mt-1">Discover your perfect home or investment opportunity</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property type, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Properties
              </button>
              <button
                onClick={() => handleFilterChange('rent')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'rent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                For Rent
              </button>
              <button
                onClick={() => handleFilterChange('buy')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'buy'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                For Sale
              </button>
              <button
                onClick={() => handleFilterChange('residential')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'residential'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Residential
              </button>
              <button
                onClick={() => handleFilterChange('commercial')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'commercial'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Commercial
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </span>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          // Loading state
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : properties.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
                setProperties(DUMMY_PROPERTIES);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          // Properties display
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {properties.map((property) => (
              <NewPropertyCard
                key={property.id}
                property={property}
                isLiked={favorites.has(property.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onShare={handleShare}
                className={viewMode === 'list' ? 'flex-row max-w-none' : ''}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button (for future pagination) */}
      {!loading && properties.length > 0 && (
        <div className="text-center pb-8">
          <button
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              // Future: Load more properties
              toast({
                title: "Feature Coming Soon",
                description: "Load more functionality will be available soon!",
              });
            }}
          >
            Load More Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreProperties;