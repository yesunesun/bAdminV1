// src/contexts/VisitedPropertiesContext.tsx
// Version: 1.0.0
// Purpose: Track visited properties using localStorage and provide context for UI indicators

import React, { createContext, useContext, useState, useEffect } from 'react';

interface VisitedProperty {
  id: string;
  visitedAt: string;
  title?: string;
  price?: number;
  location?: string;
  propertyType?: string;
  transactionType?: string;
  primary_image?: string;
}

interface VisitedPropertiesContextType {
  visitedProperties: VisitedProperty[];
  isVisited: (propertyId: string) => boolean;
  addVisit: (property: VisitedProperty) => void;
  getRecentVisited: (limit?: number) => VisitedProperty[];
  clearVisitedHistory: () => void;
  visitedCount: number;
}

const VisitedPropertiesContext = createContext<VisitedPropertiesContextType | undefined>(undefined);

const STORAGE_KEY = 'bhoomitalli_visited_properties';
const MAX_VISITED_PROPERTIES = 50; // Limit storage size

export const VisitedPropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitedProperties, setVisitedProperties] = useState<VisitedProperty[]>([]);

  // Load visited properties from localStorage on mount
  useEffect(() => {
    try {
      const storedVisited = localStorage.getItem(STORAGE_KEY);
      if (storedVisited) {
        const parsed = JSON.parse(storedVisited);
        if (Array.isArray(parsed)) {
          setVisitedProperties(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading visited properties:', error);
    }
  }, []);

  // Save to localStorage whenever visitedProperties changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedProperties));
    } catch (error) {
      console.error('Error saving visited properties:', error);
    }
  }, [visitedProperties]);

  // Check if a property has been visited
  const isVisited = (propertyId: string): boolean => {
    return visitedProperties.some(property => property.id === propertyId);
  };

  // Add a property visit
  const addVisit = (property: VisitedProperty) => {
    setVisitedProperties(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(p => p.id !== property.id);
      
      // Add new entry at the beginning (most recent first)
      const updated = [
        {
          ...property,
          visitedAt: new Date().toISOString()
        },
        ...filtered
      ];

      // Limit the number of stored properties
      return updated.slice(0, MAX_VISITED_PROPERTIES);
    });
  };

  // Get recent visited properties
  const getRecentVisited = (limit: number = 10): VisitedProperty[] => {
    return visitedProperties
      .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
      .slice(0, limit);
  };

  // Clear all visited history
  const clearVisitedHistory = () => {
    setVisitedProperties([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <VisitedPropertiesContext.Provider
      value={{
        visitedProperties,
        isVisited,
        addVisit,
        getRecentVisited,
        clearVisitedHistory,
        visitedCount: visitedProperties.length
      }}
    >
      {children}
    </VisitedPropertiesContext.Provider>
  );
};

export const useVisitedProperties = () => {
  const context = useContext(VisitedPropertiesContext);
  if (context === undefined) {
    throw new Error('useVisitedProperties must be used within a VisitedPropertiesProvider');
  }
  return context;
};