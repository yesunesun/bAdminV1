// src/contexts/FlowContext.tsx
// Version: 1.2.0
// Last Modified: 25-05-2025 22:00 IST
// Purpose: Fixed to parse URL directly when useParams fails

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FLOW_TYPES } from '../modules/owner/components/property/wizard/constants/flows';

type FlowContextType = {
  flowType: string;
  category: string;
  listingType: string;
  setFlow: (category: string, listingType: string) => void;
  isValidFlow: boolean;
  isLoading: boolean;
  redirectToPropertySelection: () => void;
};

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [flowType, setFlowType] = useState<string>('');
  const [isValidFlow, setIsValidFlow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Provider initialization

  // Mapping for URL-friendly types to display names
  const URL_TYPE_MAPPINGS: Record<string, string> = {
    'pghostel': 'PG/Hostel',
    'coworking': 'Co-working',
    'flatmates': 'Flatmates'
  };

  // Reverse mapping for display names to URL-friendly types
  const DISPLAY_TO_URL_MAPPINGS: Record<string, string> = {
    'PG/Hostel': 'pghostel',
    'Co-working': 'coworking',
    'Flatmates': 'flatmates'
  };

  // Function to extract category and type from URL path directly
  const extractParamsFromPath = (pathname: string): { category: string | null, type: string | null } => {
    // Match pattern: /properties/list/{category}/{type}[/{step}]
    const pathRegex = /\/properties\/list\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/;
    const match = pathname.match(pathRegex);
    
    if (match) {
      const [, category, type] = match;
      return { category, type };
    }
    
    return { category: null, type: null };
  };

  // Convert URL type to internal flow type
  const getFlowTypeFromParams = (category: string, listingType: string): string | null => {
    const normalizedCategory = category.toLowerCase();
    const normalizedType = listingType.toLowerCase();

    // Direct mapping based on category and listing type
    if (normalizedCategory === 'residential') {
      switch (normalizedType) {
        case 'rent':
          return FLOW_TYPES.RESIDENTIAL_RENT;
        case 'sale':
          return FLOW_TYPES.RESIDENTIAL_SALE;
        case 'pghostel':
          return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
        case 'flatmates':
          return FLOW_TYPES.RESIDENTIAL_FLATMATES;
        default:
          return null;
      }
    } else if (normalizedCategory === 'commercial') {
      switch (normalizedType) {
        case 'rent':
          return FLOW_TYPES.COMMERCIAL_RENT;
        case 'sale':
          return FLOW_TYPES.COMMERCIAL_SALE;
        case 'coworking':
          return FLOW_TYPES.COMMERCIAL_COWORKING;
        default:
          return null;
      }
    } else if (normalizedCategory === 'land') {
      switch (normalizedType) {
        case 'sale':
          return FLOW_TYPES.LAND_SALE;
        default:
          return null;
      }
    }

    return null;
  };

  // Update flow type when URL parameters change
  useEffect(() => {
    setIsLoading(true);

    // Try to get parameters from useParams first
    let category = params.category;
    let type = params.type;

    // If useParams doesn't work, parse URL directly
    if (!category || !type) {
      const extracted = extractParamsFromPath(location.pathname);
      category = extracted.category;
      type = extracted.type;
    }

    if (category && type) {
      const detectedFlowType = getFlowTypeFromParams(category, type);
      
      if (detectedFlowType) {
        setFlowType(detectedFlowType);
        setIsValidFlow(true);
      } else {
        setFlowType('');
        setIsValidFlow(false);
      }
    } else {
      setFlowType('');
      setIsValidFlow(false);
    }
    
    setIsLoading(false);
  }, [params.category, params.type, location.pathname]);

  // Function to set flow and navigate
  const setFlow = (newCategory: string, newListingType: string) => {
    // Convert display names to URL-friendly names if needed
    const urlFriendlyType = DISPLAY_TO_URL_MAPPINGS[newListingType] || newListingType.toLowerCase();
    
    // Validate the combination before navigating
    const testFlowType = getFlowTypeFromParams(newCategory, urlFriendlyType);
    
    if (testFlowType) {
      const newPath = `/properties/list/${newCategory.toLowerCase()}/${urlFriendlyType}/details`;
      navigate(newPath);
    }
  };

  // Function to redirect to property selection
  const redirectToPropertySelection = () => {
    navigate('/properties/list');
  };

  // Convert URL-friendly type to display name for external consumption
  const getDisplayType = (urlType: string): string => {
    return URL_TYPE_MAPPINGS[urlType] || urlType.charAt(0).toUpperCase() + urlType.slice(1);
  };

  // Get current category and type for context value
  const getCurrentParams = () => {
    // Try useParams first
    if (params.category && params.type) {
      return {
        category: params.category,
        type: params.type
      };
    }
    
    // Fallback to direct URL parsing
    const extracted = extractParamsFromPath(location.pathname);
    return {
      category: extracted.category || '',
      type: extracted.type || ''
    };
  };

  const currentParams = getCurrentParams();

  const contextValue: FlowContextType = {
    flowType,
    category: currentParams.category,
    listingType: currentParams.type ? getDisplayType(currentParams.type) : '',
    setFlow,
    isValidFlow,
    isLoading,
    redirectToPropertySelection
  };

  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
};

// Custom hook to use the flow context
export const useFlow = () => {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

// Helper function to get URL-friendly type from display type
export const getURLFriendlyType = (displayType: string): string => {
  const mapping: Record<string, string> = {
    'PG/Hostel': 'pghostel',
    'Co-working': 'coworking',
    'Flatmates': 'flatmates'
  };
  
  return mapping[displayType] || displayType.toLowerCase();
};

// Helper function to validate flow combination
export const isValidFlowCombination = (category: string, listingType: string): boolean => {
  const validCombinations = [
    // Residential
    { category: 'residential', types: ['rent', 'sale', 'pghostel', 'flatmates'] },
    // Commercial
    { category: 'commercial', types: ['rent', 'sale', 'coworking'] },
    // Land
    { category: 'land', types: ['sale'] }
  ];

  const normalizedCategory = category.toLowerCase();
  const normalizedType = listingType.toLowerCase();

  return validCombinations.some(combo => 
    combo.category === normalizedCategory && 
    combo.types.includes(normalizedType)
  );
};