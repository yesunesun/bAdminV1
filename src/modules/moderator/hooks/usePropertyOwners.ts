// src/modules/moderator/hooks/usePropertyOwners.ts
// Version: 1.2.0
// Last Modified: 26-02-2025 22:15 IST
// Purpose: Custom hook to fetch and manage property owner data from property objects

import { useState, useEffect } from 'react';
import { Property } from '@/components/property/types';

export interface PropertyOwner {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

export function usePropertyOwners(properties: Property[]) {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [ownersMap, setOwnersMap] = useState<Record<string, PropertyOwner>>({});
  const [loadingOwners, setLoadingOwners] = useState(false);

  useEffect(() => {
    // Get owners directly from the property objects
    const extractOwners = () => {
      setLoadingOwners(true);
      
      try {
        // Get unique owner IDs and create owner objects with emails
        const uniqueOwners = new Map<string, PropertyOwner>();
        
        properties.forEach(property => {
          // Skip if we already processed this owner
          if (uniqueOwners.has(property.owner_id)) return;
          
          // Create owner object using the property's owner_email if available
          uniqueOwners.set(property.owner_id, {
            id: property.owner_id,
            email: property.owner_email || property.owner_id,
            name: property.owner_name
          });
        });
        
        // Convert Map to array
        const ownersArray = Array.from(uniqueOwners.values());
        
        // Create a lookup map
        const ownersMapData = ownersArray.reduce((acc, owner) => {
          acc[owner.id] = owner;
          return acc;
        }, {} as Record<string, PropertyOwner>);
        
        setOwners(ownersArray);
        setOwnersMap(ownersMapData);
      } catch (err) {
        console.error('Error processing property owners:', err);
      } finally {
        setLoadingOwners(false);
      }
    };
    
    extractOwners();
  }, [properties]);

  return { owners, ownersMap, loadingOwners };
}