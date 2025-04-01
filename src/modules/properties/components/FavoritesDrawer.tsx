// src/modules/properties/components/FavoritesDrawer.tsx
// Version: 1.0.0
// Last Modified: 02-04-2025 16:45 IST
// Purpose: Sliding drawer that shows user's favorite properties

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { getUserFavorites, removeFavorite } from '@/modules/seeker/services/seekerService';
import { formatPrice } from '../services/propertyMapService';

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch user's favorite properties
  useEffect(() => {
    if (open && user) {
      const fetchFavorites = async () => {
        setLoading(true);
        try {
          const favProperties = await getUserFavorites();
          setFavorites(favProperties as PropertyType[]);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFavorites();
    }
  }, [open, user]);
  
  // Handle remove favorite
  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite(propertyId);
      setFavorites(favorites.filter(prop => prop.id !== propertyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };
  
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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