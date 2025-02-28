// src/modules/owner/hooks/usePropertyOwner.ts
// Version: 5.1.0
// Last Modified: 28-02-2025 17:10 IST
// Purpose: Optimized property owner hook with caching and fixed publish functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { Property } from '../components/property/PropertyFormTypes';

export const usePropertyOwner = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Use a ref to track if properties have been loaded
  const propertiesLoadedRef = useRef(false);

  const fetchUserProperties = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Skip fetching if already loaded and not forcing refresh
    if (propertiesLoadedRef.current && !forceRefresh) {
      console.log('Skipping property fetch - already loaded');
      return;
    }
    
    try {
      console.log('Fetching properties for user:', user.id);
      setLoading(true);
      setError(null);
      
      const propertiesData = await propertyService.getUserProperties(user.id);
      
      console.log('Properties fetched:', propertiesData?.length || 0);
      setProperties(propertiesData || []);
      propertiesLoadedRef.current = true;
    } catch (err) {
      console.error('Error in usePropertyOwner:', err);
      setError('Failed to load your properties');
      propertiesLoadedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchUserProperties();
  }, [fetchUserProperties]);

  const handleDeleteProperty = async (propertyId: string) => {
    if (!user) return;
    
    try {
      setUpdating(propertyId);
      await propertyService.deleteProperty(propertyId, user.id);
      
      // Update local state after successful deletion
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    } finally {
      setUpdating(null);
    }
  };

  const handleTogglePublishStatus = async (propertyId: string, currentStatus: 'draft' | 'published') => {
    if (!user) {
      setError('You must be logged in to update properties');
      return;
    }
    
    try {
      setUpdating(propertyId);
      setError(null);
      
      // Determine new status (toggle between draft and published)
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      console.log(`Updating property ${propertyId} status from ${currentStatus} to ${newStatus}`);
      
      // Update property status using service - FIXED: Added user.id parameter
      await propertyService.updatePropertyStatus(propertyId, newStatus, user.id);
      
      // Update local state after successful update
      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId ? { ...p, status: newStatus } : p
        )
      );
      
    } catch (err: any) {
      console.error('Error toggling property status:', err);
      setError(err.message || 'Failed to update property status');
      
      // Show the error for 5 seconds, then clear it
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdating(null);
    }
  };

  // Force refresh - resets the loaded flag and fetches data
  const refreshProperties = useCallback(() => {
    propertiesLoadedRef.current = false;
    return fetchUserProperties(true);
  }, [fetchUserProperties]);

  return {
    properties,
    loading,
    error,
    updating,
    handleDeleteProperty,
    handleTogglePublishStatus,
    refreshProperties
  };
};