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

  // Enhanced logging for debugging
  console.log('[FlowContext] Provider rendered with:', {
    'useParams()': params,
    'pathname': location.pathname,
    'search': location.search
  });

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
    console.log('[FlowContext] Extracting params from path:', pathname);
    
    // Match pattern: /properties/list/{category}/{type}[/{step}]
    const pathRegex = /\/properties\/list\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/;
    const match = pathname.match(pathRegex);
    
    if (match) {
      const [, category, type] = match;
      console.log('[FlowContext] ✅ Extracted from URL:', { category, type });
      return { category, type };
    }
    
    console.log('[FlowContext] ❌ No match found in path');
    return { category: null, type: null };
  };

  // Convert URL type to internal flow type
  const getFlowTypeFromParams = (category: string, listingType: string): string | null => {
    const normalizedCategory = category.toLowerCase();
    const normalizedType = listingType.toLowerCase();

    console.log('[FlowContext] getFlowTypeFromParams:', { category, listingType, normalizedCategory, normalizedType });

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
          console.warn('[FlowContext] Unknown residential type:', normalizedType);
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
          console.warn('[FlowContext] Unknown commercial type:', normalizedType);
          return null;
      }
    } else if (normalizedCategory === 'land') {
      switch (normalizedType) {
        case 'sale':
          return FLOW_TYPES.LAND_SALE;
        default:
          console.warn('[FlowContext] Unknown land type:', normalizedType);
          return null;
      }
    }

    console.warn('[FlowContext] Unknown category:', normalizedCategory);
    return null;
  };

  // Update flow type when URL parameters change
  useEffect(() => {
    console.log('[FlowContext] useEffect triggered - URL changed:', location.pathname);
    
    setIsLoading(true);

    // Try to get parameters from useParams first
    let category = params.category;
    let type = params.type;
    
    console.log('[FlowContext] useParams result:', { category, type });

    // If useParams doesn't work, parse URL directly
    if (!category || !type) {
      console.log('[FlowContext] useParams failed, parsing URL directly...');
      const extracted = extractParamsFromPath(location.pathname);
      category = extracted.category;
      type = extracted.type;
      console.log('[FlowContext] Direct parsing result:', { category, type });
    }

    if (category && type) {
      const detectedFlowType = getFlowTypeFromParams(category, type);
      
      console.log('[FlowContext] Flow detection result:', {
        category,
        type,
        detectedFlowType,
        availableFlowTypes: Object.values(FLOW_TYPES)
      });
      
      if (detectedFlowType) {
        setFlowType(detectedFlowType);
        setIsValidFlow(true);
        console.log('[FlowContext] ✅ Valid flow detected:', {
          category,
          type,
          flowType: detectedFlowType
        });
      } else {
        console.warn('[FlowContext] ❌ Invalid flow combination:', { category, type });
        setFlowType('');
        setIsValidFlow(false);
      }
    } else {
      console.log('[FlowContext] ⚠️ Missing URL parameters - showing type selection');
      setFlowType('');
      setIsValidFlow(false);
    }
    
    setIsLoading(false);
  }, [params.category, params.type, location.pathname]);

  // Function to set flow and navigate
  const setFlow = (newCategory: string, newListingType: string) => {
    console.log('[FlowContext] setFlow called:', { newCategory, newListingType });
    
    // Convert display names to URL-friendly names if needed
    const urlFriendlyType = DISPLAY_TO_URL_MAPPINGS[newListingType] || newListingType.toLowerCase();
    
    console.log('[FlowContext] URL-friendly type conversion:', {
      original: newListingType,
      urlFriendly: urlFriendlyType
    });
    
    // Validate the combination before navigating
    const testFlowType = getFlowTypeFromParams(newCategory, urlFriendlyType);
    
    if (testFlowType) {
      const newPath = `/properties/list/${newCategory.toLowerCase()}/${urlFriendlyType}/details`;
      console.log('[FlowContext] 🚀 Navigating to:', newPath);
      console.log('[FlowContext] Current location before navigation:', location.pathname);
      
      navigate(newPath);
      
      // Log after navigation attempt
      setTimeout(() => {
        console.log('[FlowContext] Location after navigation attempt:', window.location.pathname);
      }, 100);
    } else {
      console.error('[FlowContext] ❌ Invalid flow combination, cannot navigate:', { newCategory, newListingType });
    }
  };

  // Function to redirect to property selection
  const redirectToPropertySelection = () => {
    console.log('[FlowContext] Redirecting to property selection');
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

  console.log('[FlowContext] Providing context value:', contextValue);

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