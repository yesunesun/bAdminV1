// src/modules/seeker/components/PropertyDetails/NearbyPropertiesDialog.tsx
// Version: 1.2.0
// Last Modified: 19-05-2025 13:10 IST
// Purpose: Made button more prominent with bright color and fixed styling

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNearbyProperties } from '../../services/propertyService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPinIcon, Loader2Icon, HomeIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface NearbyPropertiesDialogProps {
  propertyId: string;
  coordinates: { lat: number; lng: number } | null;
  radius?: number;
}

const NearbyPropertiesDialog: React.FC<NearbyPropertiesDialogProps> = ({
  propertyId,
  coordinates,
  radius = 5
}) => {
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Format price for Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Load nearby properties when dialog opens
  useEffect(() => {
    if (open && coordinates && propertyId) {
      setLoading(true);
      
      fetchNearbyProperties(propertyId, coordinates.lat, coordinates.lng, radius)
        .then(properties => {
          setNearbyProperties(properties);
          if (properties.length === 0) {
            toast({
              title: "No nearby properties found",
              description: `We couldn't find any properties within ${radius}km of this location.`,
              variant: "default"
            });
          }
        })
        .catch(error => {
          console.error('Error fetching nearby properties:', error);
          toast({
            title: "Error loading nearby properties",
            description: "Something went wrong. Please try again later.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, coordinates, propertyId, radius, toast]);

  // Handle navigation to a property
  const handlePropertyClick = (id: string) => {
    setOpen(false);
    navigate(`/property/${id}`);
  };

  if (!coordinates) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          className="font-medium bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md flex items-center gap-2"
        >
          <MapPinIcon className="h-4 w-4" />
          <span>Nearby Properties</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <span>Properties within {radius}km</span>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2Icon className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Searching for nearby properties...</p>
          </div>
        ) : (
          <>
            {nearbyProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <HomeIcon className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  No properties found within {radius}km of this location.
                  <br />
                  Try expanding your search radius.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {nearbyProperties.map(property => (
                  <Card 
                    key={property.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    <div className="relative h-32 bg-muted">
                      <img
                        src={property.property_details?.primaryImage || '/noimage.png'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/noimage.png';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded text-xs font-medium">
                        {property.distance} km away
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1 mb-1">{property.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">
                          {formatPrice(property.price || 0)}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">
                            {property.city || property.property_details?.location?.city || 'Unknown location'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NearbyPropertiesDialog;