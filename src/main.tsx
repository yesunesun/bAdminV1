import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Debug functions for property code testing - load dynamically to avoid build errors
if (typeof window !== 'undefined') {
  // Load debug functions dynamically when needed
  (window as any).loadDebugFunctions = async () => {
    try {
      const { quickTest, addTestCode } = await import('./debug/quickTest');
      (window as any).quickTest = quickTest;
      (window as any).addTestCode = addTestCode;
      console.log('✅ Debug functions loaded successfully');
      console.log('Available functions: quickTest(), addTestCode()');
    } catch (error) {
      console.error('❌ Error loading debug functions:', error);
    }
  };
  
  // Auto-load debug functions
  (window as any).loadDebugFunctions();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);