// src/modules/seeker/components/PropertyDetails/index.tsx
// Version: 3.10.0
// Last Modified: 08-04-2025 14:30 IST
// Purpose: Fixed Schedule Visit button to open visit dialog instead of print

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyDetails as PropertyDetailsType } from '../../hooks/usePropertyDetails';
import PropertyGallery from './PropertyGallery';
import PropertyLocationMap from './PropertyLocationMap';
import NearbyAmenities from './NearbyAmenities';
import SimilarProperties from './SimilarProperties';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Home, 
  Heart, 
  Share2, 
  Calendar, 
  Info, 
  BedDouble, 
  Bath, 
  Square, 
  Building, 
  AlertCircle
} from 'lucide-react';
import ContactOwnerForm from './ContactOwnerForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { submitVisitRequest } from '../../services/seekerService';

// Static similar properties data
const similarPropertiesData = [
  {
    id: 'similar-1',
    title: 'Luxury Apartment in City Center',
    address: '',
    city: 'Madhapur',
    state: 'Hyderabad',
    price: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1600,
    property_details: { propertyType: 'Apartment' }
  },
  {
    id: 'similar-2',
    title: 'Modern Villa with Garden',
    address: '',
    city: 'Gachibowli',
    state: 'Hyderabad',
    price: 12000000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2200,
    property_details: { propertyType: 'Villa' }
  },
  {
    id: 'similar-3',
    title: 'Affordable 2BHK Near Metro',
    address: '',
    city: 'Miyapur',
    state: 'Hyderabad',
    price: 4500000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1100,
    property_details: { propertyType: 'Apartment' }
  }
];

interface PropertyDetailsProps {
  property: PropertyDetailsType | null;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  isLiked,
  onToggleLike,
  isLoading
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // Visit scheduling dialog state
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  
  // Add debugging for property data
  useEffect(() => {
    console.log('[PropertyDetails Component] Received property data:', property);
    console.log('[PropertyDetails Component] Loading state:', isLoading);
    
    if (property) {
      // Check key property fields
      console.log('[PropertyDetails Component] Key fields check:');
      console.log('- title:', property.title);
      console.log('- address:', property.address);
      console.log('- description:', property.description);
      console.log('- price:', property.price);
      console.log('- bedrooms:', property.bedrooms);
      console.log('- bathrooms:', property.bathrooms);
      console.log('- square_feet:', property.square_feet);
      console.log('- property_details:', property.property_details);
      console.log('- property_images:', property.property_images?.length || 0, 'images');
      console.log('- ownerInfo:', property.ownerInfo);
    }
  }, [property, isLoading]);
  
  // Handle visit request submission
  const handleVisitRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to schedule a visit",
        variant: "destructive"
      });
      return;
    }

    if (!visitDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your visit",
        variant: "destructive"
      });
      return;
    }

    if (!property) {
      toast({
        title: "Error",
        description: "Property information is not available",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingVisit(true);
    
    // Format datetime by combining date and time
    const visitDateTime = visitTime 
      ? new Date(`${visitDate}T${visitTime}`)
      : new Date(visitDate);
    
    try {
      await submitVisitRequest(
        property.id, 
        user.id, 
        visitDateTime, 
        visitMessage
      );
      
      toast({
        title: "Visit Request Submitted",
        description: "Your visit request has been sent to the property owner",
        variant: "default"
      });
      
      setVisitDialogOpen(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your visit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingVisit(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }
  
  // Error state - Property not found
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Property Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          This property may have been removed or is no longer available.
        </p>
        <Button variant="default" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  // Ensure property has required fields with defaults
  const safeProperty = {
    ...property,
    title: property.title || "Untitled Property",
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    square_feet: property.square_feet || 0,
    description: property.description || "No description provided for this property.",
    property_details: property.property_details || {},
    property_images: property.property_images || []
  };
  
  // Format price with Indian notation (₹)
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };
  
  // Get formatted location string
  const getLocationString = () => {
    return [safeProperty.address, safeProperty.city, safeProperty.state, safeProperty.zip_code]
      .filter(Boolean)
      .join(", ") || "Location not specified";
  };
  
  // Get property coordinates from property_details if available
  const getPropertyCoordinates = () => {
    const lat = parseFloat(safeProperty.property_details?.latitude || '0');
    const lng = parseFloat(safeProperty.property_details?.longitude || '0');
    
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
    return undefined;
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Property Title Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{safeProperty.title}</h1>
        <div className="flex items-center text-muted-foreground mt-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{getLocationString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden border-border/40 shadow-md">
            <PropertyGallery 
              images={safeProperty.property_images} 
            />
          </Card>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant={isLiked ? "default" : "outline"} 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={() => onToggleLike()}
            >
              <Heart className={cn(
                "h-4 w-4 mr-2",
                isLiked ? "fill-white" : "fill-none"
              )} />
              {isLiked ? "Saved" : "Save"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: safeProperty.title,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setVisitDialogOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
          </div>
          
          {/* Property Overview */}
          <Card className={cn(
            "border-border/40 shadow-md",
            theme === 'ocean' ? "bg-card" : "bg-card"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-3xl font-bold text-primary">
                    {formatPrice(safeProperty.price)}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {safeProperty.property_details?.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/60">
                    <BedDouble className="h-5 w-5 text-primary mb-1" />
                    <span className="font-medium">{safeProperty.bedrooms}</span>
                    <span className="text-xs text-muted-foreground">Beds</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/60">
                    <Bath className="h-5 w-5 text-primary mb-1" />
                    <span className="font-medium">{safeProperty.bathrooms}</span>
                    <span className="text-xs text-muted-foreground">Baths</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 rounded-lg bg-background/60">
                    <Square className="h-5 w-5 text-primary mb-1" />
                    <span className="font-medium">{safeProperty.square_feet}</span>
                    <span className="text-xs text-muted-foreground">Sq.ft</span>
                  </div>
                </div>
              </div>
              
              {/* About this property */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  About this Property
                </h3>
                <p className="text-muted-foreground">
                  {safeProperty.description}
                </p>
              </div>
              
              {/* Property Type and Features */}
              {safeProperty.property_details && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <p className="font-medium">{safeProperty.property_details.propertyType || "Not specified"}</p>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Year Built</span>
                      <p className="font-medium">{safeProperty.property_details.yearBuilt || "Not specified"}</p>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Furnishing</span>
                      <p className="font-medium">{safeProperty.property_details.furnishing || "Not specified"}</p>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Availability</span>
                      <p className="font-medium">{safeProperty.property_details.availability || "Not specified"}</p>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Floor</span>
                      <p className="font-medium">{safeProperty.property_details.floor || "Not specified"}</p>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Facing</span>
                      <p className="font-medium">{safeProperty.property_details.facing || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Amenities */}
              {safeProperty.property_details?.amenities && safeProperty.property_details.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {safeProperty.property_details.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Property Location Map */}
          <PropertyLocationMap
            address={safeProperty.address || ''}
            city={safeProperty.city || ''}
            state={safeProperty.state || ''}
            zipCode={safeProperty.zip_code || ''}
            coordinates={getPropertyCoordinates()}
          />
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Contact Owner Card */}
          <Card className="border-border/40 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Property Owner</h3>
              
              {user ? (
                <>
                  {safeProperty.ownerInfo ? (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Listed by:</p>
                      <p className="font-medium">{safeProperty.ownerInfo.email || "Owner"}</p>
                      {safeProperty.ownerInfo.phone && (
                        <p className="text-primary font-medium mt-1">{safeProperty.ownerInfo.phone}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground mb-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Owner information not available</span>
                    </div>
                  )}
                  
                  <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Contact Owner</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <ContactOwnerForm 
                        propertyTitle={safeProperty.title}
                        propertyId={safeProperty.id}
                        ownerId={safeProperty.owner_id}
                        onSuccess={() => setContactDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Please sign in to contact the owner</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Property Highlights */}
          {safeProperty.property_details?.highlights && safeProperty.property_details.highlights.length > 0 && (
            <Card className="border-border/40 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Property Highlights</h3>
                <ul className="space-y-2">
                  {safeProperty.property_details.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Similar Properties */}
          <SimilarProperties 
            properties={similarPropertiesData.map(prop => ({
              id: prop.id,
              title: prop.title,
              city: prop.city,
              state: prop.state,
              price: prop.price,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              square_feet: prop.square_feet
            }))} 
          />
          
          {/* Nearby Amenities - now in the sidebar below Similar Properties */}
          <NearbyAmenities
            address={safeProperty.address || ''}
            city={safeProperty.city || ''}
            state={safeProperty.state || ''}
            coordinates={getPropertyCoordinates()}
            radius={1500} // 1.5km radius
          />
        </div>
      </div>
      
      {/* Visit Request Dialog */}
      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  htmlFor="visit-date" 
                  className="text-sm font-medium flex items-center"
                >
                  Preferred Date <span className="text-destructive ml-1">*</span>
                </label>
                <Input
                  id="visit-date"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="visit-time" 
                  className="text-sm font-medium"
                >
                  Preferred Time
                </label>
                <Input
                  id="visit-time"
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="visit-message" 
                className="text-sm font-medium"
              >
                Message to Owner (Optional)
              </label>
              <Textarea
                id="visit-message"
                placeholder="Any specific details or questions about your visit"
                value={visitMessage}
                onChange={(e) => setVisitMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setVisitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVisitRequest} 
              disabled={isSubmittingVisit || !visitDate}
            >
              {isSubmittingVisit ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Loading state skeleton
const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery skeleton */}
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          
          {/* Actions skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          {/* Details skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between mb-6">
                <Skeleton className="h-8 w-36 mb-2" />
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          
          {/* Map skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Contact card skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          {/* Similar properties skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Nearby amenities skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;