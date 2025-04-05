// src/contexts/DebugThemeContext.tsx
// Version: 1.0.0
// Last Modified: 05-04-2025 21:15 IST
// Purpose: Debug theme context to toggle debug colors for layout visualization

import React, { createContext, useContext, useState } from 'react';

type DebugThemeContextType = {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  containerClass: string;
  contentClass: string;
};

const DebugThemeContext = createContext<DebugThemeContextType | undefined>(undefined);

export const DebugThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };

  // Classes to apply depending on debug mode
  const containerClass = isDebugMode ? 'bg-blue-100' : 'bg-background';
  const contentClass = isDebugMode ? 'bg-pink-100' : '';

  const value = {
    isDebugMode,
    toggleDebugMode,
    containerClass,
    contentClass
  };

  return (
    <DebugThemeContext.Provider value={value}>
      {children}
    </DebugThemeContext.Provider>
  );
};

export const useDebugTheme = () => {
  const context = useContext(DebugThemeContext);
  if (context === undefined) {
    throw new Error('useDebugTheme must be used within a DebugThemeProvider');
  }
  return context;
};