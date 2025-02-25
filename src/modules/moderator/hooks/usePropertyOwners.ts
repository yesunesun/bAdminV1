// src/modules/moderator/hooks/usePropertyOwners.ts
// Version: 1.0.0
// Last Modified: 25-02-2025 20:30 IST
// Purpose: Custom hook to fetch and manage property owner data

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Property } from '@/components/property/types';

export interface PropertyOwner {
  id: string;
  email: string;
  name?: string;
}

export function usePropertyOwners(properties: Property[]) {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [ownersMap, setOwnersMap] = useState<Record<string, PropertyOwner>>({});
  const [loadingOwners, setLoadingOwners] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoadingOwners(true);
        
        // Get unique owner IDs
        const ownerIds = [...new Set(properties.map(p => p.owner_id))];
        
        if (ownerIds.length === 0) {
          setOwners([]);
          setOwnersMap({});
          return;
        }
        
        // Fetch owner information from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds);
          
        if (error) throw error;
        
        // Create a map for quick lookup
        const ownersData = data as PropertyOwner[];
        const ownersMapData = ownersData.reduce((acc, owner) => {
          acc[owner.id] = owner;
          return acc;
        }, {} as Record<string, PropertyOwner>);
        
        setOwners(ownersData);
        setOwnersMap(ownersMapData);
        
      } catch (err) {
        console.error('Error fetching property owners:', err);
      } finally {
        setLoadingOwners(false);
      }
    };
    
    fetchOwners();
  }, [properties]);

  return { owners, ownersMap, loadingOwners };
}