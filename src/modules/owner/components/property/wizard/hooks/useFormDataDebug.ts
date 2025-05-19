// src/modules/owner/components/property/wizard/hooks/useFormDataDebug.ts
// Version: 1.0.0
// Last Modified: 18-05-2025 20:45 IST
// Purpose: Hook to manage form data debug state

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

export function useFormDataDebug(form: UseFormReturn<FormData>) {
  const [isDebugVisible, setIsDebugVisible] = useState(process.env.NODE_ENV === 'development');
  
  useEffect(() => {
    // Check for keyboard shortcuts to toggle debug visibility
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+D to toggle debug panel
      if (e.altKey && e.key === 'd') {
        setIsDebugVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const toggleDebug = () => {
    setIsDebugVisible(prev => !prev);
  };
  
  return {
    isDebugVisible,
    toggleDebug,
    form
  };
}