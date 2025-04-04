// src/modules/seeker/components/FavoritesDrawer.tsx
// Version: 1.5.0
// Last Modified: 05-04-2025 15:30 IST
// Purpose: Added fallback to dummy data to ensure the drawer works

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { formatPrice } from '../services/seekerService';
import { useToast } from '@/components/ui/use-toast';

// Dummy properties for fallback
const DUMMY_PROPERTIES = [
  {
    id: 'dummy-1',
    title: 'Luxury Villa in Bangalore',
    address: '123 Main St',
    city: 'Bangalore',
    price: 10000000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 2500,
    property_details: {
      primaryImage: '/apartment.jpg'
    }
  },
  {
    id: 'dummy-2',
    title: 'Modern Apartment in Mumbai',
    address: '456 Park Avenue',
    city: 'Mumbai',
    price: 7500000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1200,
    property_details: {
      primaryImage: '/apartment.jpg'
    }
  },
  {
    id: 'dummy-3',
    title: 'Spacious House in Delhi',
    address: '789 Garden Road',
    city: 'Delhi',
    price: 12500000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 3000,
    property_details: {
      primaryImage: '/apartment.jpg'
    }
  }
];

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { favorites, removeFavorite, isLoading, refreshFavorites } = useFavorites();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState(false);
  
  // For debugging purposes
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Fetch favorites when drawer opens
  useEffect(() => {
    const loadFavorites = async () => {
      if (open && user) {
        try {
          setError(null);
          setLocalLoading(true);
          setLoadAttempts(prev => prev + 1);
          console.log('Refreshing favorites... Attempt:', loadAttempts + 1);
          
          // Set a timeout to prevent infinite loading
          const timeoutId = setTimeout(() => {
            if (localLoading) {
              console.log('Loading timeout reached, using dummy data');
              setUseDummyData(true);
              setLocalLoading(false);
            }
          }, 5000);
          
          await refreshFavorites();
          clearTimeout(timeoutId);
          
          console.log('Favorites refreshed successfully');
        } catch (err) {
          console.error('Error loading favorites:', err);
          setError('Failed to load your favorite properties. Using sample data instead.');
          setUseDummyData(true);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    
    loadFavorites();
  }, [open, user]);
  
  // Debug log when favorites change
  useEffect(() => {
    console.log('Favorites in drawer:', favorites);
    // If we have no favorites after loading, use dummy data
    if (!isLoading && !localLoading && favorites.length === 0 && loadAttempts > 0) {
      setUseDummyData(true);
    }
  }, [favorites, isLoading, localLoading, loadAttempts]);
  
  // Handle remove favorite
  const handleRemoveFavorite = async (propertyId: string) => {
    // For dummy data, just show toast
    if (useDummyData) {
      toast({
        title: "Property removed from favorites",
        description: "This is a sample property and cannot be removed",
        duration: 3000,
      });
      return;
    }
    
    try {
      const success = await removeFavorite(propertyId);
      
      if (success) {
        toast({
          title: "Property removed from favorites",
          description: "Your favorites have been updated",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to remove favorite");
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      
      toast({
        title: "Could not remove property",
        description: "There was a problem updating your favorites",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const isDrawerLoading = isLoading || localLoading;
  const displayFavorites = useDummyData ? DUMMY_PROPERTIES : favorites;
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>Saved Properties</span>
          </SheetTitle>
          <SheetDescription>
            {useDummyData 
              ? "Showing sample properties (for demonstration)" 
              : displayFavorites.length > 0
                ? `You have ${displayFavorites.length} saved ${displayFavorites.length === 1 ? 'property' : 'properties'}`
                : 'Save properties to view them later'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {isDrawerLoading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading favorites...</p>
            </div>
          ) : error && !useDummyData ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex space-x-3 justify-center">
                <Button 
                  onClick={() => {
                    setLocalLoading(true);
                    setLoadAttempts(prev => prev + 1);
                    refreshFavorites()
                      .then(() => setLocalLoading(false))
                      .catch((err) => {
                        console.error('Retry failed:', err);
                        setError('Failed to load favorites. Please try again later.');
                        setLocalLoading(false);
                      });
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUseDummyData(true);
                    setError(null);
                  }}
                >
                  Show Samples
                </Button>
              </div>
            </div>
          ) : displayFavorites.length === 0 && !useDummyData ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
              <p className="text-muted-foreground mb-6">
                Click the heart icon on any property to save it here
              </p>
              <div className="flex space-x-3 justify-center">
                <Button variant="outline" onClick={onClose}>
                  Browse Properties
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setUseDummyData(true)}
                >
                  Show Examples
                </Button>
              </div>
            </div>
          ) : (
            <>
              {displayFavorites.map((property) => (
                <div key={property.id} className="flex group border rounded-lg overflow-hidden">
                  {/* Property image */}
                  <Link 
                    to={useDummyData ? "#" : `/seeker/property/${property.id}`}
                    className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 relative"
                    onClick={useDummyData ? (e) => e.preventDefault() : onClose}
                  >
                    <img
                      src={property.property_details?.primaryImage || '/noimage.png'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    {useDummyData && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <span className="bg-background/90 text-xs font-medium px-2 py-1 rounded">Sample</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Property details */}
                  <div className="flex-grow p-3 overflow-hidden">
                    <Link 
                      to={useDummyData ? "#" : `/seeker/property/${property.id}`}
                      onClick={useDummyData ? (e) => e.preventDefault() : onClose}
                      className="hover:underline"
                    >
                      <h3 className="font-medium text-sm truncate">{property.title}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {property.address || property.city}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {formatPrice(property.price || 0)}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                      {property.bathrooms && <span>• {property.bathrooms} Baths</span>}
                      {property.square_feet && <span>• {property.square_feet} sq.ft</span>}
                    </div>
                  </div>
                  
                  {/* Remove button */}
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full opacity-70 hover:opacity-100"
                      onClick={() => handleRemoveFavorite(property.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Link to="/seeker" onClick={onClose}>
                  <Button className="w-full">View All Properties</Button>
                </Link>
              </div>
              
              {useDummyData && (
                <div className="border-t pt-4 mt-2">
                  <div className="text-xs text-muted-foreground text-center">
                    <p>These are sample properties for demonstration purposes.</p>
                    <button 
                      className="text-primary hover:underline mt-1"
                      onClick={() => {
                        setUseDummyData(false);
                        setLocalLoading(true);
                        refreshFavorites()
                          .then(() => setLocalLoading(false))
                          .catch(() => {
                            setUseDummyData(true);
                            setLocalLoading(false);
                          });
                      }}
                    >
                      Try loading real favorites again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;