// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 3.0.0
// Last Modified: 03-04-2025 13:45 IST
// Purpose: Updated to use standardized header component

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyDetails from '../components/PropertyDetails';
import PropertyHeader from '../components/PropertyHeader';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeftIcon, 
  HomeIcon, 
  ArrowLeftIcon, 
  Share2Icon,
  PrinterIcon
} from 'lucide-react';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { property, loading, error, isLiked, toggleLike } = usePropertyDetails();
  const [showFavorites, setShowFavorites] = useState(false);

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || 'Check out this property',
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Toggle favorites drawer
  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PropertyHeader onFavoritesClick={toggleFavorites} />
        
        <div className="min-h-[80vh] container mx-auto py-16 px-4 flex items-center justify-center">
          <div className="max-w-lg mx-auto bg-background rounded-xl shadow-lg p-8 text-center border border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <ArrowLeftIcon className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the property you're looking for. It may have been removed or the URL might be incorrect.
            </p>
            <Button size="lg" onClick={handleBack}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Standardized header component */}
      <PropertyHeader onFavoritesClick={toggleFavorites} />
      
      <div className="container mx-auto py-8 px-4">
        {/* Navigation bar with breadcrumbs and actions */}
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm py-3 px-4 rounded-lg mb-6 flex flex-wrap justify-between items-center border border-border/30 shadow-sm">
          {/* Left side: Breadcrumbs */}
          <div className="flex items-center text-sm overflow-hidden">
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center min-w-fit">
              <HomeIcon className="h-4 w-4 mr-1" />
              <span>Home</span>
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/seeker/browse" className="text-muted-foreground hover:text-foreground min-w-fit">
              Properties
            </Link>
            {property && (
              <>
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[250px]">
                  {property.title}
                </span>
              </>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2 ml-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="text-xs"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-xs"
            >
              <Share2Icon className="h-3.5 w-3.5 mr-1" />
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="text-xs"
            >
              <PrinterIcon className="h-3.5 w-3.5 mr-1" />
              Print
            </Button>
          </div>
        </div>

        {/* Property details */}
        <PropertyDetails
          property={property}
          isLiked={isLiked}
          onToggleLike={toggleLike}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default PropertyDetailPage;