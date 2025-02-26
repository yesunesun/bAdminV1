// src/modules/seeker/hooks/usePropertyDetails.ts
// Version: 1.0.0
// Last Modified: 26-02-2025 15:05 IST
// Purpose: Hook for fetching and managing property details

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPropertyById, togglePropertyLike, checkPropertyLike } from '../services/seekerService';
import { PropertyType } from '@/modules/owner/components/property/types';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyWithOwner extends PropertyType {
  profiles: {
    id: string;
    email: string;
    phone: string;
    role: string;
  };
}

export const usePropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyWithOwner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const propertyData = await fetchPropertyById(id);
        setProperty(propertyData as PropertyWithOwner);
        
        // Check if user has liked this property
        if (user) {
          const { liked } = await checkPropertyLike(id, user.id);
          setIsLiked(liked);
        }
        
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPropertyDetails();
  }, [id, user]);

  const handleToggleLike = async () => {
    if (!id || !user) {
      return { success: false, message: 'You need to be logged in to like properties' };
    }

    try {
      const { liked } = await togglePropertyLike(id, user.id);
      setIsLiked(liked);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to update like status' };
    }
  };

  return {
    property,
    loading,
    error,
    isLiked,
    toggleLike: handleToggleLike
  };
};