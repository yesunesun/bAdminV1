// src/modules/seeker/pages/PropertyDetailPage.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 16:00 IST
// Purpose: Page component for property details

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyDetails from '../components/PropertyDetails';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, HomeIcon, ArrowLeftIcon } from 'lucide-react';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { property, loading, error, isLiked, toggleLike } = usePropertyDetails();

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the property you're looking for. It may have been removed or the URL might be incorrect.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center mb-6 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center">
          <HomeIcon className="h-4 w-4 mr-1" />
          <span>Home</span>
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link to="/seeker" className="text-muted-foreground hover:text-foreground">
          Properties
        </Link>
        {property && (
          <>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {property.title}
            </span>
          </>
        )}
      </div>

      {/* Back button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="mb-6"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      {/* Property details */}
      <PropertyDetails
        property={property}
        isLiked={isLiked}
        onToggleLike={toggleLike}
        isLoading={loading}
      />
    </div>
  );
};

export default PropertyDetailPage;