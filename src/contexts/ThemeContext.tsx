// src/contexts/ThemeContext.tsx
// Version: 1.1.0
// Last Modified: 05-04-2025 14:45 IST
// Purpose: Add vibrant theme option to existing theme context

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'ocean' | 'sunset' | 'vibrant';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'ocean';
  });

  useEffect(() => {
    // Immediately update the document's data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}