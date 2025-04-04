// src/modules/seeker/components/FavoritesDrawer.tsx
// Version: 1.6.0
// Last Modified: 05-04-2025 16:45 IST
// Purpose: Removed dummy data while maintaining functionality

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
  
  // Fetch favorites when drawer opens
  useEffect(() => {
    const loadFavorites = async () => {
      if (open && user) {
        try {
          setError(null);
          setLocalLoading(true);
          console.log('Refreshing favorites...');
          
          // Set a timeout to prevent infinite loading
          const timeoutId = setTimeout(() => {
            if (localLoading) {
              console.log('Loading timeout reached');
              setLocalLoading(false);
              setError('Loading took too long. Please try again.');
            }
          }, 10000);
          
          await refreshFavorites();
          clearTimeout(timeoutId);
          
          console.log('Favorites refreshed successfully');
        } catch (err) {
          console.error('Error loading favorites:', err);
          setError('Failed to load your favorite properties. Please try again.');
        } finally {
          setLocalLoading(false);
        }
      }
    };
    
    loadFavorites();
  }, [open, user]);
  
  // Handle remove favorite
  const handleRemoveFavorite = async (propertyId: string) => {
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
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>Saved Properties</span>
          </SheetTitle>
          <SheetDescription>
            {favorites.length > 0
              ? `You have ${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}`
              : 'Save properties to view them later'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {isDrawerLoading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading favorites...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                onClick={() => {
                  setLocalLoading(true);
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
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
              <p className="text-muted-foreground mb-6">
                Click the heart icon on any property to save it here
              </p>
              <Button variant="outline" onClick={onClose}>
                Browse Properties
              </Button>
            </div>
          ) : (
            <>
              {favorites.map((property) => (
                <div key={property.id} className="flex group border rounded-lg overflow-hidden">
                  {/* Property image */}
                  <Link 
                    to={`/seeker/property/${property.id}`} 
                    className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 relative"
                    onClick={onClose}
                  >
                    <img
                      src={property.property_details?.primaryImage || '/noimage.png'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  
                  {/* Property details */}
                  <div className="flex-grow p-3 overflow-hidden">
                    <Link 
                      to={`/seeker/property/${property.id}`}
                      onClick={onClose}
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;